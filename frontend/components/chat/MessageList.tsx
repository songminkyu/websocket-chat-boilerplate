'use client';

import React, { useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { ChatMessage, MessageType } from '@/types/chat';
import { MessageItem } from './MessageItem';

/**
 * MessageList component props
 */
interface MessageListProps {
  messages: ChatMessage[];
  currentUsername: string | null;
  className?: string;
}

/**
 * MessageList component for displaying chat messages
 * 
 * Features:
 * - Auto-scroll to bottom on new messages
 * - Proper message grouping and spacing
 * - Optimized rendering for performance
 * - Accessible message list with proper semantics
 * - Empty state handling
 */
export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUsername,
  className,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = (force = false) => {
    if (!messagesEndRef.current || !messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom = 
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    // Auto-scroll if user is near bottom or if it's a forced scroll
    if (force || isNearBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  /**
   * Auto-scroll on new messages
   */
  useEffect(() => {
    const newMessageCount = messages.length;
    const hasNewMessages = newMessageCount > lastMessageCountRef.current;
    
    if (hasNewMessages) {
      scrollToBottom(newMessageCount === 1); // Force scroll for first message
      lastMessageCountRef.current = newMessageCount;
    }
  }, [messages]);

  /**
   * Check if messages should be grouped together
   */
  const shouldGroupWithPrevious = (
    currentMessage: ChatMessage,
    previousMessage: ChatMessage | undefined
  ): boolean => {
    if (!previousMessage) return false;
    if (currentMessage.sender !== previousMessage.sender) return false;
    if (currentMessage.type !== MessageType.CHAT || previousMessage.type !== MessageType.CHAT) {
      return false;
    }

    // Group messages sent within 2 minutes of each other
    const currentTime = new Date(currentMessage.timestamp).getTime();
    const previousTime = new Date(previousMessage.timestamp).getTime();
    const timeDiff = currentTime - previousTime;
    
    return timeDiff < 2 * 60 * 1000; // 2 minutes
  };

  /**
   * Empty state component
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-64 text-secondary-500">
      <div className="w-16 h-16 mb-4 rounded-full bg-secondary-100 flex items-center justify-center">
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
      <p className="text-center text-sm">
        Start the conversation by sending your first message!
      </p>
    </div>
  );

  return (
    <div
      className={clsx(
        'flex flex-col h-full overflow-hidden bg-white',
        className
      )}
    >
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const isGrouped = shouldGroupWithPrevious(message, previousMessage);
            const isCurrentUser = currentUsername === message.sender;

            return (
              <MessageItem
                key={message.id}
                message={message}
                isCurrentUser={isCurrentUser}
                isGrouped={isGrouped}
                className={clsx(
                  'animate-fade-in',
                  // Add extra spacing for ungrouped messages
                  !isGrouped && index > 0 && 'mt-4'
                )}
              />
            );
          })
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-px" aria-hidden="true" />
      </div>

      {/* Scroll to bottom button (shown when not at bottom) */}
      <div className="relative">
        <button
          onClick={() => scrollToBottom(true)}
          className={clsx(
            'absolute bottom-4 right-4 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 transform hover:scale-105 active:scale-95',
            'opacity-0 pointer-events-none', // Hidden by default - would need scroll position tracking to show/hide
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          )}
          aria-label="Scroll to bottom"
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
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};