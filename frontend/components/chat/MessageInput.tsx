'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
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
 * MessageInput component for composing and sending messages
 * 
 * Features:
 * - Auto-expanding textarea
 * - Keyboard shortcuts (Enter to send, Shift+Enter for new line)
 * - Message validation and length limits
 * - Send button with loading state
 * - Accessible form controls
 * - Character counter
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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

    // Allow Shift+Enter for new lines
    if (e.key === 'Enter' && e.shiftKey) {
      // Default behavior - just add a new line
      return;
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
      return; // Message too long (shouldn't happen due to input validation)
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
  const characterCount = message.length;
  const isNearLimit = characterCount > VALIDATION.MESSAGE.MAX_LENGTH * 0.8;
  const isOverLimit = characterCount > VALIDATION.MESSAGE.MAX_LENGTH;

  return (
    <div
      className={clsx(
        'border-t border-secondary-200 bg-white px-4 py-3',
        className
      )}
    >
      <div className="flex flex-col gap-2">
        {/* Character counter (shown when approaching limit) */}
        {isNearLimit && (
          <div className="flex justify-end">
            <span
              className={clsx(
                'text-xs font-medium',
                isOverLimit ? 'text-error-600' : 'text-warning-600'
              )}
            >
              {characterCount}/{VALIDATION.MESSAGE.MAX_LENGTH}
            </span>
          </div>
        )}

        {/* Message input container */}
        <div className="flex items-end gap-3">
          {/* Textarea */}
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
                'w-full resize-none rounded-lg border border-secondary-300 px-4 py-2.5',
                'text-base placeholder-secondary-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
                'transition-colors duration-200',
                // Disabled state
                disabled && 'bg-secondary-50 cursor-not-allowed opacity-60',
                // Error state for over-limit
                isOverLimit && 'border-error-500 focus:border-error-500 focus:ring-error-500'
              )}
              aria-label="Type your message"
              aria-describedby={isNearLimit ? 'character-counter' : undefined}
            />
            
            {/* Textarea overlay for styling (if needed) */}
            <div
              className="absolute inset-0 pointer-events-none rounded-lg ring-1 ring-transparent transition-all duration-200"
              aria-hidden="true"
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSendMessage}
            disabled={isButtonDisabled}
            loading={isSending}
            size="md"
            variant="primary"
            className="shrink-0"
            aria-label="Send message"
          >
            {/* Send icon */}
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
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Help text */}
        <div className="flex justify-between items-center text-xs text-secondary-500">
          <span>
            Press Enter to send, Shift+Enter for new line
          </span>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {disabled ? (
              <span className="flex items-center gap-1 text-error-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Disconnected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-success-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};