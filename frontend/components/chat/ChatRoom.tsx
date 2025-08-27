'use client';

import React from 'react';
import { clsx } from 'clsx';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UserList } from './UserList';
import { ConnectionStatus } from './ConnectionStatus';
import { useChat } from '@/hooks/useChat';

/**
 * ChatRoom component props
 */
interface ChatRoomProps {
  roomId?: string;
  roomName?: string;
  showUserList?: boolean;
  className?: string;
}

/**
 * Main ChatRoom component that combines all chat functionality
 * 
 * Features:
 * - Real-time message display and sending
 * - User presence indication
 * - Connection status monitoring
 * - Responsive layout with optional user list
 * - Loading and error states
 */
export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  roomName,
  showUserList = true,
  className,
}) => {
  const {
    // Connection state
    isConnected,
    connectionStatus,
    
    // User state
    username,
    currentRoomId,
    
    // Data state
    messages,
    activeUsers,
    
    // UI state
    isLoading,
    error,
    
    // Actions
    sendMessage,
    clearError,
  } = useChat();

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (content: string) => {
    if (!isConnected || !username) {
      return;
    }
    
    sendMessage(content);
  };

  /**
   * Loading state
   */
  if (isLoading && !currentRoomId) {
    return (
      <div className="flex items-center justify-center h-full bg-secondary-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          <p className="text-secondary-600 font-medium">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex h-full bg-white overflow-hidden',
        className
      )}
    >
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-200 bg-white">
          <div className="flex items-center gap-3">
            {/* Room info */}
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-secondary-900">
                {roomName || `Room ${currentRoomId?.substring(0, 8)}`}
              </h2>
              <div className="flex items-center gap-2 text-sm text-secondary-600">
                <span>
                  {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} online
                </span>
                <span className="w-1 h-1 bg-secondary-400 rounded-full" />
                <ConnectionStatus 
                  status={connectionStatus}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* User list toggle (mobile) */}
            {showUserList && (
              <button
                className={clsx(
                  'p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors md:hidden',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500'
                )}
                aria-label="Toggle user list"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </button>
            )}

            {/* Settings menu */}
            <button
              className={clsx(
                'p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
              aria-label="Chat settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-error-50 border-b border-error-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-error-800">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-error-600 hover:text-error-800 transition-colors"
                aria-label="Dismiss error"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <MessageList
          messages={messages}
          currentUsername={username}
          className="flex-1"
        />

        {/* Message input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected || !username}
        />
      </div>

      {/* User list sidebar */}
      {showUserList && (
        <div className="hidden md:flex md:flex-col w-64 border-l border-secondary-200 bg-secondary-50">
          <UserList
            users={activeUsers}
            currentUsername={username}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};