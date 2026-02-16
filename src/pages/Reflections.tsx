import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import {
  reflectionsService,
  ReflectionEntry,
  ReflectionInsights,
} from '../services/reflectionsService';
import { useAuthStore } from '../store/authStore';
import { Brain, ArrowLeft, Calendar, BookOpen, TrendingUp } from 'lucide-react';

export const Reflections: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [reflections, setReflections] = useState<ReflectionEntry[]>([]);
  const [insights, setInsights] = useState<ReflectionInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'daily' | 'weekly' | 'session'>('all');

  useEffect(() => {
    if (user?.id) {
      loadReflections();
      loadInsights();
    }
  }, [user?.id]);

  const loadReflections = async () => {
    try {
      setLoading(true);
      const data = await reflectionsService.getReflections('all');
      setReflections(data);
    } catch (error) {
      console.error('Failed to load reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const data = await reflectionsService.getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredReflections =
    filter === 'all' ? reflections : reflections.filter((r) => r.type === filter);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reflections</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Review your learning journey and insights
              </p>
            </div>
          </div>
        </div>

        {/* Insights Summary */}
        {insights && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">Reflection Streak</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{insights.streak} days</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100">
              <div className="flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">Total Reflections</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {insights.totalReflections}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                <h3 className="text-xs sm:text-sm font-medium text-gray-700">Patterns Found</h3>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {insights.patterns?.length || 0}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'daily', 'weekly', 'session'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reflections List */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          {filteredReflections.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Brain className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No Reflections Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Start reflecting on your learning journey to see your thoughts here!
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-purple-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-600 font-medium text-sm sm:text-base"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredReflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {formatDate(reflection.date)}
                        </span>
                        <span className="text-xs text-gray-500">{formatTime(reflection.date)}</span>
                        <span
                          className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                            reflection.type === 'daily'
                              ? 'bg-blue-100 text-blue-700'
                              : reflection.type === 'weekly'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {reflection.type}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base truncate">
                        {reflection.prompt}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                        {reflection.response}
                      </p>
                    </div>
                  </div>

                  {reflection.mood && (
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Mood:</span>
                      <span className="text-lg">{reflection.mood}</span>
                    </div>
                  )}

                  {reflection.tutorFeedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-blue-900">👨‍🏫 Tutor Feedback</span>
                        {!reflection.tutorFeedback.isRead && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-blue-800">{reflection.tutorFeedback.comment}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {formatDate(reflection.tutorFeedback.feedbackAt)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
