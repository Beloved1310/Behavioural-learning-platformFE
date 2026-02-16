import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { useSessionStore } from '../store/sessionStore';
import { Session } from '../types';
import { Calendar, Clock, User, CheckCircle, XCircle, History, Filter } from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';

export const TutorHistory: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loadSessions, isLoading, sessionsPagination } = useSessionStore();
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled' | 'missed'>('all');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadSessions({ page: currentPage, limit: itemsPerPage, status: 'all' });
  }, [loadSessions, currentPage]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      let filtered = sessions;

      switch (filter) {
        case 'completed':
          filtered = sessions.filter((session) => session.status === 'completed');
          break;
        case 'cancelled':
          filtered = sessions.filter((session) => session.status === 'cancelled');
          break;
        case 'missed':
          filtered = sessions.filter((session) => session.status === 'missed');
          break;
        default:
          // Show all past sessions (completed, cancelled, missed)
          filtered = sessions.filter(
            (session) =>
              session.status === 'completed' ||
              session.status === 'cancelled' ||
              session.status === 'missed'
          );
      }

      // Sort by date (most recent first)
      filtered.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions([]);
    }
  }, [sessions, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'missed':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'missed':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <History className="w-6 h-6 sm:w-8 sm:h-8" />
                <span>Session History</span>
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                View all your past tutoring sessions
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'completed', 'cancelled', 'missed'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white shadow-md'
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
            <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No History Found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              {filter === 'all'
                ? "You don't have any past sessions yet."
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
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(session.status)}
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                          {session.title}
                        </h3>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto border ${getStatusColor(
                          session.status
                        )}`}
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
                      <History className="w-4 h-4" />
                      <span>View Details</span>
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

