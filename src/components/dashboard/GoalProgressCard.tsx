import React, { useState, useEffect } from 'react';
import { goalsService, Goal } from '../../services/goalsService';
import { useAuthStore } from '../../store/authStore';
import { Plus, Target, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from '../ui/Calendar';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const GoalProgressCard: React.FC = () => {
  const { user } = useAuthStore();
  const { showError } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadGoals();
    }
  }, [user?.id]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await goalsService.getGoals();
      setGoals(data);
    } catch (error) {
      logger.error('Failed to load goals', error);
      showError('Failed to load goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      await goalsService.deleteGoal(goalId);
      await loadGoals(); // Reload goals after deletion
    } catch (error) {
      logger.error('Failed to delete goal', error);
      showError(getErrorMessage(error, 'Failed to delete goal. Please try again.'));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-900 flex items-center space-x-2">
          <Target className="w-5 h-5" />
          <span>My Goals</span>
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-2 block">🎯</span>
          <p className="text-gray-600 mb-4">No goals set yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 text-sm font-medium"
          >
            Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));

            return (
              <div
                key={goal.id}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 relative group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 flex-1 flex-wrap gap-2">
                    <span className="text-lg">🎯</span>
                    <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                    {/* Status Badges */}
                    {goal.assignedBy && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        👨‍🏫 Tutor Assigned
                      </span>
                    )}
                    {goal.status === 'pending_approval' && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                        ⏳ Pending Approval
                      </span>
                    )}
                    {goal.status === 'rejected' && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        ❌ Rejected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {goal.deadline && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center space-x-1">
                        <CalendarIcon className="w-3 h-3" />
                        <span>Due {formatDate(goal.deadline)}</span>
                      </span>
                    )}
                    {/* Only allow deletion if not tutor-assigned */}
                    {!goal.assignedBy && (
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete goal"
                        aria-label="Delete goal"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Show tutor feedback if rejected */}
                {goal.status === 'rejected' && goal.tutorFeedback && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-900 mb-1">Tutor Feedback:</p>
                    <p className="text-sm text-red-700">{goal.tutorFeedback}</p>
                  </div>
                )}

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      {goal.current}/{goal.target}
                    </span>
                    <span className="text-sm font-bold text-purple-600">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                    <span className="text-xs text-gray-500">Milestones:</span>
                    {goal.milestones.map((milestone, idx) => {
                      const isAchieved = goal.achievedMilestones?.includes(milestone) || false;
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${
                            isAchieved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {milestone}% {isAchieved ? '✓' : ''}
                        </span>
                      );
                    })}
                  </div>
                )}

                {goal.assignedBy && (
                  <div className="mt-2 flex items-center space-x-1">
                    <span className="text-xs text-blue-600">👨‍🏫 Assigned by tutor</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <GoalAddModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadGoals();
          }}
        />
      )}
    </div>
  );
};

const GoalAddModal: React.FC<{ onClose: () => void; onSuccess: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const { showError } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target) return;

    try {
      setLoading(true);
      await goalsService.createGoal({
        title,
        description: description || undefined,
        target: parseInt(target),
        deadline: deadline || undefined,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create goal:', error);
      showError('Failed to create goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-auto my-auto max-h-[95vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
          Create New Goal
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1 sm:mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="e.g., Complete 50 quizzes"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1 sm:mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1 sm:mb-2">Target *</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              placeholder="e.g., 50"
              min="1"
              required
            />
          </div>
          <div>
            <Calendar
              label="Deadline (Optional)"
              value={deadline}
              onChange={(date) => setDeadline(date)}
              helperText="Click to pick a deadline for your goal! 📅"
              minDate={new Date().toISOString().split('T')[0]}
              placeholder="Select deadline for your goal"
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 sm:py-3 px-4 rounded-lg hover:bg-gray-50 font-medium text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
