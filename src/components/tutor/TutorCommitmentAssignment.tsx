import React, { useState, useEffect } from 'react';
import {
  tutorCommitmentsService,
  AssignedCommitment,
} from '../../services/tutorCommitmentsService';
import { tutorStudentsService, StudentProgress } from '../../services/tutorStudentsService';
import { Calendar, Plus, X, CheckCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

interface CommitmentItem {
  text: string;
  type: 'time' | 'quizzes' | 'sessions';
  target: number;
}

export const TutorCommitmentAssignment: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [assignedCommitments, setAssignedCommitments] = useState<AssignedCommitment[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [commitments, setCommitments] = useState<CommitmentItem[]>([
    { text: '', type: 'time', target: 0 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load commitments and students separately to handle errors gracefully
      const commitmentsPromise = tutorCommitmentsService.getAssignedCommitments().catch((error) => {
        logger.error('Failed to load commitments', error);
        return [];
      });

      const studentsPromise = tutorStudentsService
        .getAllStudentsProgress()
        .then((result) => result.students || [])
        .catch((error) => {
          logger.error('Failed to load students', error);
          return [];
        });

      const [commitmentsData, studentsData] = await Promise.all([
        commitmentsPromise,
        studentsPromise,
      ]);
      setAssignedCommitments(commitmentsData);
      setStudents(studentsData);
    } catch (error) {
      logger.error('Failed to load data', error);
      // Set empty arrays to prevent UI crashes
      setAssignedCommitments([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCommitment = () => {
    if (commitments.length < 5) {
      setCommitments([...commitments, { text: '', type: 'time', target: 0 }]);
    }
  };

  const handleRemoveCommitment = (index: number) => {
    if (commitments.length > 1) {
      setCommitments(commitments.filter((_, i) => i !== index));
    }
  };

  const handleCommitmentChange = (
    index: number,
    field: keyof CommitmentItem,
    value: string | number
  ) => {
    const updated = [...commitments];
    updated[index] = { ...updated[index], [field]: value };
    setCommitments(updated);
  };

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      showWarning('Please select a student');
      return;
    }

    if (commitments.some((c) => !c.text.trim() || c.target <= 0)) {
      showWarning('Please fill in all commitment fields');
      return;
    }

    try {
      await tutorCommitmentsService.assignCommitment(selectedStudentId, {
        commitments: commitments.map((c) => ({
          text: c.text,
          type: c.type,
          target: c.target,
          completed: false,
        })),
      });
      await loadData();
      setShowModal(false);
      setSelectedStudentId('');
      setCommitments([{ text: '', type: 'time', target: 0 }]);
      showSuccess('Commitments assigned successfully!');
    } catch (error) {
      logger.error('Failed to assign commitments', error);
      showError(getErrorMessage(error, 'Failed to assign commitments. Please try again.'));
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
      <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assigned Commitments</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-blue-600">{assignedCommitments.length}</span>{' '}
                commitments assigned
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <Plus className="w-5 h-5" />
            Assign Commitments
          </button>
        </div>

        {assignedCommitments.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-gray-600 font-medium text-lg">No commitments assigned yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Assign weekly commitments to help students stay on track
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignedCommitments.map((commitment) => (
              <div
                key={commitment.id}
                className="group bg-white border-2 border-blue-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {commitment.studentName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Week of {formatDate(commitment.weekStart)} - {formatDate(commitment.weekEnd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-4 py-2 rounded-xl font-semibold ${
                        commitment.completionRate >= 80
                          ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                          : commitment.completionRate >= 50
                            ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                            : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                      }`}
                    >
                      <span className="text-sm">{commitment.completionRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {commitment.commitments.map((item, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        item.completed
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {item.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm font-medium ${item.completed ? 'text-gray-700 line-through' : 'text-gray-900'}`}
                        >
                          {item.text}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 bg-white px-2 py-1 rounded-lg">
                        {item.target} {item.type === 'time' ? 'min' : item.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-2xl w-full border-2 border-blue-100 max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Assign Weekly Commitments</h3>
              <p className="text-sm text-gray-600 mt-1">Set weekly tasks for your students</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-gray-900">Commitments</label>
                {commitments.length < 5 && (
                  <button
                    onClick={handleAddCommitment}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Commitment
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {commitments.map((commitment, index) => (
                  <div
                    key={index}
                    className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={commitment.text}
                          onChange={(e) => handleCommitmentChange(index, 'text', e.target.value)}
                          placeholder="e.g., Study Math for 30 minutes daily"
                          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium mb-3"
                        />
                        <div className="flex gap-2">
                          <select
                            value={commitment.type}
                            onChange={(e) =>
                              handleCommitmentChange(
                                index,
                                'type',
                                e.target.value as 'time' | 'quizzes' | 'sessions'
                              )
                            }
                            className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                          >
                            <option value="time">Time (minutes)</option>
                            <option value="quizzes">Quizzes</option>
                            <option value="sessions">Sessions</option>
                          </select>
                          <input
                            type="number"
                            value={commitment.target}
                            onChange={(e) =>
                              handleCommitmentChange(index, 'target', parseInt(e.target.value) || 0)
                            }
                            placeholder="Target"
                            min="1"
                            className="w-28 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                          />
                          {commitments.length > 1 && (
                            <button
                              onClick={() => handleRemoveCommitment(index)}
                              className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors border-2 border-transparent hover:border-red-200"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedStudentId('');
                  setCommitments([{ text: '', type: 'time', target: 0 }]);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Assign Commitments
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
