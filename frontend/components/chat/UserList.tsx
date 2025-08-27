'use client';

import React from 'react';
import { clsx } from 'clsx';
import { UserSession } from '@/types/chat';

/**
 * UserList component props
 */
interface UserListProps {
  users: UserSession[];
  currentUsername: string | null;
  className?: string;
}

/**
 * UserList component for displaying active users in the chat room
 * 
 * Features:
 * - Active user display with status indicators
 * - Current user highlighting
 * - Online/offline status
 * - User count display
 * - Empty state handling
 */
export const UserList: React.FC<UserListProps> = ({
  users,
  currentUsername,
  className,
}) => {
  /**
   * Sort users with current user first, then alphabetically
   */
  const sortedUsers = [...users].sort((a, b) => {
    // Current user first
    if (a.username === currentUsername) return -1;
    if (b.username === currentUsername) return 1;
    
    // Then by username alphabetically
    return a.username.localeCompare(b.username);
  });

  /**
   * Get user status color
   */
  const getUserStatusColor = (user: UserSession): string => {
    if (!user.isActive) return 'bg-secondary-400';
    
    // Check if user was recently active (within 5 minutes)
    const lastActivity = new Date(user.lastActivity).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    return (now - lastActivity) < fiveMinutes ? 'bg-success-500' : 'bg-warning-500';
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = (username: string): string => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Empty state component
   */
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-secondary-500">
      <div className="w-12 h-12 mb-3 rounded-full bg-secondary-200 flex items-center justify-center">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      </div>
      <p className="text-sm font-medium">No users online</p>
    </div>
  );

  return (
    <div className={clsx('flex flex-col bg-secondary-50', className)}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-secondary-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-secondary-900">
            Online Users
          </h3>
          <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
            {users.length}
          </span>
        </div>
      </div>

      {/* User list */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="p-2 space-y-1">
            {sortedUsers.map((user) => {
              const isCurrentUser = user.username === currentUsername;
              const statusColor = getUserStatusColor(user);
              const initials = getUserInitials(user.username);

              return (
                <div
                  key={user.sessionId}
                  className={clsx(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors',
                    isCurrentUser
                      ? 'bg-primary-100 border border-primary-200'
                      : 'hover:bg-white'
                  )}
                >
                  {/* User avatar */}
                  <div className="relative">
                    <div
                      className={clsx(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                        isCurrentUser
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-200 text-secondary-700'
                      )}
                    >
                      {initials}
                    </div>
                    
                    {/* Status indicator */}
                    <div
                      className={clsx(
                        'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                        statusColor
                      )}
                      aria-label={
                        user.isActive
                          ? 'User is online'
                          : 'User is offline'
                      }
                    />
                  </div>

                  {/* User info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={clsx(
                          'text-sm font-medium truncate',
                          isCurrentUser
                            ? 'text-primary-800'
                            : 'text-secondary-900'
                        )}
                      >
                        {user.username}
                        {isCurrentUser && (
                          <span className="text-xs font-normal text-primary-600 ml-1">
                            (You)
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Last activity */}
                    <p className="text-xs text-secondary-500 truncate">
                      {user.isActive ? 'Active now' : 'Offline'}
                    </p>
                  </div>

                  {/* User menu (future feature) */}
                  <button
                    className={clsx(
                      'p-1 rounded hover:bg-secondary-100 text-secondary-400 hover:text-secondary-600 transition-colors opacity-0 group-hover:opacity-100',
                      'focus:outline-none focus:opacity-100'
                    )}
                    aria-label={`User menu for ${user.username}`}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-secondary-200 bg-white">
        <div className="text-xs text-secondary-500 text-center">
          {users.length === 1 ? (
            '1 user online'
          ) : (
            `${users.length} users online`
          )}
        </div>
      </div>
    </div>
  );
};