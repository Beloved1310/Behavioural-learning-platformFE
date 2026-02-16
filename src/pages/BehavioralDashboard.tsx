import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/';
import { useBehavioralStore } from '../store/behavioralStore';
import { useAuthStore } from '../store/authStore';
import { useBehavioralTracking } from '../hooks/useBehavioralTracking';
import { Calendar, TrendingUp, BookOpen, Target, Rocket } from 'lucide-react';

export const BehavioralDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    weeklyProgressSummary,
    motivationalNudges,
    reflectionPrompts,
    isLoading,
    error,
    fetchWeeklyProgressSummary,
    fetchMotivationalNudges,
    fetchReflectionPrompts,
  } = useBehavioralStore();

  const { trackCustomEvent } = useBehavioralTracking(user?.id || '');

  useEffect(() => {
    if (user?.id) {
      trackCustomEvent('login', { page: 'behavioral_dashboard' });
      fetchWeeklyProgressSummary();
      fetchMotivationalNudges(3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // fetchWeeklyProgressSummary, fetchMotivationalNudges, and trackCustomEvent are stable and don't need to be in deps

  const handleGetReflectionPrompts = async () => {
    await fetchReflectionPrompts({
      subject: 'General',
      duration: 30,
    });
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes rocketLaunch {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 flex items-center gap-2">
              Your Learning Journey{' '}
              <Rocket
                className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 inline-block"
                style={{ animation: 'rocketLaunch 2s ease-in-out infinite' }}
              />
            </h1>
            <p className="text-sm sm:text-base text-amber-600 mt-1">
              Track your progress and get personalized insights!
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Behavior Nudges - Enhanced Feature */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-purple-300 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl shadow-md flex-shrink-0">
                💡
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-purple-900 truncate">
                  Behavior Nudges
                </h2>
                <p className="text-xs sm:text-sm text-purple-600">
                  Personalized suggestions to keep you motivated
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchMotivationalNudges(3)}
              disabled={isLoading}
              className="px-3 sm:px-4 py-2 bg-white border-2 border-purple-300 rounded-lg text-purple-700 font-semibold hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm text-xs sm:text-sm flex-shrink-0"
              title="Get new nudges"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {isLoading && motivationalNudges.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : motivationalNudges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              {motivationalNudges.map((nudge, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 sm:p-5 border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 transform"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <p className="text-purple-900 font-medium text-xs sm:text-sm leading-relaxed flex-1">
                      {nudge}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border-2 border-purple-200 text-center">
              <p className="text-purple-700 font-medium">No nudges available right now.</p>
              <p className="text-purple-600 text-sm mt-2">
                Click refresh to get personalized suggestions!
              </p>
            </div>
          )}

          <div className="mt-4 p-3 bg-white/60 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 text-center">
              <span className="font-semibold">💭 Tip:</span> These nudges are personalized based on
              your learning activity.
              {motivationalNudges.length > 0 && ' Refresh to get new suggestions!'}
            </p>
          </div>
        </div>

        {/* Weekly Progress Summary */}
        {isLoading && !weeklyProgressSummary ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : weeklyProgressSummary ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-purple-900 mb-4 sm:mb-6 flex items-center">
              <Calendar className="mr-2 h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <span className="truncate">Weekly Progress Summary</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Sessions Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                  <span className="text-2xl sm:text-3xl font-bold text-blue-900">
                    {weeklyProgressSummary.sessions.completed}
                  </span>
                </div>
                <p className="text-blue-800 font-semibold text-sm sm:text-base">
                  Sessions Completed
                </p>
                <p className="text-blue-600 text-xs sm:text-sm mt-1">
                  {weeklyProgressSummary.sessions.totalDuration} minutes total
                </p>
              </div>

              {/* Quizzes Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                  <span className="text-2xl sm:text-3xl font-bold text-green-900">
                    {weeklyProgressSummary.quizzes.completed}
                  </span>
                </div>
                <p className="text-green-800 font-semibold text-sm sm:text-base">
                  Quizzes Completed
                </p>
                <p className="text-green-600 text-xs sm:text-sm mt-1">
                  {weeklyProgressSummary.quizzes.averageScore}% average score
                </p>
              </div>

              {/* Engagement Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0" />
                  <span className="text-2xl sm:text-3xl font-bold text-purple-900">
                    {weeklyProgressSummary.engagement.averageScore}%
                  </span>
                </div>
                <p className="text-purple-800 font-semibold text-sm sm:text-base">
                  Engagement Score
                </p>
                <p className="text-purple-600 text-xs sm:text-sm mt-1">
                  {weeklyProgressSummary.engagement.totalTime} minutes engaged
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 mt-4">
              <p>
                Period: {new Date(weeklyProgressSummary.weekStart).toLocaleDateString()} -{' '}
                {new Date(weeklyProgressSummary.weekEnd).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : null}

        {/* Reflection Prompts Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-purple-900 mb-3 sm:mb-4 flex items-center">
            <span className="mr-2 flex-shrink-0">🤔</span>
            <span className="truncate">Reflection Prompts</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
            Take a moment to reflect on your learning journey. These prompts help you think about
            what went well and what you'd like to improve.
          </p>

          <button
            onClick={handleGetReflectionPrompts}
            disabled={isLoading}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 mb-3 sm:mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Get Reflection Prompts</span>
              </>
            )}
          </button>

          {reflectionPrompts.length > 0 && (
            <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base sm:text-lg flex-shrink-0">💭</span>
                <h3 className="text-base sm:text-lg font-semibold text-purple-900">
                  Your Reflection Questions
                </h3>
              </div>
              {reflectionPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-lg p-4 sm:p-5 border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {index + 1}
                    </div>
                    <p className="text-purple-900 font-medium text-sm sm:text-base leading-relaxed flex-1">
                      {prompt}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">💡 Tip:</span> Take your time to think about each
                  question. Reflection helps you understand your learning process better!
                </p>
              </div>
            </div>
          )}

          {!isLoading && reflectionPrompts.length === 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-600 text-sm">
                Click the button above to get personalized reflection prompts based on your learning
                journey.
              </p>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <span className="text-lg mr-2">💡</span>
            <div>
              <p className="font-semibold mb-1">Learning Tip:</p>
              <p>
                The more you use the app, the better we understand how you learn best! Keep
                completing sessions and quizzes to get more personalized insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
