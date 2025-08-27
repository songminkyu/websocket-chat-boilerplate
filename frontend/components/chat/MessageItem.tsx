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

  // System messages (join/leave/system)
  if (isSystemMessage) {
    return (
      <div
        className={clsx(
          'flex items-center justify-center py-1',
          className
        )}
        role="status"
        aria-label={`System message: ${message.content}`}
      >
        <div className="msg-bubble-system">
          {message.content}
        </div>
      </div>
    );
  }

  // Regular chat messages
  return (
    <div
      className={clsx(
        'message-item px-4 py-1',
        isCurrentUser ? 'message-item-sent' : 'message-item-received',
        className
      )}
      role="article"
      aria-label={`Message from ${message.sender}`}
    >
      {/* Avatar (only for non-grouped messages from others) */}
      {!isCurrentUser && !isGrouped && (
        <div className="avatar-xs bg-primary-500 flex-shrink-0">
          {getSenderInitials(message.sender)}
        </div>
      )}
      
      {/* Spacing for grouped messages */}
      {!isCurrentUser && isGrouped && <div className="w-6 flex-shrink-0"></div>}

      <div className="flex flex-col min-w-0 flex-1">
        {/* Sender name (only for non-grouped messages from others) */}
        {!isCurrentUser && !isGrouped && (
          <div className="text-meta mb-1 px-1">
            {message.sender}
          </div>
        )}

        {/* Message bubble */}
        <div className={clsx(
          'msg-bubble relative group',
          isCurrentUser ? 'msg-bubble-sent' : 'msg-bubble-received',
          // Grouping adjustments - less rounded corners for grouped messages
          isGrouped && isCurrentUser && 'rounded-tr-lg',
          isGrouped && !isCurrentUser && 'rounded-tl-lg',
        )}>
          {/* Message content */}
          <div className="leading-relaxed">
            {message.content}
          </div>

          {/* Timestamp - shows on hover or for current user */}
          <div
            className={clsx(
              'text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
              isCurrentUser ? 'text-white/60 text-right opacity-70' : 'text-secondary-500'
            )}
          >
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </div>
  );
};