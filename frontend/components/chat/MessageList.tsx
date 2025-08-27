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
 * Compact MessageList component for messenger-style chat
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
      scrollToBottom(newMessageCount === 1);
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

    // Group messages sent within 5 minutes of each other
    const currentTime = new Date(currentMessage.timestamp).getTime();
    const previousTime = new Date(previousMessage.timestamp).getTime();
    const timeDiff = currentTime - previousTime;
    
    return timeDiff < 5 * 60 * 1000; // 5 minutes
  };

  /**
   * Empty state component
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-secondary-500 p-8">
      <div className="avatar-sm mb-4 bg-secondary-300">
        💬
      </div>
      <h3 className="font-medium text-sm mb-2">No messages yet</h3>
      <p className="text-meta text-center">
        Start the conversation by sending your first message
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
        className="flex-1 overflow-y-auto"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="py-2">
            {messages.map((message, index) => {
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
                    // Add spacing between different senders
                    !isGrouped && index > 0 && 'mt-3'
                  )}
                />
              );
            })}
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-px" aria-hidden="true" />
      </div>
    </div>
  );
};