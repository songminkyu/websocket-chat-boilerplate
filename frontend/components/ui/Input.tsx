'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

/**
 * Input component props
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Reusable Input component with validation and styling
 * 
 * Features:
 * - Multiple variants and sizes
 * - Error states and validation
 * - Icon support (left/right)
 * - Accessible with proper ARIA attributes
 * - Forwarded refs for form libraries
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      className,
      disabled,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Base input styles
    const inputClasses = clsx(
      // Base styles
      'w-full font-medium transition-colors duration-200 focus:outline-none',
      
      // Size variants
      {
        'px-3 py-2 text-sm': size === 'sm',
        'px-4 py-2.5 text-base': size === 'md',
        'px-5 py-3 text-lg': size === 'lg',
      },
      
      // Variant styles
      {
        // Default variant
        'border border-secondary-300 rounded-lg bg-white hover:border-secondary-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500':
          variant === 'default',
        
        // Filled variant
        'border-0 rounded-lg bg-secondary-100 hover:bg-secondary-200 focus:bg-white focus:ring-2 focus:ring-primary-500':
          variant === 'filled',
        
        // Outlined variant
        'border-2 border-secondary-300 rounded-lg bg-transparent hover:border-secondary-400 focus:border-primary-500':
          variant === 'outlined',
      },
      
      // Error states
      {
        'border-error-500 focus:border-error-500 focus:ring-error-500': error && variant !== 'filled',
        'bg-error-50 focus:bg-error-50 focus:ring-error-500': error && variant === 'filled',
      },
      
      // Disabled states
      {
        'opacity-60 cursor-not-allowed bg-secondary-50 border-secondary-200': disabled,
      },
      
      // Icon padding adjustments
      {
        'pl-10': leftIcon && size === 'sm',
        'pl-11': leftIcon && size === 'md',
        'pl-12': leftIcon && size === 'lg',
        'pr-10': rightIcon && size === 'sm',
        'pr-11': rightIcon && size === 'md',
        'pr-12': rightIcon && size === 'lg',
      },
      
      className
    );

    // Icon container styles
    const iconClasses = clsx(
      'absolute top-1/2 transform -translate-y-1/2 pointer-events-none',
      {
        'w-4 h-4': size === 'sm',
        'w-5 h-5': size === 'md',
        'w-6 h-6': size === 'lg',
      },
      error ? 'text-error-500' : 'text-secondary-400'
    );

    const leftIconClasses = clsx(
      iconClasses,
      {
        'left-3': size === 'sm',
        'left-3.5': size === 'md',
        'left-4': size === 'lg',
      }
    );

    const rightIconClasses = clsx(
      iconClasses,
      {
        'right-3': size === 'sm',
        'right-3.5': size === 'md',
        'right-4': size === 'lg',
      }
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium mb-2',
              error ? 'text-error-700' : 'text-secondary-700',
              disabled && 'opacity-60'
            )}
          >
            {label}
            {required && <span className="text-error-500 ml-1" aria-label="required">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className={leftIconClasses}>
              {leftIcon}
            </div>
          )}

          {/* Input element */}
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-help` : undefined
            }
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className={rightIconClasses}>
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm text-error-600 animate-slide-up"
            role="alert"
          >
            {error}
          </p>
        )}

        {/* Helper text */}
        {helperText && !error && (
          <p
            id={`${inputId}-help`}
            className="mt-2 text-sm text-secondary-600"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';