/**
 * TypeScript type definitions for the chat application
 * 
 * Defines all interfaces, types, and enums used throughout the frontend
 * application for type safety and consistency.
 */

/**
 * Message type enumeration
 */
export enum MessageType {
  CHAT = 'CHAT',
  JOIN = 'JOIN', 
  LEAVE = 'LEAVE',
  SYSTEM = 'SYSTEM'
}

/**
 * Chat message interface
 */
export interface ChatMessage {
  id: string;
  roomId: string;
  sender: string;
  content: string;
  type: MessageType;
  timestamp: string; // ISO 8601 format
}

/**
 * Chat room interface
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

/**
 * User session interface
 */
export interface UserSession {
  sessionId: string;
  username: string;
  joinedAt: string; // ISO 8601 format
  lastActivity: string; // ISO 8601 format
  isActive: boolean;
}

/**
 * User status message interface
 */
export interface UserStatusMessage {
  username: string;
  status: 'joined' | 'left';
  timestamp: number;
}

/**
 * Message DTO for sending messages
 */
export interface ChatMessageDto {
  roomId: string;
  sender: string;
  content: string;
}

/**
 * Room creation DTO
 */
export interface CreateRoomDto {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

/**
 * WebSocket connection status
 */
export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING'
}

/**
 * Chat context state interface
 */
export interface ChatContextState {
  // Connection
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  
  // Current user
  username: string | null;
  currentRoomId: string | null;
  
  // Messages and rooms
  messages: ChatMessage[];
  rooms: ChatRoom[];
  activeUsers: UserSession[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

/**
 * Chat context actions interface
 */
export interface ChatContextActions {
  // Connection actions
  connect: (username: string) => Promise<void>;
  disconnect: () => void;
  
  // Room actions
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  createRoom: (roomData: CreateRoomDto) => Promise<ChatRoom>;
  
  // Message actions
  sendMessage: (content: string) => void;
  clearMessages: () => void;
  
  // User actions
  setUsername: (username: string) => void;
  
  // Error handling
  clearError: () => void;
}

/**
 * WebSocket hook return type
 */
export interface UseWebSocketReturn {
  // Connection state
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendMessage: (destination: string, body: any) => void;
  subscribe: (destination: string, callback: (message: any) => void) => () => void;
  
  // Error state
  error: string | null;
}

/**
 * API response types
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Room statistics interface
 */
export interface RoomStats {
  totalRooms: number;
  totalUsers: number;
  totalMessages: number;
  timestamp: number;
}

/**
 * Error message interface
 */
export interface ErrorMessage {
  message: string;
  timestamp: number;
  originalPayload?: string;
}

/**
 * Chat component props interfaces
 */
export interface ChatRoomProps {
  roomId: string;
  roomName?: string;
}

export interface MessageListProps {
  messages: ChatMessage[];
  currentUsername: string | null;
}

export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface UserListProps {
  users: UserSession[];
  currentUsername: string | null;
}

export interface RoomListProps {
  rooms: ChatRoom[];
  currentRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
}

/**
 * Form validation types
 */
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
}

/**
 * Local storage keys
 */
export enum StorageKeys {
  USERNAME = 'chat_username',
  LAST_ROOM = 'chat_last_room',
  THEME = 'chat_theme',
  SETTINGS = 'chat_settings'
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

/**
 * User settings interface
 */
export interface UserSettings {
  theme: ThemeConfig;
  notifications: boolean;
  soundEnabled: boolean;
  autoReconnect: boolean;
  maxReconnectAttempts: number;
}

/**
 * Utility types
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;