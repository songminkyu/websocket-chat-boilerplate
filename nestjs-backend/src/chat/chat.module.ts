import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from '../users/users.module';

/**
 * Chat module providing WebSocket messaging functionality
 * 
 * Features:
 * - Real-time message processing via WebSocket Gateway
 * - Message validation and sanitization
 * - Integration with rooms and users services
 * - STOMP-compatible message handling
 */
@Module({
  imports: [RoomsModule, UsersModule],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}