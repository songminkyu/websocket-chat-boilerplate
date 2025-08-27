import { UserSession } from '../../chat/interfaces/chat.interface';

/**
 * Room-related interfaces for NestJS backend
 */

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601 format
  activeUsers: UserSession[];
  messageCount: number;
  isPrivate: boolean;
}

export interface CreateRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

export interface RoomStats {
  totalRooms: number;
  totalUsers: number;
  totalMessages: number;
  timestamp: string;
}