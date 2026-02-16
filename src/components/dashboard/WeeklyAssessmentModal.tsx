import React, { useState, useEffect } from 'react';
import { assessmentsService } from '../../services/assessmentsService';
import { useAuthStore } from '../../store/authStore';
import { X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const WeeklyAssessmentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { user } = useAuthStore();
  const { showError, showWarning } = useToast();
  const [weekRating, setWeekRating] = useState<number>(0);
  const [whatWentWell, setWhatWentWell] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextWeekFocus, setNextWeekFocus] = useState('');
  const [commitmentLevel, setCommitmentLevel] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkCompletion();
    }
  }, [user?.id]);

  const checkCompletion = async () => {
    try {
      const assessment = await assessmentsService.getCurrentAssessment();
      if (assessment) {
        setHasCompleted(true);
        // Pre-fill with existing data
        setWeekRating(assessment.weekRating);
        setWhatWentWell(assessment.whatWentWell);
        setChallenges(assessment.challenges);
        setNextWeekFocus(assessment.nextWeekFocus);
        setCommitmentLevel(assessment.commitmentLevel);
      }
    } catch (error) {
      logger.error('Failed to check assessment', error);
      // Don't show error toast - assessment check failure is not critical
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weekRating || !whatWentWell || !challenges || !nextWeekFocus || !commitmentLevel) {
      showWarning('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await assessmentsService.submitAssessment({
        weekRating,
        whatWentWell,
        challenges,
        nextWeekFocus,
        commitmentLevel,
      });
      onSuccess();
    } catch (error: unknown) {
      logger.error('Failed to submit assessment', error);
      showError(getErrorMessage(error, 'Failed to submit assessment. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  if (hasCompleted) {
    return (
      <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">✅</span>
            <h2 className="text-2xl font-bold text-gray-900">Assessment Complete</h2>
            <p className="text-sm text-gray-600 mt-2">
              You've already completed this week's assessment. Check back next week!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <span className="text-4xl mb-2 block">📊</span>
            <h2 className="text-2xl font-bold text-gray-900">Weekly Check-In</h2>
            <p className="text-sm text-gray-600 mt-2">
              Let's reflect on your week and set intentions for next week
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              How would you rate this week? (1-5)
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setWeekRating(rating)}
                  className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                    weekRating === rating
                      ? 'bg-blue-500 text-white scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What went well this week? ✨
            </label>
            <textarea
              value={whatWentWell}
              onChange={(e) => setWhatWentWell(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="What efforts paid off? What did you learn?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What challenged you? What did you learn from it? 💪
            </label>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="What was difficult? How did you grow from facing it?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              What do you want to focus on next week? 🎯
            </label>
            <textarea
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="What skills do you want to develop? What will you work toward?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              How committed are you to your goals? (1-5)
            </label>
            <div className="flex items-center justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setCommitmentLevel(level)}
                  className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                    commitmentLevel === level
                      ? 'bg-green-500 text-white scale-110'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading || !weekRating || !commitmentLevel}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
