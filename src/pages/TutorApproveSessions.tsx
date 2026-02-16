import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { TutorSessionRequestQueue } from '../components/tutor/TutorSessionRequestQueue';
import { tutorSessionService, PendingSessionRequest } from '../services/tutorSessionService';
import { Clock, User, CheckCircle, XCircle, Calendar, AlertCircle, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Pagination } from '../components/ui/Pagination';

export const TutorApproveSessions: React.FC = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState<PendingSessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'recent'>('all');
  const itemsPerPage = 10;

  useEffect(() => {
    loadRequests(currentPage);
    // Refresh every 30 seconds
    const interval = setInterval(() => loadRequests(currentPage), 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const loadRequests = async (page: number = 1) => {
    try {
      setLoading(true);
      const result = await tutorSessionService.getPendingRequests(page, itemsPerPage);
      setRequests(result.requests);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
      showError('Failed to load session requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (processing === requestId || processing !== null) {
      return;
    }

    try {
      setProcessing(requestId);
      // Optimistically remove from UI
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      await tutorSessionService.approveRequest(requestId);
      showSuccess('Session request approved successfully!');
      // Reload to get updated list
      await loadRequests(currentPage);
    } catch (error: any) {
      console.error('Failed to approve request:', error);
      // Reload to restore the item
      await loadRequests(currentPage);
      showError(error.message || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Optional: Enter a reason for rejection');
    if (reason === null) return; // User cancelled

    if (processing === requestId || processing !== null) {
      return;
    }

    try {
      setProcessing(requestId);
      // Optimistically remove from UI
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      await tutorSessionService.rejectRequest(requestId, reason || undefined);
      showSuccess('Session request rejected');
      // Reload to get updated list
      await loadRequests(currentPage);
    } catch (error: any) {
      console.error('Failed to reject request:', error);
      // Reload to restore the item
      await loadRequests(currentPage);
      showError(error.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

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

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diff = sessionDate.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Less than an hour';
  };

  const filteredRequests = requests.filter((request) => {
    if (filter === 'recent') {
      const requestDate = new Date(request.requestedAt);
      const daysAgo = (Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7; // Last 7 days
    }
    return true; // 'all' or 'pending' - show all pending
  });

  if (loading) {
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
          <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span>Approve Sessions</span>
                </h1>
                <p className="text-orange-100 mt-1 text-sm sm:text-base">
                  Review and approve session requests from your students
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/30">
                <div className="text-white/80 text-xs sm:text-sm font-medium">Pending Requests</div>
                <div className="text-white text-xl sm:text-2xl font-bold">
                  {pagination?.total || requests.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'recent'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all ${
                  filter === filterOption
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption === 'all' ? 'All Requests' : 'Recent (7 days)'}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No Pending Requests
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              All session requests have been processed! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border-2 border-orange-200 p-4 sm:p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 sm:gap-0 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                          {request.student.name?.[0] || 'S'}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.student.name} • {request.student.email}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto bg-orange-100 text-orange-700 border border-orange-200">
                        PENDING
                      </span>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 sm:p-4 mb-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="flex items-center space-x-2 text-gray-700 text-sm sm:text-base">
                          <Calendar className="w-4 h-4 flex-shrink-0 text-orange-600" />
                          <span>
                            <span className="font-medium">Scheduled:</span>{' '}
                            {formatDate(request.scheduledAt)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-700 text-sm sm:text-base">
                          <Clock className="w-4 h-4 flex-shrink-0 text-orange-600" />
                          <span>
                            <span className="font-medium">Duration:</span> {request.duration} min
                          </span>
                        </div>
                        <div className="text-gray-700 text-sm sm:text-base">
                          <span className="font-medium">Subject:</span> {request.subject}
                        </div>
                        <div className="text-gray-700 text-sm sm:text-base">
                          <span className="font-medium">Time until:</span>{' '}
                          <span className="text-orange-600 font-semibold">
                            {getTimeUntil(request.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {request.description && (
                      <p className="text-gray-700 mb-3 text-sm sm:text-base bg-gray-50 rounded-lg p-3">
                        <span className="font-medium">Description:</span> {request.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processing === request.id || processing !== null}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{processing === request.id ? 'Approving...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processing === request.id || processing !== null}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{processing === request.id ? 'Processing...' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              pagination={pagination}
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

