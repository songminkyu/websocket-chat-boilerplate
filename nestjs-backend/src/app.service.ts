import { Injectable } from '@nestjs/common';

/**
 * Application root service
 * 
 * Provides basic application information and health status
 */
@Injectable()
export class AppService {
  
  /**
   * Get health check information
   */
  getHealthCheck(): object {
    const uptime = Math.floor(process.uptime());
    const memoryUsage = process.memoryUsage();
    
    return {
      status: 'UP',
      service: 'nestjs-websocket-chat',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: uptime,
        human: this.formatUptime(uptime),
      },
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      },
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
    };
  }

  /**
   * Get API information
   */
  getApiInfo(): object {
    return {
      name: 'NestJS WebSocket Chat API',
      version: '1.0.0',
      description: 'Real-time chat platform with WebSocket/Socket.IO support',
      endpoints: {
        health: '/health',
        api: '/api',
        websocket: '/socket.io',
        swagger: '/api/docs', // Future: Swagger documentation
      },
      features: [
        'Real-time messaging with Socket.IO',
        'Room-based chat system',
        'User presence tracking',
        'Message validation and sanitization',
        'Rate limiting and security',
        'REST API for room management',
      ],
      documentation: 'https://github.com/your-org/websocket-chat',
      support: 'support@yourcompany.com',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format uptime in human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}