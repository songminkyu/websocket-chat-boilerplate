/**
 * Application constants and configuration
 * 
 * Centralized configuration for WebSocket endpoints, API URLs,
 * validation rules, and other application constants.
 */

/**
 * Environment configuration
 */
export const ENV = {
  // Backend URLs
  WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:8080',
  API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
  
  // Development flags
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;

/**
 * WebSocket/STOMP destinations
 */
export const DESTINATIONS = {
  // WebSocket connection endpoint
  WEBSOCKET_ENDPOINT: '/ws',
  
  // Message sending destinations (client to server)
  SEND_MESSAGE: '/app/chat.sendMessage',
  ADD_USER: '/app/chat.addUser', 
  REMOVE_USER: '/app/chat.removeUser',
  
  // Message receiving destinations (server to client)
  ROOM_MESSAGES: '/topic/public/',      // + roomId
  USER_STATUS: '/topic/status/',        // + roomId
  PRIVATE_MESSAGES: '/queue/private/',  // + userId (future)
  ERROR_MESSAGES: '/user/queue/errors', // User-specific errors
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/{id}',
  ROOM_USERS: '/rooms/{id}/users',
  ROOM_STATS: '/rooms/stats',
  ROOM_CLEANUP: '/rooms/cleanup',
  HEALTH: '/rooms/health',
} as const;

/**
 * Validation rules
 */
export const VALIDATION = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
    ERROR_MESSAGES: {
      REQUIRED: 'Username is required',
      MIN_LENGTH: 'Username must be at least 3 characters',
      MAX_LENGTH: 'Username must not exceed 50 characters',
      PATTERN: 'Username can only contain letters, numbers, and underscores',
    },
  },
  
  MESSAGE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 1000,
    ERROR_MESSAGES: {
      REQUIRED: 'Message cannot be empty',
      MAX_LENGTH: 'Message must not exceed 1000 characters',
    },
  },
  
  ROOM_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
    ERROR_MESSAGES: {
      REQUIRED: 'Room name is required',
      MIN_LENGTH: 'Room name must be at least 3 characters',
      MAX_LENGTH: 'Room name must not exceed 100 characters',
    },
  },
  
  ROOM_DESCRIPTION: {
    MAX_LENGTH: 500,
    ERROR_MESSAGES: {
      MAX_LENGTH: 'Room description must not exceed 500 characters',
    },
  },
} as const;

/**
 * Connection configuration
 */
export const CONNECTION_CONFIG = {
  // Heartbeat configuration (milliseconds)
  HEARTBEAT_OUTGOING: 10000,  // 10 seconds
  HEARTBEAT_INCOMING: 10000,  // 10 seconds
  
  // Reconnection settings
  RECONNECT_DELAY: 3000,      // 3 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_BACKOFF_MULTIPLIER: 1.5,
  
  // Connection timeout
  CONNECTION_TIMEOUT: 30000,   // 30 seconds
  
  // Message queue limits
  MAX_QUEUED_MESSAGES: 100,
  
  // Session settings
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * UI configuration
 */
export const UI_CONFIG = {
  // Message display limits
  MAX_MESSAGES_DISPLAY: 100,
  MESSAGE_BATCH_SIZE: 20,
  
  // Animation durations (milliseconds)
  ANIMATION_DURATION_FAST: 150,
  ANIMATION_DURATION_NORMAL: 200,
  ANIMATION_DURATION_SLOW: 300,
  
  // Debounce delays
  TYPING_DEBOUNCE: 300,
  SEARCH_DEBOUNCE: 500,
  
  // Auto-scroll settings
  AUTO_SCROLL_THRESHOLD: 100, // pixels from bottom
  
  // Notification settings
  NOTIFICATION_DURATION: 5000, // 5 seconds
  
  // Theme settings
  DEFAULT_THEME: 'light' as const,
} as const;

/**
 * Storage configuration
 */
export const STORAGE_CONFIG = {
  // LocalStorage keys
  KEYS: {
    USERNAME: 'websocket_chat_username',
    LAST_ROOM: 'websocket_chat_last_room',
    THEME: 'websocket_chat_theme',
    USER_SETTINGS: 'websocket_chat_settings',
    CONNECTION_HISTORY: 'websocket_chat_connections',
  },
  
  // Cache settings
  CACHE_DURATION: 60 * 60 * 1000, // 1 hour
  MAX_CACHE_SIZE: 50, // number of items
} as const;

/**
 * Message type styling
 */
export const MESSAGE_STYLES = {
  CHAT: {
    USER_BG: 'bg-primary-500',
    USER_TEXT: 'text-white',
    OTHER_BG: 'bg-secondary-100',
    OTHER_TEXT: 'text-secondary-900',
  },
  SYSTEM: {
    BG: 'bg-warning-50',
    TEXT: 'text-warning-800',
    BORDER: 'border-warning-200',
  },
  JOIN: {
    BG: 'bg-success-50',
    TEXT: 'text-success-800',
    BORDER: 'border-success-200',
  },
  LEAVE: {
    BG: 'bg-secondary-50',
    TEXT: 'text-secondary-600',
    BORDER: 'border-secondary-200',
  },
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  ROOM_ID: 'general',
  ROOM_NAME: 'General Chat',
  USERNAME: '',
  MESSAGE_PLACEHOLDER: 'Type your message...',
  ROOM_NAME_PLACEHOLDER: 'Enter room name...',
  ROOM_DESCRIPTION_PLACEHOLDER: 'Optional room description...',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  CONNECTION_FAILED: 'Failed to connect to chat server',
  CONNECTION_LOST: 'Connection to chat server lost',
  SEND_MESSAGE_FAILED: 'Failed to send message',
  JOIN_ROOM_FAILED: 'Failed to join room',
  LEAVE_ROOM_FAILED: 'Failed to leave room',
  CREATE_ROOM_FAILED: 'Failed to create room',
  FETCH_ROOMS_FAILED: 'Failed to fetch rooms',
  INVALID_MESSAGE: 'Invalid message format',
  USERNAME_REQUIRED: 'Username is required to join chat',
  ROOM_NOT_FOUND: 'Room not found',
  NETWORK_ERROR: 'Network error occurred',
  UNEXPECTED_ERROR: 'An unexpected error occurred',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CONNECTED: 'Connected to chat server',
  RECONNECTED: 'Reconnected to chat server',
  ROOM_JOINED: 'Joined room successfully',
  ROOM_LEFT: 'Left room successfully',
  ROOM_CREATED: 'Room created successfully',
  MESSAGE_SENT: 'Message sent successfully',
} as const;

/**
 * Feature flags
 */
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_SOUND: true,
  ENABLE_TYPING_INDICATORS: true,
  ENABLE_MESSAGE_REACTIONS: false,
  ENABLE_FILE_UPLOAD: false,
  ENABLE_PRIVATE_MESSAGING: false,
  ENABLE_MESSAGE_HISTORY: false,
  ENABLE_USER_PROFILES: false,
} as const;

/**
 * Regular expressions for validation
 */
export const REGEX = {
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
  ROOM_NAME: /^.{3,100}$/,
  URL: /^https?:\/\/.+/,
  WEBSOCKET_URL: /^wss?:\/\/.+/,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;