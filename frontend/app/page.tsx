'use client';

import React, { useState } from 'react';
import { MessageList } from '@/components/chat/MessageList';
import { MessageInput } from '@/components/chat/MessageInput';
import { useChat } from '@/hooks/useChat';
import { VALIDATION, DEFAULTS } from '@/lib/constants';
import { UserSession } from '@/types/chat';

/**
 * Home page component with compact messenger-style login and chat interface
 */
export default function HomePage() {
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const {
    isConnected,
    username,
    isLoading,
    error,
    activeUsers,
    messages,
    connect,
    disconnect,
    sendMessage,
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

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getUserColor = (username: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // If user is connected and has a username, show simple 3-area chat interface
  if (isConnected && username) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 1. 상단 유저 목록 - Top User List */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">채팅방 참여자</h2>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                나가기
              </button>
            </div>
            <div className="flex items-center gap-4 overflow-x-auto">
              {activeUsers.map((user) => (
                <div key={user.username} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getUserColor(user.username)}`}>
                    {getInitials(user.username)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 중앙 채팅창 - Center Chat Area */}
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto h-full">
            <MessageList 
              messages={messages}
              currentUsername={username}
            />
          </div>
        </div>

        {/* 3. 하단 채팅 입력창 - Bottom Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <MessageInput
              onSendMessage={sendMessage}
              disabled={!isConnected}
              placeholder="메시지를 입력하세요..."
            />
          </div>
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