import React, { useState, useEffect } from 'react';
import { tutorSessionService } from '../../services/tutorSessionService';
import { tutorStudentsService } from '../../services/tutorStudentsService';
import { StudentProgress } from '../../services/tutorStudentsService';
import { Plus } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';
import { getErrorMessage } from '../../utils/errors';

export const TutorCreateSession: React.FC<{ onSessionCreated?: () => void }> = ({
  onSessionCreated,
}) => {
  const { showSuccess, showError, showWarning } = useToast();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    title: '',
    subject: '',
    scheduledAt: '',
    duration: 60,
    description: '',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const result = await tutorStudentsService.getAllStudentsProgress();
      setStudents(result.students || []);
    } catch (error) {
      logger.error('Failed to load students', error);
      showError('Failed to load students. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.title || !formData.subject || !formData.scheduledAt) {
      showWarning('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Map frontend subject IDs to backend subject names
      const subjectMapping: Record<string, string> = {
        'math': 'Mathematics',
        'reading': 'English',
        'science': 'Science',
        'history': 'History',
        'art': 'Art',
        'music': 'Music',
        'general': 'Mathematics',
      };

      // Valid backend subject names
      const validSubjects = [
        'Mathematics', 'English', 'Science', 'Physics', 'Chemistry',
        'Biology', 'History', 'Geography', 'Computer Science',
        'Art', 'Music', 'Spanish', 'French', 'German'
      ];

      // Normalize subject: if already valid, use it; otherwise map it
      const subjectKey = formData.subject.toLowerCase();
      let mappedSubject: string;
      
      if (validSubjects.includes(formData.subject)) {
        // Already a valid backend subject
        mappedSubject = formData.subject;
      } else if (subjectMapping[subjectKey]) {
        // Map from frontend ID to backend name
        mappedSubject = subjectMapping[subjectKey];
      } else {
        // Try to match case-insensitively with valid subjects
        const matchedSubject = validSubjects.find(
          s => s.toLowerCase() === subjectKey
        );
        mappedSubject = matchedSubject || 'Mathematics'; // Fallback to Mathematics
      }

      await tutorSessionService.createSession({
        studentId: formData.studentId,
        title: formData.title,
        subject: mappedSubject,
        scheduledAt: new Date(formData.scheduledAt).toISOString(),
        duration: formData.duration,
        description: formData.description || undefined,
      });

      showSuccess('Session created successfully!');
      setShowModal(false);
      setFormData({
        studentId: '',
        title: '',
        subject: '',
        scheduledAt: '',
        duration: 60,
        description: '',
      });
      onSessionCreated?.();
    } catch (error: unknown) {
      logger.error('Failed to create session', error);
      showError(getErrorMessage(error, 'Failed to create session'));
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // At least 30 minutes from now
    return now.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 font-medium"
      >
        <Plus className="w-4 h-4" />
        <span>Create Session</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Session for Student</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Select Student *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Math Tutoring Session"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Math, Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  min={getMinDateTime()}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Duration (minutes) *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 font-medium disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
