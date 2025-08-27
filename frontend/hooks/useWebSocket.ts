'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ConnectionStatus, UseWebSocketReturn } from '@/types/chat';
import { ENV, CONNECTION_CONFIG } from '@/lib/constants';

/**
 * Custom hook for WebSocket/Socket.IO connection management
 * 
 * Provides a high-level interface for WebSocket operations including:
 * - Connection management with automatic reconnection
 * - Message sending and subscription handling
 * - Error handling and status tracking
 * - Cleanup and connection lifecycle management
 */
export const useWebSocket = (): UseWebSocketReturn => {
  // Connection state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );
  const [error, setError] = useState<string | null>(null);
  
  // Socket.IO client reference
  const socketRef = useRef<Socket | null>(null);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear any pending reconnection timeout
   */
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  /**
   * Calculate reconnection delay with exponential backoff
   */
  const getReconnectDelay = useCallback((attempt: number): number => {
    const delay = CONNECTION_CONFIG.RECONNECT_DELAY * 
      Math.pow(CONNECTION_CONFIG.RECONNECT_BACKOFF_MULTIPLIER, attempt);
    return Math.min(delay, 30000); // Max 30 seconds
  }, []);

  /**
   * Initialize Socket.IO client with configuration
   */
  const initializeClient = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(ENV.WEBSOCKET_URL, {
      // Connection configuration
      timeout: CONNECTION_CONFIG.CONNECTION_TIMEOUT,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: CONNECTION_CONFIG.RECONNECT_DELAY,
      reconnectionDelayMax: 30000,
      
      // Transport configuration
      transports: ['websocket', 'polling'],
      
      // Debug configuration
      debug: ENV.IS_DEVELOPMENT,
    });

    // Connection lifecycle handlers
    socket.on('connect', () => {
      console.log('🔗 Socket.IO connected successfully:', socket.id);
      setConnectionStatus(ConnectionStatus.CONNECTED);
      setError(null);
      reconnectAttemptsRef.current = 0;
      clearReconnectTimeout();
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      setConnectionStatus(ConnectionStatus.DISCONNECTED);
      subscriptionsRef.current.clear();
    });
    
    socket.on('connect_error', (error) => {
      console.error('🚨 Socket.IO connection error:', error);
      setError(`Connection error: ${error.message}`);
      setConnectionStatus(ConnectionStatus.ERROR);
    });
    
    socket.on('reconnect_attempt', (attempt) => {
      console.log(`🔄 Socket.IO reconnection attempt ${attempt}/${CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS}`);
      setConnectionStatus(ConnectionStatus.RECONNECTING);
      setError(`Reconnecting... (Attempt ${attempt}/${CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('❌ Socket.IO reconnection failed after maximum attempts');
      setError('Connection failed after maximum retry attempts');
      setConnectionStatus(ConnectionStatus.ERROR);
    });

    socketRef.current = socket;
    return socket;
  }, [clearReconnectTimeout]);

  /**
   * Connect to Socket.IO server
   */
  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('⚠️ Already connected to Socket.IO');
      return;
    }

    console.log('🚀 Connecting to Socket.IO...');
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setError(null);
    
    const socket = initializeClient();
    socket.connect();
  }, [initializeClient]);

  /**
   * Disconnect from Socket.IO server
   */
  const disconnect = useCallback(() => {
    console.log('🛑 Disconnecting from Socket.IO...');
    
    clearReconnectTimeout();
    reconnectAttemptsRef.current = CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
    
    // Clear all subscriptions
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setError(null);
  }, [clearReconnectTimeout]);

  /**
   * Send message to specified event
   */
  const sendMessage = useCallback((event: string, data: any) => {
    if (!socketRef.current?.connected) {
      console.error('❌ Cannot send message: Socket.IO not connected');
      setError('Cannot send message: Not connected to server');
      return;
    }

    try {
      socketRef.current.emit(event, data);
      console.log('📤 Message sent to', event, ':', data);
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError('Failed to send message');
    }
  }, []);

  /**
   * Subscribe to an event and handle incoming messages
   */
  const subscribe = useCallback((event: string, callback: (message: any) => void) => {
    if (!socketRef.current?.connected) {
      console.error('❌ Cannot subscribe: Socket.IO not connected');
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const eventHandler = (data: any) => {
        console.log('📥 Message received from', event, ':', data);
        callback(data);
      };
      
      socketRef.current.on(event, eventHandler);

      // Store unsubscribe function
      const unsubscribe = () => {
        if (socketRef.current) {
          socketRef.current.off(event, eventHandler);
        }
        subscriptionsRef.current.delete(event);
        console.log('🔕 Unsubscribed from', event);
      };

      subscriptionsRef.current.set(event, unsubscribe);
      console.log('🔔 Subscribed to', event);
      
      return unsubscribe;
    } catch (err) {
      console.error('❌ Failed to subscribe to', event, ':', err);
      setError(`Failed to subscribe to ${event}`);
      return () => {}; // Return empty unsubscribe function
    }
  }, []);

  /**
   * Cleanup on component unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  /**
   * Auto-connect on mount if in development
   */
  useEffect(() => {
    if (ENV.IS_DEVELOPMENT) {
      console.log('🔧 Development mode: Auto-connecting Socket.IO');
      // Small delay to allow component to render
      const timer = setTimeout(() => connect(), 100);
      return () => clearTimeout(timer);
    }
  }, [connect]);

  return {
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    connectionStatus,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    error,
  };
};