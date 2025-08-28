'use client';

import React, { useState } from 'react';
import { UserSession } from '@/types/chat';

interface ContactsSidebarProps {
  currentUsername: string | null;
  activeUsers: UserSession[];
  onUserSelect?: (username: string) => void;
}

/**
 * ContactsSidebar component matching the reference UI design
 * Left panel showing user profile, search, online users, and contacts list
 */
export const ContactsSidebar: React.FC<ContactsSidebarProps> = ({
  currentUsername,
  activeUsers,
  onUserSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = activeUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getUserColor = (username: string) => {
    // Generate consistent color based on username
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <div className="contacts-sidebar">
      {/* Header with profile and search */}
      <div className="contacts-header">
        {/* User Profile Section */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${getUserColor(currentUsername || 'U')}`}>
            {getInitials(currentUsername || 'User')}
          </div>
          <div className="flex-1">
            <h1 className="font-semibold text-base text-gray-900 truncate">
              {currentUsername || 'User'}
            </h1>
          </div>
          <button 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {/* Search Bar - Compact */}
        <div className="px-3 pb-2">
          <div className="relative">
            <svg 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Join Area - Compact */}
      {activeUsers.length > 0 && (
        <div className="px-3 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-gray-600">Online ({activeUsers.length})</h3>
          </div>
          
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {activeUsers.slice(0, 6).map((user) => (
              <button
                key={user.username}
                onClick={() => onUserSelect?.(user.username)}
                className="flex-shrink-0 relative"
                title={user.username}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getUserColor(user.username)}`}>
                  {getInitials(user.username)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border border-white rounded-full"></div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Section */}
      <div className="messages-section">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Messages</h3>
        </div>

        <div className="contacts-list">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p className="text-xs text-gray-500 text-center">
                {searchQuery ? 'No users found' : 'No active users'}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.username}
                onClick={() => onUserSelect?.(user.username)}
                className="contact-item"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getUserColor(user.username)}`}>
                      {getInitials(user.username)}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-gray-900 truncate">
                        {user.username}
                      </h4>
                      <span className="text-xs text-gray-500">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      Available to chat
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};