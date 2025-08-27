'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, IMessage } from '@stompjs/stompjs';
import SockJS from 'sockjs-client';
import { ConnectionStatus, UseWebSocketReturn } from '@/types/chat';
import { ENV, DESTINATIONS, CONNECTION_CONFIG } from '@/lib/constants';

/**
 * Custom hook for WebSocket/STOMP connection management
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
  
  // WebSocket client reference
  const clientRef = useRef<Client | null>(null);
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
   * Initialize WebSocket client with configuration
   */
  const initializeClient = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
    }

    const client = new Client({
      // Use SockJS for broader browser compatibility
      webSocketFactory: () => new SockJS(`${ENV.WEBSOCKET_URL}${DESTINATIONS.WEBSOCKET_ENDPOINT}`),
      
      // Connection configuration
      connectHeaders: {
        // Add any authentication headers here in future
      },
      
      // Heartbeat configuration for connection health
      heartbeatIncoming: CONNECTION_CONFIG.HEARTBEAT_INCOMING,
      heartbeatOutgoing: CONNECTION_CONFIG.HEARTBEAT_OUTGOING,
      
      // Connection timeout
      connectionTimeout: CONNECTION_CONFIG.CONNECTION_TIMEOUT,
      
      // Debug configuration
      debug: ENV.IS_DEVELOPMENT ? (str) => console.log('[STOMP Debug]', str) : undefined,
      
      // Connection lifecycle handlers
      onConnect: () => {
        console.log('🔗 WebSocket connected successfully');
        setConnectionStatus(ConnectionStatus.CONNECTED);
        setError(null);
        reconnectAttemptsRef.current = 0;
        clearReconnectTimeout();
      },
      
      onDisconnect: () => {
        console.log('🔌 WebSocket disconnected');
        setConnectionStatus(ConnectionStatus.DISCONNECTED);
        subscriptionsRef.current.clear();
      },
      
      onStompError: (frame) => {
        console.error('🚨 STOMP error:', frame.headers['message'], frame.body);
        setError(`STOMP Error: ${frame.headers['message'] || 'Unknown error'}`);
        setConnectionStatus(ConnectionStatus.ERROR);
      },
      
      onWebSocketError: (event) => {
        console.error('🚨 WebSocket error:', event);
        setError('WebSocket connection error');
        setConnectionStatus(ConnectionStatus.ERROR);
      },
      
      onWebSocketClose: (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        
        // Attempt reconnection if not manually disconnected
        if (event.code !== 1000 && reconnectAttemptsRef.current < CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          const delay = getReconnectDelay(reconnectAttemptsRef.current);
          
          setConnectionStatus(ConnectionStatus.RECONNECTING);
          setError(`Reconnecting in ${Math.ceil(delay / 1000)}s... (Attempt ${reconnectAttemptsRef.current + 1}/${CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnection attempt ${reconnectAttemptsRef.current}/${CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS}`);
            
            if (clientRef.current) {
              clientRef.current.activate();
            }
          }, delay);
        } else if (reconnectAttemptsRef.current >= CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS) {
          setError('Connection failed after maximum retry attempts');
          setConnectionStatus(ConnectionStatus.ERROR);
        }
      },
    });

    clientRef.current = client;
    return client;
  }, [getReconnectDelay, clearReconnectTimeout]);

  /**
   * Connect to WebSocket server
   */
  const connect = useCallback(() => {
    if (clientRef.current?.connected) {
      console.log('⚠️ Already connected to WebSocket');
      return;
    }

    console.log('🚀 Connecting to WebSocket...');
    setConnectionStatus(ConnectionStatus.CONNECTING);
    setError(null);
    
    const client = initializeClient();
    client.activate();
  }, [initializeClient]);

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = useCallback(() => {
    console.log('🛑 Disconnecting from WebSocket...');
    
    clearReconnectTimeout();
    reconnectAttemptsRef.current = CONNECTION_CONFIG.MAX_RECONNECT_ATTEMPTS; // Prevent reconnection
    
    // Unsubscribe from all subscriptions
    subscriptionsRef.current.forEach(unsubscribe => unsubscribe());
    subscriptionsRef.current.clear();
    
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }
    
    setConnectionStatus(ConnectionStatus.DISCONNECTED);
    setError(null);
  }, [clearReconnectTimeout]);

  /**
   * Send message to specified destination
   */
  const sendMessage = useCallback((destination: string, body: any) => {
    if (!clientRef.current?.connected) {
      console.error('❌ Cannot send message: WebSocket not connected');
      setError('Cannot send message: Not connected to server');
      return;
    }

    try {
      const messageBody = typeof body === 'string' ? body : JSON.stringify(body);
      clientRef.current.publish({
        destination,
        body: messageBody,
      });
      
      console.log('📤 Message sent to', destination, ':', messageBody);
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      setError('Failed to send message');
    }
  }, []);

  /**
   * Subscribe to a destination and handle incoming messages
   */
  const subscribe = useCallback((destination: string, callback: (message: any) => void) => {
    if (!clientRef.current?.connected) {
      console.error('❌ Cannot subscribe: WebSocket not connected');
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const subscription = clientRef.current.subscribe(destination, (message: IMessage) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          console.log('📥 Message received from', destination, ':', parsedMessage);
          callback(parsedMessage);
        } catch (parseError) {
          console.error('❌ Failed to parse message:', parseError, message.body);
          // Still call callback with raw message for debugging
          callback({ raw: message.body, error: 'Parse failed' });
        }
      });

      // Store unsubscribe function
      const unsubscribe = () => {
        subscription.unsubscribe();
        subscriptionsRef.current.delete(destination);
        console.log('🔕 Unsubscribed from', destination);
      };

      subscriptionsRef.current.set(destination, unsubscribe);
      console.log('🔔 Subscribed to', destination);
      
      return unsubscribe;
    } catch (err) {
      console.error('❌ Failed to subscribe to', destination, ':', err);
      setError(`Failed to subscribe to ${destination}`);
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
      console.log('🔧 Development mode: Auto-connecting WebSocket');
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