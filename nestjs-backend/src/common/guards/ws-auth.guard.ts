import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';

/**
 * WebSocket authentication guard (Future implementation)
 * 
 * Provides authentication and authorization for WebSocket connections:
 * - JWT token validation for WebSocket handshake
 * - Session-based authentication
 * - User permission validation
 * - Room access control
 * 
 * Currently allows all connections for development.
 * Will be enhanced with proper authentication in future iterations.
 */
@Injectable()
export class WsAuthGuard implements CanActivate {
  private readonly logger = new Logger(WsAuthGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client = context.switchToWs().getClient<Socket>();
    const data = context.switchToWs().getData();
    
    // For development, allow all connections
    // TODO: Implement proper JWT authentication
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    return this.validateConnection(client, data);
  }

  /**
   * Validate WebSocket connection and extract user info
   */
  private async validateConnection(client: Socket, data: any): Promise<boolean> {
    try {
      // Extract authentication info from handshake
      const token = this.extractToken(client);
      const userId = this.extractUserId(client);

      if (!token && !userId) {
        this.logger.warn(`🚫 Unauthorized connection attempt: ${client.id}`);
        client.emit('authError', {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
          timestamp: new Date().toISOString(),
        });
        return false;
      }

      // TODO: Validate JWT token
      const isValidToken = await this.validateJwtToken(token);
      if (!isValidToken) {
        this.logger.warn(`🚫 Invalid token for client: ${client.id}`);
        client.emit('authError', {
          message: 'Invalid authentication token',
          code: 'INVALID_TOKEN',
          timestamp: new Date().toISOString(),
        });
        return false;
      }

      // TODO: Load user permissions
      const userPermissions = await this.getUserPermissions(userId);
      
      // Store auth info in client data
      client.data = {
        ...client.data,
        userId,
        permissions: userPermissions,
        authenticated: true,
      };

      this.logger.log(`✅ Authenticated client: ${client.id} (User: ${userId})`);
      return true;

    } catch (error) {
      this.logger.error(`❌ Authentication error for ${client.id}:`, error);
      client.emit('authError', {
        message: 'Authentication failed',
        code: 'AUTH_ERROR',
        timestamp: new Date().toISOString(),
      });
      return false;
    }
  }

  /**
   * Extract JWT token from WebSocket handshake
   */
  private extractToken(client: Socket): string | null {
    // Check authorization header
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check query parameters
    const tokenQuery = client.handshake.query.token;
    if (typeof tokenQuery === 'string') {
      return tokenQuery;
    }

    // Check auth object in handshake
    const authObject = client.handshake.auth;
    if (authObject && authObject.token) {
      return authObject.token;
    }

    return null;
  }

  /**
   * Extract user ID from various sources
   */
  private extractUserId(client: Socket): string | null {
    // Check query parameters
    const userIdQuery = client.handshake.query.userId;
    if (typeof userIdQuery === 'string') {
      return userIdQuery;
    }

    // Check auth object
    const authObject = client.handshake.auth;
    if (authObject && authObject.userId) {
      return authObject.userId;
    }

    return null;
  }

  /**
   * Validate JWT token (placeholder implementation)
   */
  private async validateJwtToken(token: string | null): Promise<boolean> {
    if (!token) {
      return false;
    }

    try {
      // TODO: Implement proper JWT validation
      // const payload = jwt.verify(token, process.env.JWT_SECRET);
      // return payload && payload.sub;
      
      // For now, accept any non-empty token in development
      return process.env.NODE_ENV === 'development';
      
    } catch (error) {
      this.logger.error('JWT validation failed:', error);
      return false;
    }
  }

  /**
   * Get user permissions (placeholder implementation)
   */
  private async getUserPermissions(userId: string | null): Promise<string[]> {
    if (!userId) {
      return [];
    }

    // TODO: Load permissions from database
    // const user = await this.userRepository.findById(userId);
    // return user?.permissions || [];

    // For development, return basic permissions
    return ['chat.send', 'room.join', 'room.create'];
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(client: Socket, permission: string): boolean {
    const permissions = client.data?.permissions || [];
    return permissions.includes(permission) || permissions.includes('*');
  }

  /**
   * Check if user can access specific room
   */
  canAccessRoom(client: Socket, roomId: string): boolean {
    // TODO: Implement room-level access control
    // - Check if room is private
    // - Validate user membership
    // - Check room permissions
    
    // For now, allow access to all rooms
    return true;
  }

  /**
   * Extract user info from authenticated client
   */
  getUserInfo(client: Socket): {
    userId: string | null;
    username: string | null;
    permissions: string[];
    authenticated: boolean;
  } {
    return {
      userId: client.data?.userId || null,
      username: client.data?.username || null,
      permissions: client.data?.permissions || [],
      authenticated: client.data?.authenticated || false,
    };
  }

  /**
   * Force disconnect unauthenticated client
   */
  disconnectClient(client: Socket, reason: string = 'Authentication required'): void {
    this.logger.warn(`🚫 Disconnecting client ${client.id}: ${reason}`);
    
    client.emit('forceDisconnect', {
      reason,
      timestamp: new Date().toISOString(),
    });
    
    setTimeout(() => {
      client.disconnect(true);
    }, 1000); // Give client time to receive message
  }
}