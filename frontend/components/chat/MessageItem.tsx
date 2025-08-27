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
 * MessageItem component for displaying individual chat messages
 * 
 * Features:
 * - Different styling for user vs other messages
 * - System message styling (join/leave/system)
 * - Message grouping support
 * - Timestamp display
 * - Accessible message structure
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
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      // Show time only for messages within 24 hours
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // Show date and time for older messages
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
  };

  /**
   * Get message type styling
   */
  const getMessageTypeStyle = () => {
    switch (message.type) {
      case MessageType.JOIN:
        return {
          container: 'bg-success-50 border-success-200 text-success-800',
          icon: '👋',
        };
      case MessageType.LEAVE:
        return {
          container: 'bg-secondary-50 border-secondary-200 text-secondary-600',
          icon: '👋',
        };
      case MessageType.SYSTEM:
        return {
          container: 'bg-warning-50 border-warning-200 text-warning-800',
          icon: '📢',
        };
      default:
        return null;
    }
  };

  // System messages (join/leave/system)
  if (isSystemMessage) {
    const style = getMessageTypeStyle();
    
    return (
      <div
        className={clsx(
          'flex items-center justify-center py-2',
          className
        )}
        role="status"
        aria-label={`System message: ${message.content}`}
      >
        <div
          className={clsx(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
            style?.container
          )}
        >
          <span className="text-base" aria-hidden="true">
            {style?.icon}
          </span>
          <span>{message.content}</span>
          <span className="text-xs opacity-75">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // Regular chat messages
  return (
    <div
      className={clsx(
        'flex flex-col',
        isCurrentUser ? 'items-end' : 'items-start',
        className
      )}
      role="article"
      aria-label={`Message from ${message.sender}`}
    >
      {/* Sender name (only for non-grouped messages from others) */}
      {!isCurrentUser && !isGrouped && (
        <div className="text-xs text-secondary-600 mb-1 px-3">
          {message.sender}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={clsx(
          'relative max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-2.5 break-words',
          // Current user messages (right-aligned, blue)
          isCurrentUser && [
            'bg-primary-600 text-white',
            'rounded-br-md', // Less rounded bottom-right corner
          ],
          // Other user messages (left-aligned, gray)
          !isCurrentUser && [
            'bg-secondary-100 text-secondary-900',
            'rounded-bl-md', // Less rounded bottom-left corner
          ],
          // Grouping adjustments
          isGrouped && isCurrentUser && 'rounded-tr-md',
          isGrouped && !isCurrentUser && 'rounded-tl-md',
        )}
      >
        {/* Message content */}
        <div className="text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          className={clsx(
            'text-xs mt-1 text-right',
            isCurrentUser ? 'text-primary-200' : 'text-secondary-500'
          )}
        >
          {formatTimestamp(message.timestamp)}
        </div>

        {/* Message tail (speech bubble pointer) */}
        {!isGrouped && (
          <div
            className={clsx(
              'absolute top-0 w-3 h-3',
              isCurrentUser ? [
                'right-0 -mr-1 mt-1',
                'bg-primary-600',
                'clip-path-right-tail'
              ] : [
                'left-0 -ml-1 mt-1', 
                'bg-secondary-100',
                'clip-path-left-tail'
              ]
            )}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Delivery status (for current user messages) */}
      {isCurrentUser && (
        <div className="text-xs text-secondary-500 mt-1 px-3">
          <span className="inline-flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="sr-only">Message sent</span>
          </span>
        </div>
      )}
    </div>
  );
};