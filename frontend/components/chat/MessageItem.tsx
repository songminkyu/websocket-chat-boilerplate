'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ChatMessage, MessageType } from '@/types/chat';

/**
 * MessageItem component props
 */
interface MessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  isGrouped?: boolean;
  className?: string;
}

/**
 * Compact MessageItem component for messenger-style chat
 */
export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isCurrentUser,
  isGrouped = false,
  className,
}) => {
  const isSystemMessage = [MessageType.JOIN, MessageType.LEAVE, MessageType.SYSTEM].includes(message.type);

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  /**
   * Get sender initials for avatar
   */
  const getSenderInitials = (sender: string): string => {
    return sender.charAt(0).toUpperCase();
  };

  /**
   * Get consistent color for user avatar
   */
  const getUserColor = (username: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // System messages (join/leave/system)
  if (isSystemMessage) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center py-2',
          className
        )}
        role="status"
        aria-label={`System message: ${message.content}`}
      >
        <div className="system-message">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      </div>
    );
  }

  // Regular chat messages
  return (
    <div
      className={clsx(
        'message-bubble-item',
        isCurrentUser ? 'message-sent' : 'message-received',
        className
      )}
      role="article"
      aria-label={`Message from ${message.sender}`}
    >
      {/* Left side - Avatar for received messages */}
      {!isCurrentUser && (
        <div className="message-avatar">
          {!isGrouped && (
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
              getUserColor(message.sender)
            )}>
              {getSenderInitials(message.sender)}
            </div>
          )}
        </div>
      )}

      {/* Message content */}
      <div className="message-content">
        {/* Sender name for received messages (non-grouped) */}
        {!isCurrentUser && !isGrouped && (
          <div className="message-sender">
            {message.sender}
          </div>
        )}

        {/* Message bubble */}
        <div className={clsx(
          'message-bubble group',
          isCurrentUser ? 'bubble-sent' : 'bubble-received'
        )}>
          <div className="bubble-content">
            {message.content}
          </div>
          
          {/* Timestamp */}
          <div className="bubble-timestamp">
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>

      {/* Right side spacer for received messages */}
      {!isCurrentUser && <div className="message-spacer" />}
    </div>
  );
};