import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChatRoom, CreateRoomDto, RoomStats } from './interfaces/room.interface';
import { UserSession } from '../chat/interfaces/chat.interface';

/**
 * Service for managing chat rooms and user membership
 * 
 * Handles room creation, user management, and room state tracking
 * using in-memory storage with thread-safe operations.
 */
@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  
  // In-memory storage for chat rooms (would be replaced with database in production)
  private readonly rooms = new Map<string, ChatRoom>();

  constructor() {
    // Create default room
    this.createDefaultRoom();
  }

  /**
   * Create a new chat room
   */
  async createRoom(createRoomDto: CreateRoomDto): Promise<ChatRoom> {
    const { name, description, isPrivate = false } = createRoomDto;

    const room: ChatRoom = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      activeUsers: [],
      messageCount: 0,
      isPrivate,
    };

    this.rooms.set(room.id, room);

    this.logger.log(`🏗️ Created room: ${name} (ID: ${room.id})`);
    return room;
  }

  /**
   * Get room by ID
   */
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    return this.rooms.get(roomId) || null;
  }

  /**
   * Get all rooms
   */
  async getAllRooms(): Promise<ChatRoom[]> {
    return Array.from(this.rooms.values());
  }

  /**
   * Delete room by ID
   */
  async deleteRoom(roomId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    // Don't allow deletion of default room
    if (roomId === 'general') {
      this.logger.warn(`⚠️ Attempted to delete default room: ${roomId}`);
      return false;
    }

    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      this.logger.log(`🗑️ Deleted room: ${room.name} (ID: ${roomId})`);
    }

    return deleted;
  }

  /**
   * Add user to room
   */
  async addUserToRoom(roomId: string, username: string, sessionId: string): Promise<boolean> {
    let room = this.rooms.get(roomId);
    
    // Create room if it doesn't exist
    if (!room) {
      room = await this.createDefaultRoomWithId(roomId);
    }

    // Check if user is already in room
    const existingUser = room.activeUsers.find(user => user.sessionId === sessionId);
    if (existingUser) {
      // Update existing user info
      existingUser.username = username;
      existingUser.lastActivity = new Date().toISOString();
      existingUser.isActive = true;
      this.logger.log(`🔄 Updated existing user ${username} in room ${roomId}`);
      return true;
    }

    // Add new user
    const userSession: UserSession = {
      sessionId,
      username,
      joinedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      roomId,
    };

    room.activeUsers.push(userSession);

    this.logger.log(`➕ Added user ${username} to room ${roomId} (Session: ${sessionId})`);
    return true;
  }

  /**
   * Remove user from room
   */
  async removeUserFromRoom(roomId: string, sessionId: string): Promise<boolean> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return false;
    }

    const userIndex = room.activeUsers.findIndex(user => user.sessionId === sessionId);
    if (userIndex === -1) {
      return false;
    }

    const user = room.activeUsers[userIndex];
    room.activeUsers.splice(userIndex, 1);

    this.logger.log(`➖ Removed user ${user.username} from room ${roomId} (Session: ${sessionId})`);

    // Clean up empty rooms (except default rooms)
    if (room.activeUsers.length === 0 && !this.isDefaultRoom(roomId)) {
      this.rooms.delete(roomId);
      this.logger.log(`🧹 Cleaned up empty room: ${roomId}`);
    }

    return true;
  }

  /**
   * Increment message count for room
   */
  async incrementMessageCount(roomId: string): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.messageCount++;
    }
  }

  /**
   * Get users in room
   */
  async getRoomUsers(roomId: string): Promise<UserSession[]> {
    const room = this.rooms.get(roomId);
    return room ? [...room.activeUsers] : [];
  }

  /**
   * Get room user count
   */
  async getRoomUserCount(roomId: string): Promise<number> {
    const room = this.rooms.get(roomId);
    return room ? room.activeUsers.length : 0;
  }

  /**
   * Check if room exists
   */
  async roomExists(roomId: string): Promise<boolean> {
    return this.rooms.has(roomId);
  }

  /**
   * Get room statistics
   */
  async getStats(): Promise<RoomStats> {
    const rooms = Array.from(this.rooms.values());
    
    const totalRooms = rooms.length;
    const totalUsers = rooms.reduce((sum, room) => sum + room.activeUsers.length, 0);
    const totalMessages = rooms.reduce((sum, room) => sum + room.messageCount, 0);

    return {
      totalRooms,
      totalUsers,
      totalMessages,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Clean up inactive users across all rooms
   */
  async cleanupInactiveUsers(inactiveMinutes: number = 30): Promise<number> {
    let cleanedUp = 0;
    const cutoffTime = new Date(Date.now() - inactiveMinutes * 60 * 1000);

    for (const [roomId, room] of this.rooms.entries()) {
      const initialUserCount = room.activeUsers.length;
      
      // Remove inactive users
      room.activeUsers = room.activeUsers.filter(user => {
        const lastActivity = new Date(user.lastActivity);
        const isActive = lastActivity > cutoffTime;
        
        if (!isActive) {
          this.logger.log(`🧹 Cleaned up inactive user: ${user.username} from room ${roomId}`);
          cleanedUp++;
        }
        
        return isActive;
      });

      // Clean up empty rooms (except default ones)
      if (room.activeUsers.length === 0 && !this.isDefaultRoom(roomId)) {
        this.rooms.delete(roomId);
        this.logger.log(`🧹 Cleaned up empty room: ${roomId}`);
      }
    }

    if (cleanedUp > 0) {
      this.logger.log(`🧹 Cleanup completed: ${cleanedUp} inactive users removed`);
    }

    return cleanedUp;
  }

  /**
   * Find rooms by name (case-insensitive search)
   */
  async searchRooms(query: string): Promise<ChatRoom[]> {
    if (!query?.trim()) {
      return this.getAllRooms();
    }

    const searchTerm = query.toLowerCase();
    const rooms = Array.from(this.rooms.values());
    
    return rooms.filter(room => 
      room.name.toLowerCase().includes(searchTerm) ||
      room.description?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Update room information
   */
  async updateRoom(roomId: string, updates: Partial<CreateRoomDto>): Promise<ChatRoom> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // Update allowed fields
    if (updates.name !== undefined) {
      room.name = updates.name;
    }
    if (updates.description !== undefined) {
      room.description = updates.description;
    }
    if (updates.isPrivate !== undefined) {
      room.isPrivate = updates.isPrivate;
    }

    this.logger.log(`📝 Updated room: ${roomId}`);
    return room;
  }

  /**
   * Check if room ID represents a default room
   */
  private isDefaultRoom(roomId: string): boolean {
    return ['general', 'lobby', 'main'].includes(roomId.toLowerCase());
  }

  /**
   * Create default room on startup
   */
  private createDefaultRoom(): void {
    const defaultRoom: ChatRoom = {
      id: 'general',
      name: 'General Chat',
      description: 'Welcome to the general chat room!',
      createdAt: new Date().toISOString(),
      activeUsers: [],
      messageCount: 0,
      isPrivate: false,
    };

    this.rooms.set(defaultRoom.id, defaultRoom);
    this.logger.log(`🏠 Created default room: ${defaultRoom.name}`);
  }

  /**
   * Create a default room with specific ID if it doesn't exist
   */
  private async createDefaultRoomWithId(roomId: string): Promise<ChatRoom> {
    const room: ChatRoom = {
      id: roomId,
      name: `Room ${roomId.substring(0, 8)}`,
      description: 'Auto-created room',
      createdAt: new Date().toISOString(),
      activeUsers: [],
      messageCount: 0,
      isPrivate: false,
    };

    this.rooms.set(roomId, room);
    this.logger.log(`🏗️ Auto-created room: ${room.name} (ID: ${roomId})`);
    
    return room;
  }
}