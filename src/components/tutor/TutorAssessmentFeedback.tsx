import React, { useState, useEffect } from 'react';
import { tutorAssessmentsService } from '../../services/tutorAssessmentsService';
import { useAuthStore } from '../../store/authStore';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

interface Assessment {
  id: string;
  userId: string;
  weekStart: string;
  weekRating: number;
  whatWentWell: string;
  challenges: string;
  nextWeekFocus: string;
  commitmentLevel: number;
  tutorFeedback?: {
    tutorId: string;
    comment: string;
    encouragementLevel: 'low' | 'medium' | 'high';
    feedbackAt: string;
    isRead: boolean;
  };
  completedAt: string;
}

export const TutorAssessmentFeedback: React.FC = () => {
  const { user } = useAuthStore();
  const { showError, showWarning } = useToast();
  const [pendingAssessments, setPendingAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [feedback, setFeedback] = useState('');
  const [encouragementLevel, setEncouragementLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPendingAssessments();
    }
  }, [user?.id]);

  const loadPendingAssessments = async () => {
    try {
      setLoading(true);
      const data = await tutorAssessmentsService.getPendingFeedback();
      setPendingAssessments(data.assessments || []);
    } catch (error) {
      logger.error('Failed to load pending assessments', error);
      showError('Failed to load pending assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async (assessmentId: string) => {
    if (!feedback.trim()) {
      showWarning('Please enter feedback');
      return;
    }

    try {
      setSubmitting(true);
      await tutorAssessmentsService.addFeedback(assessmentId, {
        comment: feedback.trim(),
        encouragementLevel,
      });

      // Reload assessments
      await loadPendingAssessments();
      setSelectedAssessment(null);
      setFeedback('');
      setEncouragementLevel('medium');
    } catch (error) {
      logger.error('Failed to add feedback', error);
      showError(getErrorMessage(error, 'Failed to add feedback. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEncouragementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span>Assessment Feedback</span>
        </h2>
        {pendingAssessments.length > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {pendingAssessments.length}
          </span>
        )}
      </div>

      {pendingAssessments.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">No assessments pending feedback</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingAssessments.slice(0, 5).map((assessment) => (
            <div
              key={assessment.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-pink-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">
                    Week of {formatDate(assessment.weekStart)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-600">Rating: {assessment.weekRating}/5</span>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">
                      Commitment: {assessment.commitmentLevel}/5
                    </span>
                  </div>
                </div>
                {assessment.tutorFeedback && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${getEncouragementColor(assessment.tutorFeedback.encouragementLevel)}`}
                  >
                    Feedback Given
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">What Went Well:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{assessment.whatWentWell}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Challenges:</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{assessment.challenges}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Next Week Focus:</p>
                  <p className="text-sm text-gray-600">{assessment.nextWeekFocus}</p>
                </div>
              </div>

              {selectedAssessment?.id === assessment.id ? (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Encouragement Level
                    </label>
                    <div className="flex space-x-2">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setEncouragementLevel(level)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            encouragementLevel === level
                              ? getEncouragementColor(level) + ' border-2 border-current'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Add your feedback and encouragement..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddFeedback(assessment.id)}
                      disabled={submitting || !feedback.trim()}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAssessment(null);
                        setFeedback('');
                        setEncouragementLevel('medium');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : assessment.tutorFeedback ? (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Your Feedback:</p>
                  <p className="text-sm text-blue-800">{assessment.tutorFeedback.comment}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    {formatDate(assessment.tutorFeedback.feedbackAt)}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedAssessment(assessment)}
                  className="w-full mt-3 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-700 transition-all"
                >
                  Add Feedback
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
