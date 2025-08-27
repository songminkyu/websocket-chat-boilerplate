import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RoomsService } from '../rooms/rooms.service';
import { UsersService } from '../users/users.service';
import { ChatMessage, MessageType } from './interfaces/chat.interface';

/**
 * Service for handling chat message processing and business logic
 * 
 * Manages message validation, processing, and coordination with
 * room and user services for comprehensive chat functionality.
 */
@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly roomsService: RoomsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Process and validate chat message
   */
  async processMessage(messageData: {
    roomId: string;
    sender: string;
    content: string;
    sessionId: string;
  }): Promise<ChatMessage> {
    const { roomId, sender, content, sessionId } = messageData;

    try {
      // Validate message content
      const sanitizedContent = this.sanitizeContent(content);
      
      if (!this.isValidMessage(sanitizedContent, sender, roomId)) {
        throw new Error('Invalid message content');
      }

      // Create chat message
      const message: ChatMessage = {
        id: uuidv4(),
        roomId,
        sender,
        content: sanitizedContent,
        type: MessageType.CHAT,
        timestamp: new Date().toISOString(),
      };

      // Update room message count
      await this.roomsService.incrementMessageCount(roomId);

      // Update user activity
      await this.usersService.updateUserActivity(sessionId);

      this.logger.log(`📝 Processed message from ${sender} in room ${roomId}`);

      return message;

    } catch (error) {
      this.logger.error(`❌ Error processing message: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Handle user joining room
   */
  async handleUserJoin(
    roomId: string,
    username: string,
    sessionId: string,
  ): Promise<ChatMessage> {
    try {
      // Add user to room
      await this.roomsService.addUserToRoom(roomId, username, sessionId);

      // Create join message
      const joinMessage: ChatMessage = {
        id: uuidv4(),
        roomId,
        sender: username,
        content: `${username} joined the room`,
        type: MessageType.JOIN,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`👋 User ${username} joined room ${roomId}`);

      return joinMessage;

    } catch (error) {
      this.logger.error(`❌ Error handling user join: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Handle user leaving room
   */
  async handleUserLeave(
    roomId: string,
    username: string,
    sessionId: string,
  ): Promise<ChatMessage> {
    try {
      // Remove user from room
      await this.roomsService.removeUserFromRoom(roomId, sessionId);

      // Create leave message
      const leaveMessage: ChatMessage = {
        id: uuidv4(),
        roomId,
        sender: username,
        content: `${username} left the room`,
        type: MessageType.LEAVE,
        timestamp: new Date().toISOString(),
      };

      this.logger.log(`👋 User ${username} left room ${roomId}`);

      return leaveMessage;

    } catch (error) {
      this.logger.error(`❌ Error handling user leave: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Create system message
   */
  createSystemMessage(roomId: string, content: string): ChatMessage {
    return {
      id: uuidv4(),
      roomId,
      sender: 'System',
      content,
      type: MessageType.SYSTEM,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate message content and structure
   */
  private isValidMessage(content: string, sender: string, roomId: string): boolean {
    // Check required fields
    if (!content?.trim() || !sender?.trim() || !roomId?.trim()) {
      return false;
    }

    // Check message length limits
    if (content.length < 1 || content.length > 1000) {
      return false;
    }

    // Check sender username format (alphanumeric + underscore)
    const usernamePattern = /^[a-zA-Z0-9_]{3,50}$/;
    if (!usernamePattern.test(sender)) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize message content to prevent XSS and other attacks
   */
  private sanitizeContent(content: string): string {
    if (!content) return '';

    return content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .replace(/\\/g, '&#x5C;')
      .trim();
  }

  /**
   * Get message statistics
   */
  async getMessageStats(): Promise<object> {
    try {
      const roomStats = await this.roomsService.getStats();
      const userStats = await this.usersService.getStats();

      return {
        totalMessages: roomStats.totalMessages,
        totalRooms: roomStats.totalRooms,
        totalUsers: userStats.totalSessions,
        activeUsers: userStats.activeSessions,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      this.logger.error(`❌ Error getting message stats: ${error.message}`, error);
      return {
        error: 'Unable to retrieve statistics',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Clean up old messages (placeholder for future database implementation)
   */
  async cleanupOldMessages(olderThanHours: number = 24): Promise<number> {
    // This would be implemented when we add database persistence
    this.logger.log(`🧹 Message cleanup called (${olderThanHours}h threshold)`);
    return 0;
  }

  /**
   * Broadcast system announcement to all rooms
   */
  createSystemAnnouncement(content: string): ChatMessage {
    return {
      id: uuidv4(),
      roomId: 'system',
      sender: 'System',
      content,
      type: MessageType.SYSTEM,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Validate room access (placeholder for future authentication)
   */
  async canUserAccessRoom(userId: string, roomId: string): Promise<boolean> {
    // For now, all users can access all rooms
    // This will be enhanced when authentication is added
    return true;
  }

  /**
   * Get message history for room (placeholder for future database implementation)
   */
  async getMessageHistory(roomId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    // This would be implemented when we add database persistence
    this.logger.log(`📚 Message history requested for room ${roomId} (limit: ${limit}, offset: ${offset})`);
    return [];
  }
}