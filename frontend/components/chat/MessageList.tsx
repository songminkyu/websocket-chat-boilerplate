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
 * Simple MessageList component with clear sender names in bubbles
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


  return (
    <div
      className={clsx(
        'flex flex-col h-full overflow-hidden',
        className
      )}
    >
      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-medium text-lg mb-2">아직 메시지가 없습니다</h3>
            <p className="text-sm text-center">
              첫 번째 메시지를 보내서 대화를 시작해보세요
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const isCurrentUser = currentUsername === message.sender;
              
              return (
                <div
                  key={message.id}
                  className={clsx(
                    'flex',
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl',
                      isCurrentUser 
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    )}
                  >
                    {/* Sender name - always show clearly */}
                    <div className={clsx(
                      'text-xs font-semibold mb-1',
                      isCurrentUser ? 'text-blue-100' : 'text-gray-600'
                    )}>
                      {message.sender}
                    </div>
                    {/* Message content */}
                    <div className="text-sm">
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} className="h-px" aria-hidden="true" />
      </div>
    </div>
  );
};