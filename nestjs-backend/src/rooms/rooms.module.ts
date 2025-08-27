import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

/**
 * Rooms module for chat room management
 * 
 * Features:
 * - Room creation, update, and deletion
 * - User membership management
 * - Room statistics and monitoring
 * - Search and filtering capabilities
 * - REST API endpoints for room operations
 */
@Module({
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}