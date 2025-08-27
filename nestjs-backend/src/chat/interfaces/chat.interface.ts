/**
 * Chat-related interfaces and types for NestJS backend
 */

export enum MessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE', 
  SYSTEM = 'SYSTEM'
}

export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  type: MessageType;
  timestamp: string; // ISO 8601 format
}

export interface UserSession {
  sessionId: string;
  username: string;
  joinedAt: string; // ISO 8601 format
  lastActivity: string; // ISO 8601 format
  isActive: boolean;
  roomId?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  createdAt: string; // ISO 8601 format
  activeUsers: UserSession[];
  messageCount: number;
  isPrivate: boolean;
}

export interface UserStatusMessage {
  username: string;
  status: 'joined' | 'left';
  timestamp: number;
}