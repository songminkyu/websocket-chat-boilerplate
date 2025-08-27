'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWebSocket } from './useWebSocket';
import { 
  ChatMessage, 
  ChatRoom, 
  UserSession, 
  MessageType, 
  ChatMessageDto,
  CreateRoomDto,
  UserStatusMessage,
  ConnectionStatus
} from '@/types/chat';
import { 
  DESTINATIONS, 
  DEFAULTS, 
  UI_CONFIG, 
  STORAGE_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '@/lib/constants';

/**
 * Chat hook interface
 */
interface UseChatReturn {
  // Connection state
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  
  // User state
  username: string | null;
  currentRoomId: string | null;
  
  // Data state
  messages: ChatMessage[];
  rooms: ChatRoom[];
  activeUsers: UserSession[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  connect: (username: string) => Promise<void>;
  disconnect: () => void;
  joinRoom: (roomId: string, roomName?: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  sendMessage: (content: string) => void;
  createRoom: (roomData: CreateRoomDto) => Promise<ChatRoom | null>;
  clearMessages: () => void;
  setUsername: (username: string) => void;
  clearError: () => void;
}

/**
 * Custom hook for chat functionality
 * 
 * Provides high-level chat operations built on top of WebSocket connection:
 * - User authentication and session management
 * - Room joining/leaving with automatic subscriptions
 * - Message sending and receiving with real-time updates
 * - User presence tracking and status updates
 * - Error handling and recovery
 */
export const useChat = (): UseChatReturn => {
  // WebSocket connection
  const { 
    isConnected, 
    connectionStatus, 
    connect: wsConnect, 
    disconnect: wsDisconnect, 
    sendMessage: wsSendMessage, 
    subscribe 
  } = useWebSocket();

  // User state
  const [username, setUsernameState] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  
  // Data state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserSession[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for subscriptions and cleanup
  const subscriptionsRef = useRef<Set<() => void>>(new Set());
  const currentRoomNameRef = useRef<string>('');

  /**
   * Load persisted data from localStorage
   */
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem(STORAGE_CONFIG.KEYS.USERNAME);
      const savedRoomId = localStorage.getItem(STORAGE_CONFIG.KEYS.LAST_ROOM);
      
      if (savedUsername) {
        setUsernameState(savedUsername);
      }
      
      if (savedRoomId) {
        setCurrentRoomId(savedRoomId);
      }
    } catch (err) {
      console.warn('⚠️ Failed to load saved data:', err);
    }
  }, []);

  /**
   * Save data to localStorage
   */
  const saveToStorage = useCallback((key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn('⚠️ Failed to save to localStorage:', err);
    }
  }, []);

  /**
   * Add message to the messages array
   */
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => {
      // Avoid duplicates
      if (prev.find(m => m.id === message.id)) {
        return prev;
      }
      
      // Keep only recent messages to prevent memory issues
      const newMessages = [...prev, message];
      if (newMessages.length > UI_CONFIG.MAX_MESSAGES_DISPLAY) {
        return newMessages.slice(-UI_CONFIG.MAX_MESSAGES_DISPLAY);
      }
      
      return newMessages;
    });
  }, []);

  /**
   * Handle incoming chat messages
   */
  const handleChatMessage = useCallback((message: ChatMessage) => {
    console.log('💬 Received chat message:', message);
    addMessage(message);
  }, [addMessage]);

  /**
   * Handle user status updates (join/leave)
   */
  const handleUserStatus = useCallback((statusMessage: UserStatusMessage) => {
    console.log('👥 User status update:', statusMessage);
    
    // Create system message for user status
    const systemMessage: ChatMessage = {
      id: uuidv4(),
      roomId: currentRoomId || DEFAULTS.ROOM_ID,
      sender: 'System',
      content: `${statusMessage.username} ${statusMessage.status} the room`,
      type: statusMessage.status === 'joined' ? MessageType.JOIN : MessageType.LEAVE,
      timestamp: new Date(statusMessage.timestamp).toISOString(),
    };
    
    addMessage(systemMessage);
  }, [currentRoomId, addMessage]);

  /**
   * Subscribe to room messages and user status
   */
  const subscribeToRoom = useCallback((roomId: string) => {
    if (!isConnected) {
      console.warn('⚠️ Cannot subscribe: not connected');
      return;
    }

    // Clear existing subscriptions
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();

    // Subscribe to room messages
    const messageDestination = `${DESTINATIONS.ROOM_MESSAGES}${roomId}`;
    const messageUnsubscribe = subscribe(messageDestination, handleChatMessage);
    subscriptionsRef.current.add(messageUnsubscribe);

    // Subscribe to user status updates
    const statusDestination = `${DESTINATIONS.USER_STATUS}${roomId}`;
    const statusUnsubscribe = subscribe(statusDestination, handleUserStatus);
    subscriptionsRef.current.add(statusUnsubscribe);

    console.log('🔔 Subscribed to room:', roomId);
  }, [isConnected, subscribe, handleChatMessage, handleUserStatus]);

  /**
   * Connect to chat with username
   */
  const connect = useCallback(async (newUsername: string) => {
    if (!newUsername.trim()) {
      setError(ERROR_MESSAGES.USERNAME_REQUIRED);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Connect WebSocket first
      wsConnect();
      
      // Wait for connection to be established
      await new Promise<void>((resolve, reject) => {
        const checkConnection = () => {
          if (isConnected) {
            resolve();
          } else if (connectionStatus === ConnectionStatus.ERROR) {
            reject(new Error(ERROR_MESSAGES.CONNECTION_FAILED));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error(ERROR_MESSAGES.CONNECTION_FAILED)), 10000);
        checkConnection();
      });
      
      setUsernameState(newUsername);
      saveToStorage(STORAGE_CONFIG.KEYS.USERNAME, newUsername);
      
      console.log('✅ Connected as:', newUsername);
      
    } catch (err) {
      console.error('❌ Connection failed:', err);
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.CONNECTION_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, [wsConnect, isConnected, connectionStatus, saveToStorage]);

  /**
   * Disconnect from chat
   */
  const disconnect = useCallback(() => {
    setIsLoading(true);
    
    // Leave current room if joined
    if (currentRoomId && username) {
      leaveRoom();
    }
    
    // Clear subscriptions
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();
    
    // Disconnect WebSocket
    wsDisconnect();
    
    // Reset state
    setMessages([]);
    setActiveUsers([]);
    setCurrentRoomId(null);
    setError(null);
    setIsLoading(false);
    
    console.log('🛑 Disconnected from chat');
  }, [currentRoomId, username, wsDisconnect]);

  /**
   * Join a chat room
   */
  const joinRoom = useCallback(async (roomId: string, roomName?: string) => {
    if (!isConnected || !username) {
      setError(ERROR_MESSAGES.USERNAME_REQUIRED);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Leave current room first
      if (currentRoomId && currentRoomId !== roomId) {
        await leaveRoom();
      }

      // Subscribe to new room
      subscribeToRoom(roomId);
      
      // Send join message
      const joinMessage: ChatMessageDto = {
        roomId,
        sender: username,
        content: `${username} joined the room`,
      };
      
      wsSendMessage(DESTINATIONS.ADD_USER, joinMessage);
      
      // Update state
      setCurrentRoomId(roomId);
      currentRoomNameRef.current = roomName || `Room ${roomId.substring(0, 8)}`;
      setMessages([]); // Clear previous room messages
      
      // Save to storage
      saveToStorage(STORAGE_CONFIG.KEYS.LAST_ROOM, roomId);
      
      console.log('🚪 Joined room:', roomId);
      
    } catch (err) {
      console.error('❌ Failed to join room:', err);
      setError(ERROR_MESSAGES.JOIN_ROOM_FAILED);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, username, currentRoomId, subscribeToRoom, wsSendMessage, saveToStorage]);

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(async () => {
    if (!currentRoomId || !username || !isConnected) {
      return;
    }

    try {
      // Send leave message
      const leaveMessage: ChatMessageDto = {
        roomId: currentRoomId,
        sender: username,
        content: `${username} left the room`,
      };
      
      wsSendMessage(DESTINATIONS.REMOVE_USER, leaveMessage);
      
      // Clear subscriptions
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current.clear();
      
      console.log('🚪 Left room:', currentRoomId);
      
    } catch (err) {
      console.error('❌ Failed to leave room:', err);
      setError(ERROR_MESSAGES.LEAVE_ROOM_FAILED);
    }
  }, [currentRoomId, username, isConnected, wsSendMessage]);

  /**
   * Send a chat message
   */
  const sendMessage = useCallback((content: string) => {
    if (!isConnected || !username || !currentRoomId) {
      setError(ERROR_MESSAGES.USERNAME_REQUIRED);
      return;
    }

    if (!content.trim()) {
      return; // Don't send empty messages
    }

    try {
      const messageDto: ChatMessageDto = {
        roomId: currentRoomId,
        sender: username,
        content: content.trim(),
      };
      
      wsSendMessage(DESTINATIONS.SEND_MESSAGE, messageDto);
      console.log('📤 Sent message:', content);
      
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError(ERROR_MESSAGES.SEND_MESSAGE_FAILED);
    }
  }, [isConnected, username, currentRoomId, wsSendMessage]);

  /**
   * Create a new room (placeholder for future implementation)
   */
  const createRoom = useCallback(async (roomData: CreateRoomDto): Promise<ChatRoom | null> => {
    console.log('🏗️ Room creation not implemented yet:', roomData);
    setError('Room creation feature coming soon');
    return null;
  }, []);

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Set username
   */
  const setUsername = useCallback((newUsername: string) => {
    setUsernameState(newUsername);
    saveToStorage(STORAGE_CONFIG.KEYS.USERNAME, newUsername);
  }, [saveToStorage]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-join last room when connected
   */
  useEffect(() => {
    if (isConnected && username && !currentRoomId) {
      const savedRoomId = localStorage.getItem(STORAGE_CONFIG.KEYS.LAST_ROOM);
      if (savedRoomId) {
        joinRoom(savedRoomId);
      } else {
        // Join default room
        joinRoom(DEFAULTS.ROOM_ID, DEFAULTS.ROOM_NAME);
      }
    }
  }, [isConnected, username, currentRoomId, joinRoom]);

  /**
   * Cleanup subscriptions on unmount
   */
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    
    // User state
    username,
    currentRoomId,
    
    // Data state
    messages,
    rooms,
    activeUsers,
    
    // UI state
    isLoading,
    error,
    
    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    createRoom,
    clearMessages,
    setUsername,
    clearError,
  };
};