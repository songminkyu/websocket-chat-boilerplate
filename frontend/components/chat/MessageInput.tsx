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
 * Compact MessageInput component for messenger-style chat
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
    <div className={clsx('flex items-end gap-3', className)}>
      {/* Emoji/Attachment button */}
      <button
        className="btn-icon mb-1"
        title="Add emoji"
        disabled={disabled}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Message input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className={clsx(
            'input-compact w-full resize-none min-h-[40px] max-h-[100px]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="Type your message"
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSendMessage}
        disabled={isButtonDisabled}
        className={clsx(
          'btn-compact w-10 h-10 flex-shrink-0 mb-1',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        title="Send message"
      >
        {isSending ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        )}
      </button>
    </div>
  );
};