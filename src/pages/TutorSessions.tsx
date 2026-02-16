import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { useSessionStore } from '../store/sessionStore';
import { Session } from '../types';
import { Calendar, Clock, User, MessageSquare, Eye } from 'lucide-react';
import { TutorCalendarAvailability } from '../components/tutor/TutorCalendarAvailability';
import { TutorSessionRequestQueue } from '../components/tutor/TutorSessionRequestQueue';
import { TutorCreateSession } from '../components/tutor/TutorCreateSession';
import { Pagination } from '../components/ui/Pagination';

export const TutorSessions: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loadSessions, isLoading, sessionsPagination } = useSessionStore();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending' | 'completed'>('all');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSessions({ page: currentPage, limit: itemsPerPage });
  }, [loadSessions, currentPage]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const now = new Date();
      let filtered = sessions;

      switch (filter) {
        case 'upcoming':
          filtered = sessions.filter((session) => {
            const sessionDate = new Date(session.startTime);
            return sessionDate > now && session.status === 'scheduled';
          });
          break;
        case 'pending':
          filtered = sessions.filter((session) => session.status === 'pending');
          break;
        case 'completed':
          filtered = sessions.filter((session) => session.status === 'completed');
          break;
        default:
          filtered = sessions;
      }

      // Sort by date
      filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions([]);
    }
  }, [sessions, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <TutorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Sessions</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                View and manage all your tutoring sessions
              </p>
            </div>
            <div className="flex-shrink-0">
              <TutorCreateSession
                onSessionCreated={() => loadSessions({ page: currentPage, limit: itemsPerPage })}
              />
            </div>
          </div>
        </div>

        {/* Session Request Queue - Priority */}
        <div className="mb-6">
          <TutorSessionRequestQueue />
        </div>

        {/* Calendar Availability */}
        <div className="mb-6">
          <TutorCalendarAvailability />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'upcoming', 'pending', 'completed'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No Sessions Found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {filter === 'all'
                ? "You don't have any sessions yet."
                : `No ${filter} sessions found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 sm:gap-0 mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                        {session.title}
                      </h3>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                          session.status === 'scheduled' || session.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-700'
                            : session.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : session.status === 'cancelled' || session.status === 'missed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {session.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                        <User className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{session.tutor?.name || 'Student'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{formatDate(session.startTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{session.duration} minutes</span>
                      </div>
                      <div className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Subject:</span>{' '}
                        <span className="truncate">{session.subject}</span>
                      </div>
                    </div>

                    {session.description && (
                      <p className="text-gray-700 mb-4 text-sm sm:text-base line-clamp-2">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/tutor/sessions/${session.id}`)}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => navigate(`/tutor/chat?student=${session.userId}`)}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border-2 border-blue-200 text-blue-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm sm:text-base"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {sessionsPagination && sessionsPagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              pagination={sessionsPagination}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </TutorLayout>
  );
};
