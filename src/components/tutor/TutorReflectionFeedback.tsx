import React, { useState, useEffect } from 'react';
import {
  tutorReflectionsService,
  PendingReflection,
  StudentReflection,
} from '../../services/tutorReflectionsService';
import { tutorStudentsService, StudentProgress } from '../../services/tutorStudentsService';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const TutorReflectionFeedback: React.FC = () => {
  const { showSuccess, showError, showWarning } = useToast();
  const [pendingReflections, setPendingReflections] = useState<PendingReflection[]>([]);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentReflections, setStudentReflections] = useState<StudentReflection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedReflection, setSelectedReflection] = useState<
    PendingReflection | StudentReflection | null
  >(null);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load reflections and students separately to handle errors gracefully
      const pendingPromise = tutorReflectionsService.getPendingFeedback(10).catch((error) => {
        logger.error('Failed to load pending reflections', error);
        return [];
      });

      const studentsPromise = tutorStudentsService
        .getAllStudentsProgress()
        .then((result) => result.students || [])
        .catch((error) => {
          logger.error('Failed to load students', error);
          return [];
        });

      const [pending, studentsData] = await Promise.all([pendingPromise, studentsPromise]);
      setPendingReflections(pending);
      setStudents(studentsData);
    } catch (error) {
      logger.error('Failed to load data', error);
      // Set empty arrays to prevent UI crashes
      setPendingReflections([]);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentReflections = async (studentId: string) => {
    try {
      const reflections = await tutorReflectionsService.getStudentReflections(studentId, 20);
      setStudentReflections(reflections);
    } catch (error) {
      logger.error('Failed to load student reflections', error);
      showError('Failed to load student reflections. Please try again.');
    }
  };

  const handleStudentChange = (studentId: string) => {
    setSelectedStudentId(studentId);
    if (studentId) {
      loadStudentReflections(studentId);
    } else {
      setStudentReflections([]);
    }
  };

  const handleAddFeedback = (reflection: PendingReflection | StudentReflection) => {
    setSelectedReflection(reflection);
    setFeedbackComment('');
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedReflection || !feedbackComment.trim()) {
      showWarning('Please enter feedback');
      return;
    }

    try {
      await tutorReflectionsService.addFeedback(selectedReflection.id, {
        comment: feedbackComment.trim(),
      });
      await loadData();
      if (selectedStudentId) {
        await loadStudentReflections(selectedStudentId);
      }
      setShowFeedbackModal(false);
      setSelectedReflection(null);
      setFeedbackComment('');
      showSuccess('Feedback added successfully!');
    } catch (error) {
      logger.error('Failed to add feedback', error);
      showError(getErrorMessage(error, 'Failed to add feedback. Please try again.'));
      showError('Failed to add feedback. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
      <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-6 sm:p-8 shadow-lg border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reflection Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-purple-600">{pendingReflections.length}</span>{' '}
                reflections need feedback
              </p>
            </div>
          </div>
        </div>

        {/* Student Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            View Reflections by Student
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => handleStudentChange(e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium bg-white"
          >
            <option value="">All Students (Pending Feedback)</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reflections List */}
        {selectedStudentId ? (
          <div className="space-y-4">
            {studentReflections.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-purple-400" />
                </div>
                <p className="text-gray-600 font-medium text-lg">
                  No reflections found for this student
                </p>
              </div>
            ) : (
              studentReflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="group bg-white border-2 border-purple-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">
                          {formatDate(reflection.date)}
                        </span>
                      </div>
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                        {reflection.type}
                      </span>
                    </div>
                    {!reflection.tutorFeedback && (
                      <button
                        onClick={() => handleAddFeedback(reflection)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Add Feedback
                      </button>
                    )}
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-3">{reflection.prompt}</p>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {reflection.response}
                  </p>
                  {reflection.tutorFeedback && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                      <p className="text-xs font-bold text-purple-900 mb-2 uppercase tracking-wide">
                        Your Feedback:
                      </p>
                      <p className="text-sm text-purple-800 mb-2 leading-relaxed">
                        {reflection.tutorFeedback.comment}
                      </p>
                      <p className="text-xs text-purple-600 font-medium">
                        {formatDate(reflection.tutorFeedback.feedbackAt)}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {pendingReflections.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-green-400" />
                </div>
                <p className="text-gray-600 font-medium text-lg">No reflections need feedback</p>
                <p className="text-sm text-gray-400 mt-2">All reflections have been reviewed ✨</p>
              </div>
            ) : (
              pendingReflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="group bg-white border-2 border-purple-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-semibold text-gray-700">
                          {reflection.studentName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                        {formatDate(reflection.date)}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                        {reflection.type}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddFeedback(reflection)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
                    >
                      <Send className="w-4 h-4" />
                      Add Feedback
                    </button>
                  </div>
                  <p className="text-base font-bold text-gray-900 mb-3">{reflection.prompt}</p>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {reflection.response}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && selectedReflection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/20 p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full border-2 border-purple-100">
            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Feedback</h3>
              <p className="text-sm text-gray-600">Provide encouraging feedback or guidance</p>
            </div>
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
              <p className="text-sm font-bold text-gray-900 mb-2">Reflection:</p>
              <p className="text-sm text-gray-700 mb-3">{selectedReflection.prompt}</p>
              <p className="text-sm text-gray-600 italic leading-relaxed">
                "{selectedReflection.response}"
              </p>
            </div>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Provide encouraging feedback or guidance..."
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-6 resize-none"
              rows={5}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setSelectedReflection(null);
                  setFeedbackComment('');
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
