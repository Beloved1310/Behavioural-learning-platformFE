import React, { useState, useEffect } from 'react';
import { tutorSessionService, PendingSessionRequest } from '../../services/tutorSessionService';
import { Clock, User, CheckCircle, XCircle, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const TutorSessionRequestQueue: React.FC = () => {
  const { showError } = useToast();
  const [requests, setRequests] = useState<PendingSessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    loadRequests(currentPage);
    // Refresh every 30 seconds
    const interval = setInterval(() => loadRequests(currentPage), 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const loadRequests = async (page: number = 1) => {
    console.log('[TutorSessionRequestQueue] loadRequests called for page:', page);
    try {
      setLoading(true);
      console.log('[TutorSessionRequestQueue] Fetching pending requests...');
      const result = await tutorSessionService.getPendingRequests(page, itemsPerPage);
      console.log('[TutorSessionRequestQueue] Received requests:', result.requests.length);
      console.log(
        '[TutorSessionRequestQueue] Request IDs:',
        result.requests.map((r) => r.id)
      );
      setRequests(result.requests);
      setPagination(result.pagination);
    } catch (error) {
      console.error('[TutorSessionRequestQueue] Failed to load pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    console.log('[TutorSessionRequestQueue] handleApprove called for:', requestId);
    console.log('[TutorSessionRequestQueue] Current processing state:', processing);

    // Prevent double-click
    if (processing === requestId || processing !== null) {
      console.log('[TutorSessionRequestQueue] Already processing, ignoring request');
      return;
    }

    try {
      console.log('[TutorSessionRequestQueue] Setting processing state to:', requestId);
      setProcessing(requestId);

      // Optimistically remove from UI immediately
      console.log('[TutorSessionRequestQueue] Removing request from UI:', requestId);
      setRequests((prevRequests) => {
        const filtered = prevRequests.filter((req) => req.id !== requestId);
        console.log('[TutorSessionRequestQueue] Requests after removal:', filtered.length);
        return filtered;
      });

      console.log('[TutorSessionRequestQueue] Calling approveRequest API for:', requestId);
      await tutorSessionService.approveRequest(requestId);
      console.log('[TutorSessionRequestQueue] Approve request successful for:', requestId);

      // Don't reload immediately - the optimistic update is sufficient
      // Only reload if we need to sync with server state
    } catch (error: any) {
      console.error('[TutorSessionRequestQueue] Failed to approve request:', error);
      // If error, reload to restore the item
      console.log('[TutorSessionRequestQueue] Reloading requests due to error');
      await loadRequests(currentPage);
      showError(error.message || 'Failed to approve request');
    } finally {
      console.log('[TutorSessionRequestQueue] Clearing processing state');
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt('Optional: Enter a reason for rejection');
    if (reason === null) return; // User cancelled

    try {
      setProcessing(requestId);
      // Optimistically remove from UI immediately
      setRequests((prevRequests) => prevRequests.filter((req) => req.id !== requestId));
      await tutorSessionService.rejectRequest(requestId, reason || undefined);
      // Optionally refresh to ensure consistency, but item is already removed
      await loadRequests(currentPage);
    } catch (error: any) {
      console.error('Failed to reject request:', error);
      // If error, reload to restore the item
      await loadRequests(currentPage);
      showError(error.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-orange-900 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5" />
          <span>Session Requests</span>
        </h3>
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
          {pagination?.total || requests.length} pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
          <p className="text-gray-600">No pending session requests! 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="p-4 bg-orange-50 rounded-xl border border-orange-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">{request.student.name}</span>
                    <span className="text-xs text-gray-500">({request.student.email})</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{request.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Subject:</span> {request.subject}
                  </p>
                  {request.description && (
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(request.scheduledAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{request.duration} min</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      In {getTimeUntil(request.scheduledAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      '[TutorSessionRequestQueue] Approve button clicked for:',
                      request.id
                    );
                    console.log('[TutorSessionRequestQueue] Current processing:', processing);
                    if (processing === request.id || processing !== null) {
                      console.log('[TutorSessionRequestQueue] Button disabled, ignoring click');
                      return;
                    }
                    handleApprove(request.id);
                  }}
                  disabled={processing === request.id || processing !== null}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-opacity"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{processing === request.id ? 'Approving...' : 'Approve'}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (processing === request.id || processing !== null) {
                      return;
                    }
                    handleReject(request.id);
                  }}
                  disabled={processing === request.id || processing !== null}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-opacity"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{processing === request.id ? 'Processing...' : 'Reject'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-4">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, pagination.total || requests.length)} of{' '}
            {pagination.total || requests.length} requests
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                currentPage === pagination.totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
