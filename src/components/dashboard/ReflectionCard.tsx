import React, { useState, useEffect } from 'react';
import { reflectionsService, ReflectionEntry } from '../../services/reflectionsService';
import { useAuthStore } from '../../store/authStore';
import { Brain, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import { logger } from '../../utils/logger';

export const ReflectionCard: React.FC = () => {
  const { user } = useAuthStore();
  const { showError, showInfo } = useToast();
  const navigate = useNavigate();
  const [todayReflection, setTodayReflection] = useState<ReflectionEntry | null>(null);
  const [weeklyReflections, setWeeklyReflections] = useState<ReflectionEntry[]>([]);
  const [reflectionStreak, setReflectionStreak] = useState(0);
  const [todayPrompt, setTodayPrompt] = useState<string>('What went well today?');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadReflections();
      loadTodayPrompt();
    }
  }, [user?.id]);

  const loadReflections = async () => {
    try {
      setLoading(true);
      const [reflections, insights] = await Promise.all([
        reflectionsService.getReflections('week'),
        reflectionsService.getInsights(),
      ]);

      // Find today's reflection
      const today = new Date().toISOString().split('T')[0];
      const todayRef = reflections.find((r) => r.date.startsWith(today) && r.type === 'daily');
      setTodayReflection(todayRef || null);

      // Get weekly reflections (excluding today)
      setWeeklyReflections(reflections.filter((r) => !r.date.startsWith(today)));
      setReflectionStreak(insights.streak);
    } catch (error) {
      logger.error('Failed to load reflections', error);
      showError('Failed to load reflections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadTodayPrompt = async () => {
    try {
      const prompts = await reflectionsService.getTodayPrompt();
      if (prompts.length > 0) {
        setTodayPrompt(prompts[0]);
      }
    } catch (error) {
      logger.error('Failed to load prompt', error);
      // Don't show error toast for prompt loading failure - use default prompt
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-900 flex items-center space-x-2">
          <Brain className="w-5 h-5" />
          <span>Daily Reflection</span>
        </h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            todayReflection ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}
        >
          {todayReflection ? 'Completed' : 'Pending'}
        </span>
      </div>

      {!todayReflection ? (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 mb-4">
          <p className="text-sm font-medium text-gray-900 mb-2">{todayPrompt}</p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 text-sm font-medium"
          >
            Reflect Now ✨
          </button>
        </div>
      ) : (
        <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">Reflection Complete!</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{todayReflection.response}</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs text-blue-600 mt-2 hover:text-blue-800"
          >
            View Full →
          </button>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📝</span>
          <span className="text-sm text-gray-700">Reflection Streak</span>
        </div>
        <span className="text-lg font-bold text-gray-900">{reflectionStreak} days</span>
      </div>

      {weeklyReflections.length > 0 && (
        <div className="space-y-2 mb-4">
          <h5 className="text-sm font-semibold text-gray-700">This Week</h5>
          {weeklyReflections.slice(0, 3).map((reflection) => (
            <div
              key={reflection.id}
              className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
              onClick={() => navigate('/reflections')}
            >
              <span className="text-sm">{reflection.mood || '💭'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 line-clamp-1">{reflection.response}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(reflection.date)}</p>
              </div>
              {reflection.tutorFeedback && <span className="text-xs text-blue-600">👨‍🏫</span>}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/reflections')}
        className="w-full mt-4 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 text-sm"
      >
        View All Reflections →
      </button>

      {showModal && (
        <ReflectionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadReflections();
          }}
          existingReflection={todayReflection}
          prompt={todayPrompt}
        />
      )}
    </div>
  );
};

const ReflectionModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
  existingReflection?: ReflectionEntry | null;
  prompt?: string;
}> = ({ onClose, onSuccess, existingReflection, prompt }) => {
  const [response, setResponse] = useState(existingReflection?.response || '');
  const [mood, setMood] = useState(existingReflection?.mood || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!response.trim()) return;

    try {
      setLoading(true);
      if (existingReflection) {
        // For MVP, we'll just show a message that editing isn't available
        showInfo(
          'Editing reflections is not available in MVP. You can create a new reflection tomorrow.'
        );
        onClose();
        return;
      }

      await reflectionsService.createReflection({
        prompt: prompt || 'What went well today?',
        response,
        type: 'daily',
        mood: mood || undefined,
      });
      onSuccess();
    } catch (error: unknown) {
      logger.error('Failed to save reflection', error);
      showError(error.message || 'Failed to save reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/10 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Reflection</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {prompt || 'What went well today?'}
            </label>
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={5}
              placeholder="Share your thoughts..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Mood (Optional)</label>
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="e.g., happy, motivated, tired"
            />
          </div>
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
              disabled={loading || !response.trim()}
              className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Reflection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
