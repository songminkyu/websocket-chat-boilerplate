import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ChatModule } from './chat/chat.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root application module
 * 
 * Configures all feature modules and global services:
 * - Chat module for WebSocket messaging
 * - Rooms module for room management  
 * - Users module for session tracking
 * - Rate limiting with Throttler
 */
@Module({
  imports: [
    // Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 10, // 10 requests per second
      },
      {
        name: 'medium', 
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
      {
        name: 'long',
        ttl: 300000, // 5 minutes  
        limit: 300, // 300 requests per 5 minutes
      },
    ]),
    
    // Feature modules
    ChatModule,
    RoomsModule, 
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}