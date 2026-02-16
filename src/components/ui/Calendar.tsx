import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { cn } from '../../utils/cn';

interface CalendarProps {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (date: string) => void;
  name?: string;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
}

export interface CalendarRef {
  focus: () => void;
  blur: () => void;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthEmojis = ['❄️', '💖', '🌸', '🌷', '🌻', '☀️', '🌈', '🌊', '🍂', '🎃', '🍁', '⛄'];

export const Calendar = forwardRef<CalendarRef, CalendarProps>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      name,
      minDate,
      maxDate,
      placeholder = 'Select your birthday',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(() => {
      if (value) {
        return new Date(value);
      }
      return new Date();
    });

    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);

    useImperativeHandle(ref, () => ({
      focus: () => setIsOpen(true),
      blur: () => setIsOpen(false),
    }));

    const formatDate = (date: Date | null) => {
      if (!date) return '';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    const formatDateForInput = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setMonth(prev.getMonth() - 1);
        } else {
          newDate.setMonth(prev.getMonth() + 1);
        }
        return newDate;
      });
    };

    const navigateYear = (direction: 'prev' | 'next') => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        if (direction === 'prev') {
          newDate.setFullYear(prev.getFullYear() - 1);
        } else {
          newDate.setFullYear(prev.getFullYear() + 1);
        }
        return newDate;
      });
    };

    const selectDate = (day: number) => {
      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

      // Check if date is within min/max bounds
      if (minDate && newDate < new Date(minDate)) return;
      if (maxDate && newDate > new Date(maxDate)) return;

      setSelectedDate(newDate);
      onChange?.(formatDateForInput(newDate));
      setIsOpen(false);
    };

    const renderCalendarDays = () => {
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDay = getFirstDayOfMonth(currentDate);
      const days = [];

      // Empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10"></div>);
      }

      // Days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isSelected =
          selectedDate &&
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear();

        const isToday = new Date().toDateString() === date.toDateString();
        const isDisabled =
          (minDate && date < new Date(minDate)) || (maxDate && date > new Date(maxDate));

        days.push(
          <button
            key={day}
            type="button"
            onClick={() => selectDate(day)}
            disabled={isDisabled}
            className={cn(
              'w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-110 active:scale-95',
              isSelected &&
                'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-lg transform scale-110',
              !isSelected &&
                !isDisabled &&
                'hover:bg-gradient-to-r hover:from-pink-200 hover:to-purple-200 hover:shadow-md',
              isToday && !isSelected && 'bg-yellow-200 border-2 border-yellow-400',
              isDisabled && 'opacity-30 cursor-not-allowed hover:scale-100',
              !isSelected && !isToday && !isDisabled && 'hover:bg-blue-100'
            )}
          >
            {day}
          </button>
        );
      }

      return days;
    };

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-pink-700 flex items-center space-x-2">
            <span>🎂</span>
            <span>{label}</span>
          </label>
        )}

        {/* Date display button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-full px-3 sm:px-4 py-2 sm:py-3 text-left border-2 rounded-xl focus:outline-none transition-all duration-300 shadow-sm',
              'border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50',
              'hover:border-pink-300 hover:shadow-md',
              'focus:ring-4 focus:ring-pink-200 focus:border-pink-400',
              error && 'border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50'
            )}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'text-sm sm:text-base truncate pr-2',
                  selectedDate ? 'text-gray-900' : 'text-gray-500'
                )}
              >
                {selectedDate ? formatDate(selectedDate) : placeholder}
              </span>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-400 to-purple-400 rounded-lg flex items-center justify-center shadow-sm">
                  <svg
                    className={cn(
                      'w-3 h-3 sm:w-4 sm:h-4 text-white transition-transform duration-200',
                      isOpen && 'transform rotate-180'
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </button>

          {/* Calendar popup */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 z-[60] mt-2 bg-white rounded-xl shadow-2xl border-2 border-pink-200 p-3 sm:p-4 md:p-6 animate-in slide-in-from-top-2 duration-300 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Header with navigation */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    type="button"
                    onClick={() => navigateYear('prev')}
                    className="p-1 sm:p-2 rounded-lg hover:bg-pink-100 transition-colors duration-200"
                  >
                    <span className="text-sm sm:text-lg">⏪</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateMonth('prev')}
                    className="p-1 sm:p-2 rounded-lg hover:bg-pink-100 transition-colors duration-200"
                  >
                    <span className="text-sm sm:text-lg">◀️</span>
                  </button>
                </div>

                <div className="text-center">
                  <div className="text-sm sm:text-base md:text-lg font-bold text-purple-700 flex items-center space-x-1 sm:space-x-2">
                    <span>{monthEmojis[currentDate.getMonth()]}</span>
                    <span className="hidden sm:inline">{monthNames[currentDate.getMonth()]}</span>
                    <span className="sm:hidden">
                      {monthNames[currentDate.getMonth()].substring(0, 3)}
                    </span>
                    <span>{currentDate.getFullYear()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button
                    type="button"
                    onClick={() => navigateMonth('next')}
                    className="p-1 sm:p-2 rounded-lg hover:bg-pink-100 transition-colors duration-200"
                  >
                    <span className="text-sm sm:text-lg">▶️</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateYear('next')}
                    className="p-1 sm:p-2 rounded-lg hover:bg-pink-100 transition-colors duration-200"
                  >
                    <span className="text-sm sm:text-lg">⏩</span>
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-purple-600"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">{renderCalendarDays()}</div>

              {/* Today button */}
              <div className="mt-2 sm:mt-3 md:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-pink-200">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentDate(today);
                    selectDate(today.getDate());
                  }}
                  className="w-full py-1.5 sm:py-2 px-3 sm:px-4 text-sm sm:text-base bg-gradient-to-r from-green-400 to-blue-400 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  🗓️ Today
                </button>
              </div>
            </div>
          )}

          {/* Decorative elements */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-80"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
        </div>

        {/* Hidden input for form submission */}
        <input
          type="hidden"
          name={name}
          value={selectedDate ? formatDateForInput(selectedDate) : ''}
        />

        {/* Error and helper text */}
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

        {/* Click outside to close */}
        {isOpen && <div className="fixed inset-0 z-[55]" onClick={() => setIsOpen(false)} />}
      </div>
    );
  }
);

Calendar.displayName = 'Calendar';
