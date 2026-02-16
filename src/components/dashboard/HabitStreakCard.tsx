import React, { useState, useEffect } from 'react';
import { habitsService, Streak, HeatmapDay } from '../../services/habitsService';
import { useAuthStore } from '../../store/authStore';
import { Flame, BookOpen, Brain } from 'lucide-react';

export const HabitStreakCard: React.FC = () => {
  const { user } = useAuthStore();
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [viewMode, setViewMode] = useState<'heatmap' | 'list'>('heatmap');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [streaksData, heatmapData] = await Promise.all([
        habitsService.getStreaks(),
        habitsService.getHeatmap(30),
      ]);
      setStreaks(streaksData);
      setHeatmap(heatmapData);
    } catch (error) {
      console.error('Failed to load habit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreakIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <Flame className="w-6 h-6 text-red-500" />;
      case 'study':
        return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'quiz':
        return <Brain className="w-6 h-6 text-green-500" />;
      default:
        return '🔥';
    }
  };

  const getActivityColor = (activity: number) => {
    switch (activity) {
      case 0:
        return 'bg-gray-100';
      case 1:
        return 'bg-green-200';
      case 2:
        return 'bg-green-400';
      case 3:
        return 'bg-green-600';
      default:
        return 'bg-gray-100';
    }
  };

  const loginStreak = streaks.find((s) => s.type === 'login')?.days || 0;

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
          <Flame className="w-5 h-5" />
          <span>My Streaks</span>
        </h3>
        <button
          onClick={() => setViewMode(viewMode === 'heatmap' ? 'list' : 'heatmap')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {viewMode === 'heatmap' ? 'List View' : 'Heatmap'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {streaks.map((streak) => (
          <div
            key={streak.type}
            className={`text-center p-3 rounded-xl border ${
              streak.type === 'login'
                ? 'bg-gradient-to-br from-red-50 to-orange-50 border-red-100'
                : streak.type === 'study'
                  ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100'
            }`}
          >
            <div className="flex justify-center mb-1">{getStreakIcon(streak.type)}</div>
            <div className="text-2xl font-bold text-gray-900">{streak.days}</div>
            <div className="text-xs text-gray-600">{streak.name}</div>
          </div>
        ))}
      </div>

      {viewMode === 'heatmap' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Last 30 Days</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Less</span>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gray-200 rounded"></div>
                <div className="w-3 h-3 bg-green-200 rounded"></div>
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <div className="w-3 h-3 bg-green-600 rounded"></div>
              </div>
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {heatmap.map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded ${getActivityColor(day.activity)}`}
                title={`${day.date}: ${day.count} activities`}
              />
            ))}
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div className="space-y-2">
          {streaks.map((streak) => (
            <div
              key={streak.type}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{streak.icon}</span>
                <span className="text-sm font-medium text-gray-900">{streak.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">{streak.days}</span>
                <span className="text-xs text-gray-500">days</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loginStreak > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
          <p className="text-sm text-gray-700 text-center">
            🔥 <strong>Don't break the chain!</strong> You're on a {loginStreak}-day streak!
          </p>
        </div>
      )}
    </div>
  );
};
