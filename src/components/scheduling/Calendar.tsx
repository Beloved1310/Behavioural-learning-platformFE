import React, { useState } from 'react';

interface Session {
  userId: string;
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  tutor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'confirmed' | 'pending';
  isRecurring?: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface CalendarProps {
  sessions: Session[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onEditSession: (session: Session) => void;
}

export const Calendar: React.FC<CalendarProps> = ({
  sessions,
  selectedDate,
  onSelectDate,
  onEditSession,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        // Set to first day of current month to avoid overflow issues
        newMonth.setDate(1);
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-100"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const sessionsForDay = getSessionsForDate(date);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => onSelectDate(date)}
          className={`h-24 border-2 p-1 cursor-pointer transition-colors hover:bg-purple-50 ${
            isSelected
              ? 'bg-purple-100 border-purple-400'
              : sessionsForDay.length > 0
                ? 'border-purple-300 bg-purple-50'
                : 'border-gray-100'
          } ${isToday ? 'ring-2 ring-pink-400' : ''}`}
        >
          <div className="flex flex-col h-full">
            <div
              className={`text-sm font-bold mb-1 flex items-center justify-between ${
                isToday
                  ? 'text-pink-600'
                  : sessionsForDay.length > 0
                    ? 'text-purple-700'
                    : 'text-gray-900'
              }`}
            >
              <span>{day}</span>
              {sessionsForDay.length > 0 && (
                <span className="text-xs bg-purple-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {sessionsForDay.length}
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden space-y-1">
              {sessionsForDay.slice(0, 3).map((session, index) => (
                <div
                  key={session.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSession(session);
                  }}
                  className={`text-xs p-1.5 rounded-md cursor-pointer transition-all hover:scale-105 shadow-sm border ${
                    session.type === 'tutoring'
                      ? 'bg-purple-300 text-purple-900 border-purple-400 hover:bg-purple-400'
                      : session.type === 'quiz'
                        ? 'bg-pink-300 text-pink-900 border-pink-400 hover:bg-pink-400'
                        : session.type === 'reading'
                          ? 'bg-blue-300 text-blue-900 border-blue-400 hover:bg-blue-400'
                          : 'bg-yellow-300 text-yellow-900 border-yellow-400 hover:bg-yellow-400'
                  } ${
                    session.status === 'completed'
                      ? 'opacity-60'
                      : session.status === 'missed'
                        ? 'bg-red-300 text-red-900 border-red-400'
                        : session.status === 'cancelled'
                          ? 'bg-gray-300 text-gray-700 border-gray-400'
                          : ''
                  }`}
                >
                  <div className="font-semibold truncate">{session.title}</div>
                  <div className="text-xs font-medium">
                    {new Date(session.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </div>
                </div>
              ))}
              {sessionsForDay.length > 3 && (
                <div className="text-xs text-gray-500 text-center">
                  +{sessionsForDay.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return days;
  };

  const getTypeIcon = (type: Session['type']) => {
    switch (type) {
      case 'tutoring':
        return '👨‍🏫';
      case 'quiz':
        return '🧠';
      case 'reading':
        return '📖';
      case 'study':
        return '📚';
      default:
        return '📝';
    }
  };

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <p className="text-sm text-purple-100">Click on any day to see your adventures! 🗓️</p>
          </div>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-amber-700 bg-yellow-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {renderCalendarDays()}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-200">
        <h4 className="text-sm font-bold text-purple-900 mb-3">Session Types:</h4>
        <div className="flex flex-wrap gap-4 text-sm text-black">
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 bg-gradient-to-r from-purple-400 to-purple-500 rounded-lg shadow-sm 
            border border-purple-600"
            ></div>
            <span className="font-medium">👨‍🏫 Tutoring</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-500 rounded-lg shadow-sm border border-pink-600"></div>
            <span className="font-medium">🧠 Quiz</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded
             -lg shadow-sm border border-blue-600"
            ></div>
            <span className="font-medium">📖 Reading</span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-sm 
           border border-orange-500"
            ></div>
            <span className="font-medium">📚 Study</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 border-2 border-pink-400 rounded-lg bg-pink-50"></div>
            <span className="font-medium">✨ Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
