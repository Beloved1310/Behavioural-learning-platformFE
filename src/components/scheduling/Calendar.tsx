import React, { useState } from 'react';

interface Session {
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
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  isRecurring?: boolean;
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
  onEditSession
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return (
        sessionDate.getDate() === date.getDate() &&
        sessionDate.getMonth() === date.getMonth() &&
        sessionDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
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
          className={`h-24 border border-gray-100 p-1 cursor-pointer transition-colors hover:bg-purple-50 ${
            isSelected ? 'bg-purple-100 border-purple-300' : ''
          } ${isToday ? 'ring-2 ring-pink-300' : ''}`}
        >
          <div className="flex flex-col h-full">
            <div className={`text-sm font-medium ${
              isToday ? 'text-pink-600 font-bold' : 'text-gray-900'
            }`}>
              {day}
            </div>
            <div className="flex-1 overflow-hidden">
              {sessionsForDay.slice(0, 3).map((session, index) => (
                <div
                  key={session.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSession(session);
                  }}
                  className={`text-xs p-1 rounded mb-1 cursor-pointer hover:opacity-80 ${
                    session.type === 'tutoring'
                      ? 'bg-purple-200 text-purple-800'
                      : session.type === 'quiz'
                      ? 'bg-pink-200 text-pink-800'
                      : session.type === 'reading'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-yellow-200 text-yellow-800'
                  } ${
                    session.status === 'completed' ? 'opacity-60' :
                    session.status === 'missed' ? 'bg-red-200 text-red-800' :
                    session.status === 'cancelled' ? 'bg-gray-200 text-gray-600' : ''
                  }`}
                >
                  <div className="truncate">
                    {session.title}
                  </div>
                  <div className="text-xs opacity-75">
                    {new Date(session.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
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
      case 'tutoring': return '👨‍🏫';
      case 'quiz': return '🧠';
      case 'reading': return '📖';
      case 'study': return '📚';
      default: return '📝';
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            <p className="text-sm text-purple-100">
              Click on any day to see your adventures! 🗓️
            </p>
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
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-purple-900 mb-2">Legend:</h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-200 rounded"></div>
            <span>👨‍🏫 Tutoring</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-pink-200 rounded"></div>
            <span>🧠 Quiz</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span>📖 Reading</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span>📚 Study</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 border-2 border-pink-300 rounded"></div>
            <span>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};