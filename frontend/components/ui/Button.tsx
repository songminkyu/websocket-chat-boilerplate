'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

/**
 * Button component props
 */
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Reusable Button component with multiple variants and states
 * 
 * Features:
 * - Multiple variants (primary, secondary, outline, ghost, destructive)
 * - Different sizes (xs to xl)
 * - Loading state with spinner
 * - Icon support (left/right)
 * - Full width option
 * - Accessible with proper ARIA attributes
 * - Forwarded refs
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const buttonClasses = clsx(
      // Base styles
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95',
      
      // Size variants
      {
        'px-2 py-1 text-xs gap-1': size === 'xs',
        'px-3 py-1.5 text-sm gap-1.5': size === 'sm',
        'px-4 py-2 text-base gap-2': size === 'md',
        'px-5 py-2.5 text-lg gap-2.5': size === 'lg',
        'px-6 py-3 text-xl gap-3': size === 'xl',
      },
      
      // Variant styles
      {
        // Primary variant
        'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400':
          variant === 'primary',
        
        // Secondary variant
        'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 disabled:bg-secondary-400':
          variant === 'secondary',
        
        // Outline variant
        'border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300':
          variant === 'outline',
        
        // Ghost variant
        'text-primary-600 bg-transparent hover:bg-primary-50 focus:ring-primary-500 disabled:text-primary-300':
          variant === 'ghost',
        
        // Destructive variant
        'bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 disabled:bg-error-400':
          variant === 'destructive',
      },
      
      // Full width
      {
        'w-full': fullWidth,
      },
      
      // Disabled state
      {
        'cursor-not-allowed opacity-60': isDisabled,
        'cursor-pointer': !isDisabled,
      },
      
      className
    );

    // Icon size based on button size
    const iconSize = {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-7 h-7',
    }[size];

    // Loading spinner component
    const LoadingSpinner = () => (
      <svg
        className={clsx('animate-spin', iconSize)}
        fill="none"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
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
    );

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <LoadingSpinner />
        ) : leftIcon ? (
          <span className={iconSize}>{leftIcon}</span>
        ) : null}

        {/* Button text */}
        {children && (
          <span className={loading ? 'opacity-0' : undefined}>
            {children}
          </span>
        )}

        {/* Right icon (hidden when loading) */}
        {rightIcon && !loading && (
          <span className={iconSize}>{rightIcon}</span>
        )}

        {/* Loading text (absolute positioned) */}
        {loading && children && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner />
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';