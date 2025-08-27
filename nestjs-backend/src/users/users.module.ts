import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

/**
 * Users module for user session management
 * 
 * Features:
 * - User session tracking and management
 * - Activity monitoring and presence detection
 * - Session cleanup and maintenance
 * - User statistics and analytics
 */
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}