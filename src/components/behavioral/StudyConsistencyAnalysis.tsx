import React, { useEffect, useState } from 'react';
import { behavioralTrackingService } from '../../services/behavioralTrackingService';
import { useAuthStore } from '../../store/authStore';

interface ConsistencyData {
  currentStreak: number;
  longestStreak: number;
  averageSessionsPerWeek: number;
  consistencyScore: number;
  weeklyPattern: { day: string; sessions: number; dayName: string }[];
  monthlyTrend: { month: string; sessions: number; monthName: string }[];
  recommendations: string[];
}

export const StudyConsistencyAnalysis: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [consistencyData, setConsistencyData] = useState<ConsistencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const analyzeConsistency = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        console.log('[StudyConsistencyAnalysis] Starting analysis for user:', user.id);
        const analysis = await behavioralTrackingService.analyzeStudyConsistency(user.id);
        console.log('[StudyConsistencyAnalysis] Analysis result:', analysis);

        // Validate and ensure all required fields exist
        const validatedAnalysis: ConsistencyData = {
          currentStreak: analysis?.currentStreak ?? 0,
          longestStreak: analysis?.longestStreak ?? 0,
          averageSessionsPerWeek: analysis?.averageSessionsPerWeek ?? 0,
          consistencyScore: analysis?.consistencyScore ?? 0,
          weeklyPattern: Array.isArray(analysis?.weeklyPattern) ? analysis.weeklyPattern : [],
          monthlyTrend: Array.isArray(analysis?.monthlyTrend) ? analysis.monthlyTrend : [],
          recommendations: Array.isArray(analysis?.recommendations) ? analysis.recommendations : [],
        };

        console.log('[StudyConsistencyAnalysis] Validated analysis:', validatedAnalysis);
        setConsistencyData(validatedAnalysis);
      } catch (error) {
        console.error('[StudyConsistencyAnalysis] Failed to analyze study consistency:', error);
        console.error('[StudyConsistencyAnalysis] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          error,
        });
      } finally {
        setLoading(false);
      }
    };

    analyzeConsistency();
  }, [user?.id]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!consistencyData) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-purple-900 mb-2">Keep Learning!</h3>
          <p className="text-amber-600">Complete more sessions to see your consistency analysis!</p>
        </div>
      </div>
    );
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '👑';
    if (streak >= 14) return '🏆';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '⭐';
    return '🌱';
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConsistencyMessage = (score: number) => {
    if (score >= 80) return "Amazing consistency! You're a learning superstar!";
    if (score >= 60) return "Great job! You're building strong learning habits!";
    if (score >= 40) return 'Good progress! Keep working on your routine!';
    return "Let's work together to build stronger learning habits!";
  };

  // Safely calculate max sessions with fallback to empty arrays
  const weeklyPattern = consistencyData.weeklyPattern || [];
  const monthlyTrend = consistencyData.monthlyTrend || [];

  const maxWeeklySessions =
    weeklyPattern.length > 0 ? Math.max(...weeklyPattern.map((d) => d.sessions)) : 0;
  const maxMonthlySessions =
    monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map((d) => d.sessions)) : 0;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-900">Study Consistency Analysis</h3>
          <p className="text-amber-600">How well are you sticking to your learning routine?</p>
        </div>
        <div className="text-4xl">{getStreakEmoji(consistencyData.currentStreak ?? 0)}</div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
          <div className="text-2xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-purple-900">
            {consistencyData.currentStreak ?? 0}
          </div>
          <div className="text-xs text-amber-600 font-medium">Current Streak (days)</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-2xl font-bold text-purple-900">
            {consistencyData.longestStreak ?? 0}
          </div>
          <div className="text-xs text-amber-600 font-medium">Best Streak (days)</div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-2xl font-bold text-purple-900">
            {consistencyData.averageSessionsPerWeek != null
              ? consistencyData.averageSessionsPerWeek.toFixed(1)
              : '0.0'}
          </div>
          <div className="text-xs text-amber-600 font-medium">Sessions per Week</div>
        </div>

        <div
          className={`text-center p-4 rounded-xl border ${getConsistencyColor(consistencyData.consistencyScore ?? 0)}`}
        >
          <div className="text-2xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-purple-900">
            {consistencyData.consistencyScore != null ? consistencyData.consistencyScore : 0}%
          </div>
          <div className="text-xs font-medium">Consistency Score</div>
        </div>
      </div>

      {/* Consistency Message */}
      <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center">
          <span className="text-2xl mr-3">💪</span>
          <div>
            <p className="font-semibold text-purple-900">
              {getConsistencyMessage(consistencyData.consistencyScore ?? 0)}
            </p>
            <p className="text-purple-700 text-sm mt-1">
              You're learning consistently and building great habits!
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Pattern */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-purple-900 mb-4">📊 Weekly Learning Pattern</h4>
        <div className="space-y-3">
          {weeklyPattern.map((day) => (
            <div key={day.day} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <span className="font-medium text-purple-900 w-16 text-sm">{day.dayName}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-0">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width:
                        maxWeeklySessions > 0
                          ? `${(day.sessions / maxWeeklySessions) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-amber-600 ml-3 w-8 text-right">
                {day.sessions}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-purple-900 mb-4">📈 Monthly Learning Trend</h4>
        <div className="space-y-3">
          {monthlyTrend.map((month) => (
            <div key={month.month} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <span className="font-medium text-purple-900 w-16 text-sm">{month.monthName}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 min-w-0">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width:
                        maxMonthlySessions > 0
                          ? `${(month.sessions / maxMonthlySessions) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-bold text-amber-600 ml-3 w-8 text-right">
                {month.sessions}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {consistencyData.recommendations && consistencyData.recommendations.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-purple-900 mb-4">💡 Recommendations for You</h4>
          <div className="space-y-3">
            {consistencyData.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-start p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <span className="text-yellow-600 mr-3 mt-1">💡</span>
                <p className="text-purple-800 text-sm leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement Section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <div className="flex items-center text-sm text-green-800">
          <span className="text-lg mr-2">🌟</span>
          <p>
            {consistencyData.currentStreak >= 7
              ? "You're on an amazing streak! Keep up the fantastic work!"
              : "Every day you learn is a victory! Let's build that streak together!"}
          </p>
        </div>
      </div>
    </div>
  );
};
