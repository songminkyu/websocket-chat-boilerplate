'use client';

import React from 'react';
import { clsx } from 'clsx';
import { ConnectionStatus as ConnectionStatusType } from '@/types/chat';

/**
 * ConnectionStatus component props
 */
interface ConnectionStatusProps {
  status: ConnectionStatusType;
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

/**
 * ConnectionStatus component for displaying WebSocket connection status
 * 
 * Features:
 * - Visual status indicators with colors and icons
 * - Accessible status text
 * - Animated states for connecting/reconnecting
 * - Configurable display options
 */
export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  status,
  className,
  showIcon = true,
  showText = true,
}) => {
  /**
   * Get status configuration
   */
  const getStatusConfig = (status: ConnectionStatusType) => {
    switch (status) {
      case ConnectionStatusType.CONNECTED:
        return {
          color: 'text-success-600',
          bgColor: 'bg-success-500',
          text: 'Connected',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          animate: false,
        };

      case ConnectionStatusType.CONNECTING:
        return {
          color: 'text-warning-600',
          bgColor: 'bg-warning-500',
          text: 'Connecting...',
          icon: (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
          animate: true,
        };

      case ConnectionStatusType.RECONNECTING:
        return {
          color: 'text-warning-600',
          bgColor: 'bg-warning-500',
          text: 'Reconnecting...',
          icon: (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
          animate: true,
        };

      case ConnectionStatusType.DISCONNECTED:
        return {
          color: 'text-secondary-500',
          bgColor: 'bg-secondary-400',
          text: 'Disconnected',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
          ),
          animate: false,
        };

      case ConnectionStatusType.ERROR:
        return {
          color: 'text-error-600',
          bgColor: 'bg-error-500',
          text: 'Connection Error',
          icon: (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
          animate: false,
        };

      default:
        return {
          color: 'text-secondary-500',
          bgColor: 'bg-secondary-400',
          text: 'Unknown',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          animate: false,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-2',
        config.color,
        className
      )}
      role="status"
      aria-label={`Connection status: ${config.text}`}
    >
      {/* Status indicator dot */}
      {showIcon && (
        <div className="relative">
          <div
            className={clsx(
              'w-2 h-2 rounded-full',
              config.bgColor,
              config.animate && 'animate-pulse'
            )}
          />
          
          {/* Pulse animation for connecting states */}
          {config.animate && (
            <div
              className={clsx(
                'absolute inset-0 w-2 h-2 rounded-full animate-ping',
                config.bgColor,
                'opacity-75'
              )}
            />
          )}
        </div>
      )}

      {/* Status icon */}
      {showIcon && (
        <span className={clsx(config.color)}>
          {config.icon}
        </span>
      )}

      {/* Status text */}
      {showText && (
        <span
          className={clsx(
            'text-sm font-medium',
            config.animate && 'animate-pulse'
          )}
        >
          {config.text}
        </span>
      )}

      {/* Screen reader only detailed status */}
      <span className="sr-only">
        {status === ConnectionStatusType.CONNECTED &&
          'WebSocket connection is active'}
        {status === ConnectionStatusType.CONNECTING &&
          'Establishing WebSocket connection'}
        {status === ConnectionStatusType.RECONNECTING &&
          'Attempting to reconnect to WebSocket server'}
        {status === ConnectionStatusType.DISCONNECTED &&
          'WebSocket connection is closed'}
        {status === ConnectionStatusType.ERROR &&
          'WebSocket connection error occurred'}
      </span>
    </div>
  );
};