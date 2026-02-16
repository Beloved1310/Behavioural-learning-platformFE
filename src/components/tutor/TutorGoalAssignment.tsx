import React, { useState, useEffect } from 'react';
import { tutorGoalsService, AssignedGoal } from '../../services/tutorGoalsService';
import { tutorStudentsService, StudentProgress } from '../../services/tutorStudentsService';
import { Target, Plus, Calendar } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const TutorGoalAssignment: React.FC = () => {
  const [assignedGoals, setAssignedGoals] = useState<AssignedGoal[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load goals and students separately to handle errors gracefully
      const goalsPromise = tutorGoalsService.getAssignedGoals().catch((error) => {
        logger.error('Failed to load goals', error);
        return [];
      });

      const studentsPromise = tutorStudentsService
        .getAllStudentsProgress()
        .then((result) => result.students || [])
        .catch((error) => {
          logger.error('Failed to load students', error);
          return [];
        });

      const [goals, studentsData] = await Promise.all([goalsPromise, studentsPromise]);
      setAssignedGoals(goals);
      setStudents(studentsData);
    } catch (error) {
      logger.error('Failed to load data', error);
      // Set empty arrays to prevent UI crashes
      setAssignedGoals([]);
      setStudents([]);
    } finally {
      setLoading(false);
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
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 sm:p-8 shadow-lg border border-purple-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Assigned Goals</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold text-purple-600">{assignedGoals.length}</span> goals
              assigned
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
        >
          <Plus className="w-5 h-5" />
          <span>Assign Goal</span>
        </button>
      </div>

      {assignedGoals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-gray-600 font-medium text-lg mb-4">No goals assigned yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Assign Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignedGoals.map((goal) => (
            <div
              key={goal.id}
              className="group bg-white border-2 border-purple-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900 mb-1">{goal.studentName}</h4>
                  <p className="text-sm text-gray-600 font-medium">{goal.title}</p>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl font-bold text-sm ${
                    goal.progressPercent >= 80
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                      : goal.progressPercent >= 50
                        ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                  }`}
                >
                  {goal.progressPercent}%
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all ${
                    goal.progressPercent >= 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : goal.progressPercent >= 50
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: `${Math.min(100, goal.progressPercent)}%` }}
                />
              </div>

              {goal.deadline && (
                <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg w-fit">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">Due {formatDate(goal.deadline)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <GoalAssignmentModal
          students={students}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const GoalAssignmentModal: React.FC<{
  students: StudentProgress[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ students, onClose, onSuccess }) => {
  const { showError, showWarning } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !title || !target) {
      showWarning('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await tutorGoalsService.assignGoal(selectedStudentId, {
        title,
        description: description || undefined,
        target: parseInt(target),
        deadline: deadline || undefined,
      });
      onSuccess();
    } catch (error: unknown) {
      logger.error('Failed to assign goal', error);
      showError(getErrorMessage(error, 'Failed to assign goal. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full border-2 border-purple-100 shadow-2xl">
        <div className="mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assign Goal to Student</h2>
          <p className="text-sm text-gray-600">Set a new goal for your student</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Student *
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              required
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Goal Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              placeholder="e.g., Complete 50 quizzes"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium resize-none"
              rows={3}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Target *</label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
              placeholder="e.g., 50"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
            />
          </div>
          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? 'Assigning...' : 'Assign Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
