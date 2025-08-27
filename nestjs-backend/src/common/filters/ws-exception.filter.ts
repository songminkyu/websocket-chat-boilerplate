import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * WebSocket exception filter for handling WebSocket-specific errors
 * 
 * Provides centralized error handling for WebSocket connections:
 * - Catches and formats WebSocket exceptions
 * - Logs errors for debugging and monitoring
 * - Sends user-friendly error messages to clients
 * - Prevents sensitive information leakage
 */
@Catch(WsException)
export class WsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(WsExceptionFilter.name);

  catch(exception: WsException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const error = exception.getError();
    const clientId = client.id;
    const username = client.data?.username || 'anonymous';

    // Log the error for debugging
    this.logger.error(
      `🚨 WebSocket error for client ${clientId} (${username}): ${JSON.stringify(error)}`,
      exception.stack,
    );

    // Extract error details
    let errorMessage = 'An unexpected error occurred';
    let errorCode = 'UNKNOWN_ERROR';
    let statusCode = 500;

    if (typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = error.message || errorMessage;
      errorCode = error.code || errorCode;
      statusCode = error.statusCode || statusCode;
    }

    // Create error response
    const errorResponse = {
      event: 'error',
      message: errorMessage,
      code: errorCode,
      statusCode,
      timestamp: new Date().toISOString(),
      clientId,
    };

    // Send error to specific client
    client.emit('error', errorResponse);

    // Don't propagate the error further to prevent disconnection
    // unless it's a critical error
    if (statusCode >= 500) {
      this.logger.error(`🔥 Critical WebSocket error for ${username}: ${errorMessage}`);
    }
  }
}

/**
 * HTTP to WebSocket exception converter
 * Converts standard HTTP exceptions to WebSocket exceptions
 */
export class HttpToWsExceptionFilter extends BaseWsExceptionFilter {
  private readonly logger = new Logger(HttpToWsExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const clientId = client.id;
    const username = client.data?.username || 'anonymous';

    let errorMessage = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;

    // Handle different types of exceptions
    if (exception.response) {
      // HTTP exception
      errorMessage = exception.response.message || exception.message;
      errorCode = exception.response.error || 'HTTP_ERROR';
      statusCode = exception.response.statusCode || exception.status || 500;
    } else if (exception.message) {
      // General exception
      errorMessage = exception.message;
    }

    this.logger.error(
      `🚨 Exception converted to WebSocket error for ${username}: ${errorMessage}`,
      exception.stack,
    );

    const errorResponse = {
      event: 'error',
      message: errorMessage,
      code: errorCode,
      statusCode,
      timestamp: new Date().toISOString(),
      clientId,
    };

    client.emit('error', errorResponse);
  }
}