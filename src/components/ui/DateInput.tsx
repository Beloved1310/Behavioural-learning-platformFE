import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-pink-700 flex items-center space-x-2"
        >
          <span>🎂</span>
          <span>{label}</span>
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type="date"
          className={cn(
            // Base styling
            'w-full px-4 py-3 text-base border-2 rounded-xl focus:outline-none transition-all duration-300 shadow-sm',
            // Normal state - gradient border effect
            'border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50',
            // Hover state
            'hover:border-pink-300 hover:shadow-md',
            // Focus state
            'focus:ring-4 focus:ring-pink-200 focus:border-pink-400',
            // Date picker specific styling
            'relative [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:h-8 [&::-webkit-calendar-picker-indicator]:cursor-pointer',
            // Error state
            error && 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50',
            className
          )}
          {...props}
        />

        {/* Custom calendar icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center shadow-sm">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-80"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
      </div>

      {error && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {helperText && !error && (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
            <span>💡</span>
            <span>{helperText}</span>
          </div>
        </div>
      )}
    </div>
  );
});

DateInput.displayName = 'DateInput';