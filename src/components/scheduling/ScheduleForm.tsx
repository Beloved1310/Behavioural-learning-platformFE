import React, { useState, useEffect } from 'react';

interface Session {
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderEnabled?: boolean;
  reminderTime?: number;
  description?: string;
}

interface ScheduleFormProps {
  onSubmit?: (sessionData: Partial<Session>) => void;
  onUpdate?: (sessionId: string, sessionData: Partial<Session>) => void;
  onCancel?: () => void;
  editingSession?: Session | null;
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({
  onSubmit,
  onUpdate,
  onCancel,
  editingSession
}) => {
  const [formData, setFormData] = useState<Partial<Session>>({
    title: '',
    subject: '',
    type: 'study',
    startTime: '',
    endTime: '',
    isRecurring: false,
    recurringPattern: 'weekly',
    reminderEnabled: true,
    reminderTime: 15,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingSession) {
      setFormData({
        title: editingSession.title,
        subject: editingSession.subject,
        type: editingSession.type,
        startTime: editingSession.startTime,
        endTime: editingSession.endTime,
        isRecurring: editingSession.isRecurring || false,
        recurringPattern: editingSession.recurringPattern || 'weekly',
        reminderEnabled: editingSession.reminderEnabled ?? true,
        reminderTime: editingSession.reminderTime ?? 15,
        description: editingSession.description || ''
      });
    }
  }, [editingSession]);

  const subjects = [
    { id: 'math', label: 'Fun with Numbers 🔢', color: 'purple' },
    { id: 'reading', label: 'Reading Adventures 📖', color: 'blue' },
    { id: 'science', label: 'Science Explorers 🔬', color: 'green' },
    { id: 'history', label: 'World Discoveries 🌍', color: 'orange' },
    { id: 'art', label: 'Creative Arts 🎨', color: 'pink' },
    { id: 'music', label: 'Music & Sounds 🎵', color: 'yellow' },
    { id: 'general', label: 'General Learning 📚', color: 'gray' }
  ];

  const sessionTypes = [
    { id: 'study', label: 'Self Study 📚', description: 'Learn on your own', icon: '📚' },
    { id: 'reading', label: 'Reading Time 📖', description: 'Read amazing stories', icon: '📖' },
    { id: 'quiz', label: 'Fun Quiz 🧠', description: 'Test your knowledge', icon: '🧠' },
    { id: 'tutoring', label: 'Tutor Session 👨‍🏫', description: 'Learn with a teacher', icon: '👨‍🏫' }
  ];

  const reminderOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' }
  ];

  const recurringPatterns = [
    { value: 'daily', label: 'Every day', icon: '📅' },
    { value: 'weekly', label: 'Every week', icon: '🗓️' },
    { value: 'monthly', label: 'Every month', icon: '📆' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Please give your session a fun name!';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please pick a subject you want to learn!';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'When do you want to start learning?';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'When will you finish?';
    }

    if (formData.startTime && formData.endTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (endTime <= startTime) {
        newErrors.endTime = 'End time must be after start time!';
      }

      if (startTime < new Date()) {
        newErrors.startTime = 'You can\'t schedule sessions in the past!';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (editingSession && onUpdate) {
      onUpdate(editingSession.id, formData);
    } else if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof Session, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getDefaultEndTime = (startTime: string) => {
    if (!startTime) return '';

    const start = new Date(startTime);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 45); // Default 45-minute sessions

    return end.toISOString().slice(0, 16);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Session Title */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            What's your learning adventure called? 🌟
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Math Magic Time, Science Discovery..."
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            What subject will you explore? 📚
          </label>
          <div className="grid grid-cols-1 gap-2">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                type="button"
                onClick={() => handleChange('subject', subject.id)}
                className={`p-3 text-left rounded-xl border-2 transition-all ${
                  formData.subject === subject.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                }`}
              >
                <span className="font-medium">{subject.label}</span>
              </button>
            ))}
          </div>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
          )}
        </div>

        {/* Session Type */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            How do you want to learn? 🎯
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sessionTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleChange('type', type.id)}
                className={`p-3 text-center rounded-xl border-2 transition-all ${
                  formData.type === type.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-medium text-sm">{type.label}</div>
                <div className="text-xs text-gray-600">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              When do you start? ⏰
            </label>
            <input
              type="datetime-local"
              value={formData.startTime ? formData.startTime.slice(0, 16) : ''}
              onChange={(e) => {
                const newStartTime = e.target.value ? `${e.target.value}:00.000Z` : '';
                handleChange('startTime', newStartTime);
                if (newStartTime && !formData.endTime) {
                  handleChange('endTime', getDefaultEndTime(newStartTime));
                }
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.startTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-purple-900 mb-2">
              When do you finish? 🏁
            </label>
            <input
              type="datetime-local"
              value={formData.endTime ? formData.endTime.slice(0, 16) : ''}
              onChange={(e) => {
                const newEndTime = e.target.value ? `${e.target.value}:00.000Z` : '';
                handleChange('endTime', newEndTime);
              }}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                errors.endTime ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Recurring Sessions */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-purple-900">
              Do you want to repeat this session? 🔄
            </label>
            <button
              type="button"
              onClick={() => handleChange('isRecurring', !formData.isRecurring)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                formData.isRecurring ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  formData.isRecurring ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {formData.isRecurring && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {recurringPatterns.map((pattern) => (
                <button
                  key={pattern.value}
                  type="button"
                  onClick={() => handleChange('recurringPattern', pattern.value)}
                  className={`p-2 text-center rounded-lg border transition-all ${
                    formData.recurringPattern === pattern.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-lg mb-1">{pattern.icon}</div>
                  <div className="text-xs font-medium">{pattern.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-purple-900">
              Do you want reminders? 🔔
            </label>
            <button
              type="button"
              onClick={() => handleChange('reminderEnabled', !formData.reminderEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                formData.reminderEnabled ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  formData.reminderEnabled ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {formData.reminderEnabled && (
            <select
              value={formData.reminderTime || 15}
              onChange={(e) => handleChange('reminderTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mt-2"
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-purple-900 mb-2">
            Tell us more about your adventure! 📝 (Optional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="What are you excited to learn? Any special goals?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            {editingSession ? '✨ Update Session' : '🚀 Create Adventure!'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};