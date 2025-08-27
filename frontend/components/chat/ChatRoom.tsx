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
 * Compact ChatRoom component with horizontal layout like Telegram/WhatsApp
 */
export const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  roomName,
  showUserList = false,
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
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-meta">Connecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('flex h-full bg-white', className)}>
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Compact chat header */}
        <div className="chat-header">
          <div className="flex items-center gap-3">
            {/* Room avatar */}
            <div className="avatar-sm bg-secondary-500">
              #
            </div>
            
            {/* Room info */}
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-secondary-900 truncate">
                {roomName || `Room ${currentRoomId?.substring(0, 8)}`}
              </h2>
              <div className="flex items-center gap-2 text-meta">
                <span>
                  {activeUsers.length} member{activeUsers.length !== 1 ? 's' : ''}
                </span>
                {activeUsers.length > 0 && (
                  <>
                    <span>•</span>
                    <ConnectionStatus status={connectionStatus} className="text-meta" />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button className="btn-icon" title="Search">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* More options */}
            <button className="btn-icon" title="More">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages area */}
        <MessageList
          messages={messages}
          currentUsername={username}
          className="chat-messages"
        />

        {/* Message input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={!isConnected || !username}
          className="chat-input"
        />
      </div>

      {/* User list sidebar (compact, only on larger screens) */}
      {showUserList && (
        <div className="hidden lg:flex lg:flex-col w-60 border-l border-secondary-200 bg-secondary-50">
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