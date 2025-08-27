import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Socket } from 'socket.io';

/**
 * WebSocket logging interceptor
 * 
 * Provides comprehensive logging for WebSocket operations:
 * - Request/response logging with timing
 * - User activity tracking
 * - Error logging and monitoring
 * - Performance metrics collection
 * - Security event logging
 */
@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(WsLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    const methodName = context.getHandler().name;
    const className = context.getClass().name;
    
    const clientId = client.id;
    const username = client.data?.username || 'anonymous';
    const roomId = client.data?.roomId || 'none';
    const startTime = Date.now();

    // Create request context
    const requestContext = {
      clientId,
      username,
      roomId,
      method: methodName,
      className,
      timestamp: new Date().toISOString(),
      userAgent: client.handshake.headers['user-agent'],
      ip: client.handshake.address,
    };

    // Log incoming request
    this.logRequest(requestContext, data);

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        this.logResponse(requestContext, response, duration);
        this.trackUserActivity(requestContext, duration);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logError(requestContext, error, duration);
        throw error;
      }),
    );
  }

  /**
   * Log incoming WebSocket request
   */
  private logRequest(context: any, data: any): void {
    const sanitizedData = this.sanitizeData(data);
    
    this.logger.log(
      `📥 WS Request: ${context.className}.${context.method} | ` +
      `Client: ${context.username} (${context.clientId}) | ` +
      `Room: ${context.roomId} | ` +
      `Data: ${JSON.stringify(sanitizedData)}`
    );

    // Log detailed info in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`🔍 Request Context: ${JSON.stringify({
        ...context,
        data: sanitizedData,
      }, null, 2)}`);
    }
  }

  /**
   * Log WebSocket response
   */
  private logResponse(context: any, response: any, duration: number): void {
    const responseInfo = response ? this.sanitizeData(response) : 'void';
    
    this.logger.log(
      `📤 WS Response: ${context.className}.${context.method} | ` +
      `Client: ${context.username} | ` +
      `Duration: ${duration}ms | ` +
      `Response: ${typeof response === 'object' ? 'Object' : String(response)}`
    );

    // Performance warning for slow operations
    if (duration > 1000) {
      this.logger.warn(
        `⚠️ Slow WebSocket operation: ${context.method} took ${duration}ms for ${context.username}`
      );
    }

    // Log response details in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`🔍 Response Data: ${JSON.stringify(responseInfo, null, 2)}`);
    }
  }

  /**
   * Log WebSocket errors
   */
  private logError(context: any, error: any, duration: number): void {
    const errorInfo = {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };

    this.logger.error(
      `❌ WS Error: ${context.className}.${context.method} | ` +
      `Client: ${context.username} (${context.clientId}) | ` +
      `Duration: ${duration}ms | ` +
      `Error: ${error.message}`,
      error.stack
    );

    // Log security-related errors with more detail
    if (this.isSecurityError(error)) {
      this.logger.warn(
        `🚨 Security Event: ${context.method} | ` +
        `Client: ${context.username} | ` +
        `IP: ${context.ip} | ` +
        `Error: ${error.message}`
      );
    }

    // Log error context in debug mode
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`🔍 Error Context: ${JSON.stringify({
        ...context,
        error: errorInfo,
      }, null, 2)}`);
    }
  }

  /**
   * Track user activity for analytics
   */
  private trackUserActivity(context: any, duration: number): void {
    // This could be enhanced to send metrics to an analytics service
    const activityEvent = {
      type: 'websocket_activity',
      user: context.username,
      method: context.method,
      room: context.roomId,
      duration,
      timestamp: Date.now(),
    };

    // For now, just log activity events
    this.logger.debug(`📊 Activity: ${JSON.stringify(activityEvent)}`);

    // TODO: Send to analytics service
    // this.analyticsService.track(activityEvent);
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'secret',
      'apiKey',
      'privateKey',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Check if error is security-related
   */
  private isSecurityError(error: any): boolean {
    const securityKeywords = [
      'unauthorized',
      'forbidden',
      'authentication',
      'authorization',
      'invalid token',
      'access denied',
      'permission denied',
    ];

    const errorMessage = error.message?.toLowerCase() || '';
    return securityKeywords.some(keyword => errorMessage.includes(keyword));
  }

  /**
   * Generate request correlation ID for tracking
   */
  private generateCorrelationId(): string {
    return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get client connection info
   */
  private getConnectionInfo(client: Socket): {
    ip: string;
    userAgent: string;
    connected: boolean;
    rooms: string[];
  } {
    return {
      ip: client.handshake.address,
      userAgent: client.handshake.headers['user-agent'] || 'unknown',
      connected: client.connected,
      rooms: Array.from(client.rooms),
    };
  }

  /**
   * Log connection events
   */
  logConnection(client: Socket, event: 'connect' | 'disconnect'): void {
    const connectionInfo = this.getConnectionInfo(client);
    const username = client.data?.username || 'anonymous';
    
    if (event === 'connect') {
      this.logger.log(
        `🔗 Client Connected: ${username} (${client.id}) | ` +
        `IP: ${connectionInfo.ip} | ` +
        `UA: ${connectionInfo.userAgent}`
      );
    } else {
      this.logger.log(
        `🔌 Client Disconnected: ${username} (${client.id}) | ` +
        `Rooms: ${connectionInfo.rooms.join(', ')}`
      );
    }
  }

  /**
   * Log room events
   */
  logRoomEvent(
    client: Socket,
    event: 'join' | 'leave',
    roomId: string,
    additionalInfo?: any
  ): void {
    const username = client.data?.username || 'anonymous';
    
    this.logger.log(
      `🏠 Room ${event === 'join' ? 'Join' : 'Leave'}: ${username} | ` +
      `Room: ${roomId} | ` +
      `Client: ${client.id}` +
      (additionalInfo ? ` | Info: ${JSON.stringify(additionalInfo)}` : '')
    );
  }

  /**
   * Log message events
   */
  logMessage(
    client: Socket,
    messageType: string,
    roomId: string,
    contentLength: number
  ): void {
    const username = client.data?.username || 'anonymous';
    
    this.logger.log(
      `💬 Message ${messageType}: ${username} | ` +
      `Room: ${roomId} | ` +
      `Length: ${contentLength} chars | ` +
      `Client: ${client.id}`
    );
  }
}