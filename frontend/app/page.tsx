'use client';

import React, { useState } from 'react';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useChat } from '@/hooks/useChat';
import { VALIDATION, DEFAULTS } from '@/lib/constants';

/**
 * Home page component with compact messenger-style login and chat interface
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
      <div className="chat-container">
        {/* Compact Header */}
        <header className="chat-header">
          <div className="flex items-center gap-3">
            <div className="avatar-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-semibold text-sm text-secondary-900">
                {username}
              </h1>
              <div className="flex items-center gap-1">
                <div className="status-online"></div>
                <span className="text-meta">Online</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDisconnect}
            className="btn-icon"
            title="Disconnect"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </header>

        {/* Chat Room */}
        <div className="flex-1 min-h-0">
          <ChatRoom
            roomId={DEFAULTS.ROOM_ID}
            roomName={DEFAULTS.ROOM_NAME}
            showUserList={false}
          />
        </div>
      </div>
    );
  }

  // Compact login screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4">
      <div className="w-full max-w-sm">
        {/* Simple Header */}
        <div className="text-center mb-6">
          <div className="avatar-sm mx-auto mb-3">
            💬
          </div>
          <h1 className="text-xl font-bold text-secondary-900 mb-1">
            Chat
          </h1>
          <p className="text-meta">
            Enter your username to join
          </p>
        </div>

        {/* Compact Login Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-secondary-200 p-6">
          <form onSubmit={handleConnect} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Username Input */}
            <div>
              <input
                type="text"
                value={usernameInput}
                onChange={handleUsernameChange}
                placeholder="Username"
                disabled={isLoading}
                className="input-compact w-full"
                autoComplete="username"
                autoFocus
              />
              {usernameError && (
                <p className="text-meta text-red-500 mt-1">{usernameError}</p>
              )}
            </div>

            {/* Connect Button */}
            <button
              type="submit"
              disabled={isLoading || !usernameInput.trim()}
              className="btn-compact w-full h-10 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Connecting...
                </div>
              ) : (
                'Join Chat'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-4 pt-4 border-t border-secondary-100">
            <div className="text-center">
              <p className="text-meta">
                WebSocket Chat • Real-time messaging
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}