import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

/**
 * Bootstrap the NestJS WebSocket Chat application
 * 
 * Features:
 * - WebSocket/Socket.IO integration
 * - Global validation pipes
 * - CORS configuration for frontend
 * - Request logging and error handling
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule);
    
    // Configure CORS for frontend connections
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000'
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    // Use Socket.IO adapter for WebSocket connections
    app.useWebSocketAdapter(new IoAdapter(app));

    // Global validation pipe for DTOs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties not in DTO
        forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
        transform: true, // Transform payloads to DTO instances
        disableErrorMessages: process.env.NODE_ENV === 'production',
        validationError: {
          target: false,
          value: false,
        },
      }),
    );

    // Set global API prefix
    app.setGlobalPrefix('api', {
      exclude: ['/health', '/'] // Exclude health check and root
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);

    logger.log('🚀 NestJS WebSocket Chat Server started successfully!');
    logger.log(`🌐 Server running on: http://localhost:${port}`);
    logger.log(`📡 WebSocket endpoint: ws://localhost:${port}/socket.io`);
    logger.log(`🔗 REST API available at: http://localhost:${port}/api`);
    logger.log(`🏥 Health check: http://localhost:${port}/health`);
    
    // Log environment info
    logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`📦 Node.js version: ${process.version}`);
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();