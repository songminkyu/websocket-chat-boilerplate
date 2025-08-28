'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import { VALIDATION, DEFAULTS } from '@/lib/constants';

/**
 * MessageInput component props
 */
interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Simple MessageInput component with text field and labeled send button
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = DEFAULTS.MESSAGE_PLACEHOLDER,
  className,
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Auto-resize textarea based on content
   */
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
    }
  };

  /**
   * Handle input change with validation
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    
    // Enforce maximum length
    if (value.length <= VALIDATION.MESSAGE.MAX_LENGTH) {
      setMessage(value);
      adjustTextareaHeight();
    }
  };

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send message on Enter (but not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Send message with validation
   */
  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();
    
    // Validation
    if (!trimmedMessage) {
      return; // Don't send empty messages
    }

    if (trimmedMessage.length < VALIDATION.MESSAGE.MIN_LENGTH) {
      return; // Message too short
    }

    if (trimmedMessage.length > VALIDATION.MESSAGE.MAX_LENGTH) {
      return; // Message too long
    }

    setIsSending(true);
    
    try {
      await onSendMessage(trimmedMessage);
      setMessage(''); // Clear input after successful send
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Check if message is valid for sending
   */
  const isValidMessage = () => {
    const trimmedMessage = message.trim();
    return (
      trimmedMessage.length >= VALIDATION.MESSAGE.MIN_LENGTH &&
      trimmedMessage.length <= VALIDATION.MESSAGE.MAX_LENGTH
    );
  };

  const isButtonDisabled = disabled || isSending || !isValidMessage();

  return (
    <div className={clsx('flex items-center gap-3', className)}>
      {/* Simple message input */}
      <div className="flex-1">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={clsx(
            'w-full px-4 py-3 border border-gray-300 rounded-lg resize-none',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'text-sm bg-white',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Type your message"
          style={{ minHeight: '48px', maxHeight: '100px' }}
        />
      </div>

      {/* Simple send button with clear label */}
      <button
        onClick={handleSendMessage}
        disabled={isButtonDisabled}
        className={clsx(
          'px-6 py-3 rounded-lg font-medium text-sm transition-colors',
          'flex items-center gap-2',
          isValidMessage() && !disabled && !isSending 
            ? 'bg-blue-500 hover:bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        )}
      >
        {isSending ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            전송중...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            전송
          </>
        )}
      </button>
    </div>
  );
};