import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Logger,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/create-room.dto';
import { ChatRoom } from './interfaces/room.interface';
import { UserSession } from '../chat/interfaces/chat.interface';

/**
 * REST API controller for room management
 * 
 * Provides HTTP endpoints for:
 * - Room creation, listing, and management
 * - User membership and statistics
 * - Room search and filtering
 * - Administrative operations
 */
@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(private readonly roomsService: RoomsService) {}

  /**
   * Get all chat rooms
   * GET /api/rooms
   */
  @Get()
  async getAllRooms(@Query('search') search?: string): Promise<ChatRoom[]> {
    try {
      if (search) {
        this.logger.log(`🔍 Searching rooms with query: ${search}`);
        return await this.roomsService.searchRooms(search);
      }

      const rooms = await this.roomsService.getAllRooms();
      this.logger.log(`📋 Retrieved ${rooms.length} rooms`);
      return rooms;
      
    } catch (error) {
      this.logger.error(`❌ Error retrieving rooms: ${error.message}`, error);
      throw new HttpException(
        'Failed to retrieve rooms',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a new chat room
   * POST /api/rooms
   */
  @Post()
  async createRoom(@Body() createRoomDto: CreateRoomDto): Promise<ChatRoom> {
    try {
      const room = await this.roomsService.createRoom(createRoomDto);
      this.logger.log(`🏗️ Created new room: ${room.name} (ID: ${room.id})`);
      return room;
      
    } catch (error) {
      this.logger.error(`❌ Error creating room: ${error.message}`, error);
      throw new HttpException(
        'Failed to create room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get room details by ID
   * GET /api/rooms/:id
   */
  @Get(':id')
  async getRoom(@Param('id') id: string): Promise<ChatRoom> {
    try {
      const room = await this.roomsService.getRoom(id);
      
      if (!room) {
        this.logger.warn(`⚠️ Room not found: ${id}`);
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      
      this.logger.log(`📄 Retrieved room details: ${id}`);
      return room;
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`❌ Error retrieving room ${id}: ${error.message}`, error);
      throw new HttpException(
        'Failed to retrieve room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update room information
   * PUT /api/rooms/:id
   */
  @Put(':id')
  async updateRoom(
    @Param('id') id: string,
    @Body() updateRoomDto: UpdateRoomDto,
  ): Promise<ChatRoom> {
    try {
      const room = await this.roomsService.updateRoom(id, updateRoomDto);
      this.logger.log(`📝 Updated room: ${id}`);
      return room;
      
    } catch (error) {
      if (error.message.includes('not found')) {
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      
      this.logger.error(`❌ Error updating room ${id}: ${error.message}`, error);
      throw new HttpException(
        'Failed to update room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a room
   * DELETE /api/rooms/:id
   */
  @Delete(':id')
  async deleteRoom(@Param('id') id: string): Promise<{ deleted: boolean; roomId: string; message?: string }> {
    try {
      const deleted = await this.roomsService.deleteRoom(id);
      
      if (deleted) {
        this.logger.log(`🗑️ Deleted room: ${id}`);
        return {
          deleted: true,
          roomId: id,
          message: 'Room deleted successfully',
        };
      } else {
        this.logger.warn(`⚠️ Room not found for deletion: ${id}`);
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`❌ Error deleting room ${id}: ${error.message}`, error);
      throw new HttpException(
        'Failed to delete room',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get users in a specific room
   * GET /api/rooms/:id/users
   */
  @Get(':id/users')
  async getRoomUsers(@Param('id') id: string): Promise<UserSession[]> {
    try {
      const roomExists = await this.roomsService.roomExists(id);
      if (!roomExists) {
        this.logger.warn(`⚠️ Room not found for users request: ${id}`);
        throw new HttpException('Room not found', HttpStatus.NOT_FOUND);
      }
      
      const users = await this.roomsService.getRoomUsers(id);
      this.logger.log(`👥 Retrieved ${users.length} users for room ${id}`);
      return users;
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`❌ Error retrieving users for room ${id}: ${error.message}`, error);
      throw new HttpException(
        'Failed to retrieve room users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get system statistics
   * GET /api/rooms/stats
   */
  @Get('system/stats')
  async getSystemStats(): Promise<object> {
    try {
      const stats = await this.roomsService.getStats();
      this.logger.log(`📊 Retrieved system stats: ${stats.totalRooms} rooms, ${stats.totalUsers} users`);
      return stats;
      
    } catch (error) {
      this.logger.error(`❌ Error retrieving system stats: ${error.message}`, error);
      throw new HttpException(
        'Failed to retrieve system statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Clean up inactive users (Admin endpoint)
   * POST /api/rooms/cleanup
   */
  @Post('system/cleanup')
  async cleanupInactiveUsers(
    @Query('inactiveMinutes', new DefaultValuePipe(30), ParseIntPipe) 
    inactiveMinutes: number,
  ): Promise<{ sessionsRemoved: number; inactiveMinutes: number; timestamp: string }> {
    try {
      // Validate input
      if (inactiveMinutes < 1 || inactiveMinutes > 1440) { // Max 24 hours
        throw new HttpException(
          'Invalid inactive minutes. Must be between 1 and 1440',
          HttpStatus.BAD_REQUEST,
        );
      }

      const sessionsRemoved = await this.roomsService.cleanupInactiveUsers(inactiveMinutes);
      
      const result = {
        sessionsRemoved,
        inactiveMinutes,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`🧹 Manual cleanup completed: ${sessionsRemoved} sessions removed`);
      return result;
      
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      this.logger.error(`❌ Error during manual cleanup: ${error.message}`, error);
      throw new HttpException(
        'Failed to cleanup inactive users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for rooms service
   * GET /api/rooms/health
   */
  @Get('system/health')
  async getHealthCheck(): Promise<object> {
    try {
      const stats = await this.roomsService.getStats();
      
      return {
        status: 'UP',
        service: 'rooms-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        stats: {
          totalRooms: stats.totalRooms,
          totalActiveUsers: stats.totalUsers,
          totalMessages: stats.totalMessages,
        },
        uptime: Math.floor(process.uptime()),
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        },
      };
      
    } catch (error) {
      this.logger.error(`❌ Health check failed: ${error.message}`, error);
      throw new HttpException(
        'Health check failed',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}