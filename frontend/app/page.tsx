'use client';

import React, { useState } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { VALIDATION, DEFAULTS } from '@/lib/constants';

/**
 * Home page component with login and chat interface
 * 
 * Features:
 * - Username entry and validation
 * - Chat room interface
 * - Connection management
 * - Responsive design
 * - Loading and error states
 */
export default function HomePage() {
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');

  const {
    isConnected,
    username,
    isLoading,
    error,
    connect,
    disconnect,
  } = useChat();

  /**
   * Validate username input
   */
  const validateUsername = (value: string): string | null => {
    if (!value.trim()) {
      return VALIDATION.USERNAME.ERROR_MESSAGES.REQUIRED;
    }
    
    if (value.length < VALIDATION.USERNAME.MIN_LENGTH) {
      return VALIDATION.USERNAME.ERROR_MESSAGES.MIN_LENGTH;
    }
    
    if (value.length > VALIDATION.USERNAME.MAX_LENGTH) {
      return VALIDATION.USERNAME.ERROR_MESSAGES.MAX_LENGTH;
    }
    
    if (!VALIDATION.USERNAME.PATTERN.test(value)) {
      return VALIDATION.USERNAME.ERROR_MESSAGES.PATTERN;
    }
    
    return null;
  };

  /**
   * Handle username input change
   */
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsernameInput(value);
    
    // Clear error when user starts typing
    if (usernameError) {
      setUsernameError('');
    }
  };

  /**
   * Handle connect/join chat
   */
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateUsername(usernameInput);
    if (validation) {
      setUsernameError(validation);
      return;
    }
    
    try {
      await connect(usernameInput.trim());
    } catch (error) {
      // Error is handled by the useChat hook
      console.error('Connection failed:', error);
    }
  };

  /**
   * Handle disconnect
   */
  const handleDisconnect = () => {
    disconnect();
    setUsernameInput('');
    setUsernameError('');
  };

  // If user is connected and has a username, show chat interface
  if (isConnected && username) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-secondary-200 shadow-sm">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  WebSocket Chat Platform
                </h1>
                <p className="text-sm text-secondary-600">
                  Connected as <span className="font-medium">{username}</span>
                </p>
              </div>
              
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </header>

        {/* Chat room */}
        <div className="flex-1 overflow-hidden">
          <ChatRoom
            roomId={DEFAULTS.ROOM_ID}
            roomName={DEFAULTS.ROOM_NAME}
            showUserList={true}
          />
        </div>
      </div>
    );
  }

  // Login/connection screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
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
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            WebSocket Chat
          </h1>
          <p className="text-secondary-600">
            Enter your username to join the conversation
          </p>
        </div>

        {/* Connection form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleConnect} className="space-y-6">
            {/* Global error */}
            {error && (
              <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
                <div className="flex items-center gap-2 text-error-800">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            {/* Username input */}
            <Input
              label="Username"
              placeholder="Enter your username..."
              value={usernameInput}
              onChange={handleUsernameChange}
              error={usernameError}
              disabled={isLoading}
              required
              autoComplete="username"
              autoFocus
              leftIcon={
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              }
              helperText={`${VALIDATION.USERNAME.MIN_LENGTH}-${VALIDATION.USERNAME.MAX_LENGTH} characters, letters, numbers, and underscores only`}
            />

            {/* Connect button */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading || !usernameInput.trim()}
              fullWidth
              size="lg"
              rightIcon={
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              }
            >
              {isLoading ? 'Connecting...' : 'Join Chat'}
            </Button>
          </form>

          {/* Additional info */}
          <div className="mt-6 pt-6 border-t border-secondary-200">
            <div className="text-center">
              <p className="text-xs text-secondary-500 mb-2">
                Powered by WebSocket & STOMP Protocol
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-secondary-400">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  Real-time
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  Secure
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-warning-500 rounded-full" />
                  Fast
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-secondary-500">
            Built with Next.js 15 & Spring Boot 3
          </p>
        </div>
      </div>
    </div>
  );
}