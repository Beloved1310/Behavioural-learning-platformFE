import React, { useState, useEffect } from 'react';
import { tutorGoalsService, PendingGoal } from '../../services/tutorGoalsService';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const TutorPendingGoalsQueue: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [pendingGoals, setPendingGoals] = useState<PendingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<PendingGoal | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  useEffect(() => {
    loadPendingGoals();
  }, []);

  const loadPendingGoals = async () => {
    try {
      setLoading(true);
      const goals = await tutorGoalsService.getPendingGoals();
      setPendingGoals(goals);
    } catch (error) {
      logger.error('Failed to load pending goals', error);
      showError('Failed to load pending goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (goalId: string) => {
    try {
      await tutorGoalsService.approveGoal(goalId);
      await loadPendingGoals();
      // Show success notification
      showSuccess('Goal approved successfully!');
    } catch (error) {
      logger.error('Failed to approve goal', error);
      showError(getErrorMessage(error, 'Failed to approve goal. Please try again.'));
    }
  };

  const handleReject = async () => {
    if (!selectedGoal) return;

    if (!rejectFeedback.trim()) {
      showWarning('Please provide feedback for rejection.');
      return;
    }

    try {
      await tutorGoalsService.rejectGoal(selectedGoal.id, rejectFeedback);
      await loadPendingGoals();
      setShowRejectModal(false);
      setSelectedGoal(null);
      setRejectFeedback('');
      showSuccess('Goal rejected with feedback.');
    } catch (error) {
      logger.error('Failed to reject goal', error);
      showError(getErrorMessage(error, 'Failed to reject goal. Please try again.'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white to-yellow-50/30 rounded-2xl p-6 sm:p-8 shadow-lg border border-yellow-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pending Goals Approval</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-yellow-600">{pendingGoals.length}</span> goals
                awaiting your review
              </p>
            </div>
          </div>
        </div>

        {pendingGoals.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">No pending goals to review</p>
            <p className="text-sm text-gray-400 mt-2">All student goals have been reviewed ✨</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingGoals.map((goal) => (
              <div
                key={goal.id}
                className="group bg-white border-2 border-yellow-200 rounded-xl p-5 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {goal.studentName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        {formatDate(goal.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="bg-blue-50 px-3 py-1 rounded-lg">
                        <span className="text-sm font-medium text-blue-700">
                          Target: {goal.target}
                        </span>
                      </div>
                      {goal.deadline && (
                        <div className="bg-purple-50 px-3 py-1 rounded-lg">
                          <span className="text-sm font-medium text-purple-700">
                            Due: {formatDate(goal.deadline)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApprove(goal.id)}
                      className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                      title="Approve"
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGoal(goal);
                        setShowRejectModal(true);
                      }}
                      className="p-3 bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:scale-110"
                      title="Reject"
                    >
                      <XCircle className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full border-2 border-red-100">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Reject Goal</h3>
              <p className="text-sm text-gray-600">
                Provide feedback for <strong className="text-gray-900">{selectedGoal.title}</strong>{' '}
                by {selectedGoal.studentName}
              </p>
            </div>
            <textarea
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="Explain why this goal needs adjustment and how the student can improve it..."
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-6 resize-none"
              rows={5}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedGoal(null);
                  setRejectFeedback('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl hover:from-red-700 hover:to-rose-700 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Reject Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
