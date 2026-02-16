import React, { useState, useEffect } from 'react';
import { adminService, PendingTutor } from '../../services/adminService';
import { CheckCircle, XCircle, Clock, User, Mail, BookOpen, Award, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';

interface TutorApprovalQueueProps {
  onRefresh?: () => void;
}

export const TutorApprovalQueue: React.FC<TutorApprovalQueueProps> = ({ onRefresh }) => {
  const { showError, showWarning } = useToast();
  const [tutors, setTutors] = useState<PendingTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutor, setSelectedTutor] = useState<PendingTutor | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPendingTutors();
  }, [page]);

  const loadPendingTutors = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getPendingTutors(page, 20);
      setTutors(result.tutors);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending tutors');
      logger.error('Failed to load pending tutors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tutorId: string) => {
    try {
      setActionLoading(tutorId);
      await adminService.approveTutor(tutorId);
      await loadPendingTutors();
      if (onRefresh) onRefresh();
      setSelectedTutor(null);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (tutorId: string) => {
    if (!rejectReason.trim()) {
      showWarning('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(tutorId);
      await adminService.rejectTutor(tutorId, rejectReason);
      await loadPendingTutors();
      if (onRefresh) onRefresh();
      setSelectedTutor(null);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject tutor');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBackgroundCheck = async (tutorId: string, isBackgroundChecked: boolean) => {
    try {
      setActionLoading(tutorId);
      await adminService.setBackgroundCheckStatus(tutorId, isBackgroundChecked);
      await loadPendingTutors();
      if (onRefresh) onRefresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update background check status');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending tutors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Tutor Approvals</h2>
            <p className="text-gray-600 mt-1">
              {tutors.length} tutor{tutors.length !== 1 ? 's' : ''} awaiting approval
            </p>
          </div>
          <button
            onClick={loadPendingTutors}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Tutors List */}
      {tutors.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
          <p className="text-gray-600">No pending tutor approvals at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    {tutor.profileImage ? (
                      <img
                        src={tutor.profileImage}
                        alt={`${tutor.firstName} ${tutor.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {tutor.firstName} {tutor.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{tutor.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-2 mb-4">
                    {!tutor.isVerified && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        Email Not Verified
                      </span>
                    )}
                    {!tutor.isBackgroundChecked && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Background Check Pending
                      </span>
                    )}
                  </div>

                  {/* Tutor Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Subjects
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tutor.subjects.map((subject, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tutor.qualifications && tutor.qualifications.length > 0 && (
                      <div>
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Award className="h-4 w-4 mr-1" />
                          Qualifications
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tutor.qualifications.map((qual, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                            >
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tutor.bio && (
                      <div className="md:col-span-2">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <FileText className="h-4 w-4 mr-1" />
                          Bio
                        </div>
                        <p className="text-sm text-gray-700">{tutor.bio}</p>
                      </div>
                    )}

                    {tutor.hourlyRate && (
                      <div>
                        <div className="text-sm text-gray-600">Hourly Rate</div>
                        <div className="text-lg font-semibold text-gray-900">
                          ${tutor.hourlyRate}/hr
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleApprove(tutor.id)}
                      disabled={actionLoading === tutor.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading === tutor.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>

                    <Button
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setShowRejectModal(true);
                      }}
                      disabled={actionLoading === tutor.id}
                      variant="danger"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>

                    <Button
                      onClick={() => handleBackgroundCheck(tutor.id, !tutor.isBackgroundChecked)}
                      disabled={actionLoading === tutor.id}
                      variant="secondary"
                    >
                      {tutor.isBackgroundChecked ? 'Uncheck' : 'Mark'} Background Check
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Tutor Application</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting {selectedTutor.firstName}{' '}
              {selectedTutor.lastName}'s application.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4"
              rows={4}
            />
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedTutor(null);
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReject(selectedTutor.id)}
                disabled={!rejectReason.trim() || actionLoading === selectedTutor.id}
                variant="danger"
                className="flex-1"
              >
                Reject Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
