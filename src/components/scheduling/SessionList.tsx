import React from 'react';

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
  reminderEnabled?: boolean;
  description?: string;
}

interface SessionListProps {
  sessions: Session[];
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onStatusChange: (sessionId: string, status: Session['status']) => void;
  selectedDate: Date;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onEditSession,
  onDeleteSession,
  onStatusChange,
  selectedDate
}) => {
  const getSessionTypeIcon = (type: Session['type']) => {
    switch (type) {
      case 'tutoring': return '👨‍🏫';
      case 'quiz': return '🧠';
      case 'reading': return '📖';
      case 'study': return '📚';
      default: return '📝';
    }
  };

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-600';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'missed': return '❌';
      case 'cancelled': return '⛔';
      case 'scheduled': return '⏰';
      default: return '📝';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const canMarkCompleted = (session: Session) => {
    const sessionEnd = new Date(session.endTime);
    const now = new Date();
    return sessionEnd <= now && session.status === 'scheduled';
  };

  const canMarkMissed = (session: Session) => {
    const sessionStart = new Date(session.startTime);
    const now = new Date();
    return sessionStart < now && session.status === 'scheduled';
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            No Adventures for {formatDate(selectedDate)}!
          </h3>
          <p className="text-amber-600 text-sm mb-4">
            Why not schedule some fun learning time?
          </p>
          <div className="text-6xl opacity-20 mb-2">🌟</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-purple-900">
          {formatDate(selectedDate)} Adventures 🗓️
        </h3>
        <p className="text-sm text-amber-600">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} planned
        </p>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {sessions
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
          .map((session) => (
            <div
              key={session.id}
              className="group bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getSessionTypeIcon(session.type)}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 text-sm leading-tight">
                      {session.title}
                    </h4>
                    <p className="text-xs text-amber-600">
                      {session.subject} • {session.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {getStatusIcon(session.status)} {session.status}
                  </span>
                </div>
              </div>

              {/* Time and Tutor Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                </div>

                {session.tutor && (
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">{session.tutor.avatar || '👨‍🏫'}</span>
                    with {session.tutor.name}
                  </div>
                )}

                {session.isRecurring && (
                  <div className="flex items-center text-sm text-purple-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Repeating session
                  </div>
                )}

                {session.reminderEnabled && (
                  <div className="flex items-center text-sm text-blue-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Reminder set
                  </div>
                )}
              </div>

              {/* Description */}
              {session.description && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    {session.description}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {session.status === 'scheduled' && (
                  <>
                    {canMarkCompleted(session) && (
                      <button
                        onClick={() => onStatusChange(session.id, 'completed')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors"
                      >
                        ✅ Mark Done
                      </button>
                    )}
                    {canMarkMissed(session) && (
                      <button
                        onClick={() => onStatusChange(session.id, 'missed')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        ❌ Mark Missed
                      </button>
                    )}
                    <button
                      onClick={() => onStatusChange(session.id, 'cancelled')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                    >
                      ⛔ Cancel
                    </button>
                  </>
                )}

                <button
                  onClick={() => onEditSession(session)}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Total time: {
            sessions.reduce((total, session) => {
              const start = new Date(session.startTime);
              const end = new Date(session.endTime);
              const duration = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
              return total + duration;
            }, 0)
          } minutes</span>
          <span>
            {sessions.filter(s => s.status === 'completed').length} completed •
            {sessions.filter(s => s.status === 'scheduled').length} upcoming
          </span>
        </div>
      </div>
    </div>
  );
};