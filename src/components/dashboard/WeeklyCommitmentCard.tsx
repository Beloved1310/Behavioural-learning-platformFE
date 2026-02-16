import React, { useState, useEffect } from 'react';
import { commitmentsService, WeeklyCommitment } from '../../services/commitmentsService';
import { useAuthStore } from '../../store/authStore';
import { CheckCircle2, Circle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const WeeklyCommitmentCard: React.FC = () => {
  const { user } = useAuthStore();
  const { showError, showWarning } = useToast();
  const navigate = useNavigate();
  const [commitment, setCommitment] = useState<WeeklyCommitment | null>(null);
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCommitments();
    }
  }, [user?.id]);

  const loadCommitments = async () => {
    try {
      setLoading(true);
      const data = await commitmentsService.getCurrentCommitments();
      setCommitment(data.commitment);
      setCompletionRate(data.completionRate);
    } catch (error) {
      logger.error('Failed to load commitments', error);
      showError('Failed to load commitments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCommitment = async (commitmentId: string, itemIndex: number) => {
    try {
      const result = await commitmentsService.toggleCommitment(commitmentId, itemIndex);
      setCommitment(result.commitment);
      setCompletionRate(result.completionRate);
    } catch (error) {
      logger.error('Failed to toggle commitment', error);
      showError('Failed to update commitment. Please try again.');
    }
  };

  const formatWeekStart = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getCurrentDate = () => {
    const now = new Date();
    return {
      month: now.toLocaleDateString('en-US', { month: 'long' }),
      day: now.getDate(),
      year: now.getFullYear(),
    };
  };

  const getCompletionColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-100 text-green-700';
    if (rate >= 50) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const currentDate = getCurrentDate();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex flex-col items-center justify-center text-white shadow-sm">
            <span className="text-xs font-bold leading-tight">
              {currentDate.month.substring(0, 3).toUpperCase()}
            </span>
            <span className="text-lg font-bold leading-tight">{currentDate.day}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-900">This Week's Commitments</h3>
            {commitment && (
              <p className="text-xs text-gray-500 mt-1">
                Week of {formatWeekStart(commitment.weekStart)}
              </p>
            )}
          </div>
        </div>
        {commitment && (
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${getCompletionColor(completionRate)}`}
          >
            {completionRate}% Complete
          </span>
        )}
      </div>

      {!commitment ? (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex flex-col items-center justify-center text-white shadow-md">
              <span className="text-sm font-bold leading-tight">
                {currentDate.month.substring(0, 3).toUpperCase()}
              </span>
              <span className="text-2xl font-bold leading-tight">{currentDate.day}</span>
            </div>
          </div>
          <p className="text-gray-600 mb-4">No commitments set for this week</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
          >
            Set Commitments
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {commitment.commitments.map((item, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border-2 transition-all ${
                  item.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleCommitment(commitment.id, index)}
                    className="mt-1 flex-shrink-0"
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}
                    >
                      {item.text}
                    </p>
                    {item.target && (
                      <p className="text-xs text-gray-500 mt-1">
                        Target: {item.target} {item.type === 'time' ? 'minutes' : item.type}
                      </p>
                    )}
                  </div>
                  {item.completed && <span className="text-green-500 text-xl">✓</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mb-4">
            <div className="relative w-24 h-24">
              <svg className="transform -rotate-90 w-24 h-24">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                  className="text-blue-500 transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 text-sm font-medium"
            >
              Update Commitments
            </button>
            <button
              onClick={() => navigate('/commitments/history')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              History
            </button>
          </div>

          {commitment.assignedBy && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                👨‍🏫 Assigned by Tutor
              </span>
            </div>
          )}
        </>
      )}

      {showModal && (
        <CommitmentModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadCommitments();
          }}
          existingCommitment={commitment}
        />
      )}
    </div>
  );
};

const CommitmentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  existingCommitment?: WeeklyCommitment | null;
}> = ({ onClose, onSuccess, existingCommitment }) => {
  const [commitments, setCommitments] = useState<
    Array<{
      text: string;
      type: 'time' | 'quizzes' | 'sessions';
      target: number;
    }>
  >(
    existingCommitment?.commitments.map((c) => ({
      text: c.text,
      type: c.type,
      target: c.target,
    })) || [
      { text: '', type: 'time', target: 30 },
      { text: '', type: 'quizzes', target: 3 },
    ]
  );
  const [loading, setLoading] = useState(false);

  const addCommitment = () => {
    if (commitments.length < 5) {
      setCommitments([...commitments, { text: '', type: 'time', target: 0 }]);
    }
  };

  const removeCommitment = (index: number) => {
    setCommitments(commitments.filter((_, i) => i !== index));
  };

  const updateCommitment = (index: number, field: string, value: any) => {
    const updated = [...commitments];
    (updated[index] as any)[field] = value;
    setCommitments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (commitments.some((c) => !c.text || c.target <= 0)) {
      showWarning('Please fill in all commitment fields');
      return;
    }

    try {
      setLoading(true);
      await commitmentsService.createCommitments({ commitments });
      onSuccess();
    } catch (error: unknown) {
      logger.error('Failed to create commitments', error);
      showError(getErrorMessage(error, 'Failed to create commitments. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {existingCommitment ? 'Update Commitments' : 'Set Weekly Commitments'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {commitments.map((commitment, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Commitment {index + 1}</span>
                {commitments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCommitment(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                value={commitment.text}
                onChange={(e) => updateCommitment(index, 'text', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Study 30 minutes daily"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={commitment.type}
                  onChange={(e) => updateCommitment(index, 'type', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="time">Time (minutes)</option>
                  <option value="quizzes">Quizzes</option>
                  <option value="sessions">Sessions</option>
                </select>
                <input
                  type="number"
                  value={commitment.target}
                  onChange={(e) => updateCommitment(index, 'target', parseInt(e.target.value) || 0)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Target"
                  min="1"
                  required
                />
              </div>
            </div>
          ))}

          {commitments.length < 5 && (
            <button
              type="button"
              onClick={addCommitment}
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 py-2 rounded-lg hover:border-blue-500 hover:text-blue-500"
            >
              + Add Another Commitment
            </button>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : existingCommitment ? 'Update' : 'Set Commitments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
