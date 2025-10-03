import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../../types';
import { useGamificationStore } from '../../store/gamificationStore';

interface LeaderboardProps {
  timeframe?: 'week' | 'month' | 'all';
  showCurrentUser?: boolean;
  maxEntries?: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  timeframe = 'all',
  showCurrentUser = true,
  maxEntries = 10
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const { leaderboard, loadLeaderboard, isLoading } = useGamificationStore();

  useEffect(() => {
    loadLeaderboard(selectedTimeframe);
  }, [selectedTimeframe, loadLeaderboard]);

  const currentUserId = '1'; // This would come from auth context
  const displayedEntries = leaderboard.slice(0, maxEntries);
  const currentUserEntry = leaderboard.find(entry => entry.userId === currentUserId);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return '🎓';
      case 'TUTOR':
        return '👨‍🏫';
      case 'PARENT':
        return '👨‍👩‍👧‍👦';
      default:
        return '👤';
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) {
      return `${(score / 1000000).toFixed(1)}M`;
    }
    if (score >= 1000) {
      return `${(score / 1000).toFixed(1)}K`;
    }
    return score.toString();
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🏆 Leaderboard</h3>
        
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['week', 'month', 'all'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period as any)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                selectedTimeframe === period
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {displayedEntries.map((entry, index) => {
          const isCurrentUser = entry.userId === currentUserId;
          
          return (
            <div
              key={entry.id}
              className={`flex items-center p-4 rounded-lg transition-colors ${
                isCurrentUser 
                  ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {/* Rank */}
              <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-sm border-2 ${getRankColor(entry.rank)}`}>
                {getRankIcon(entry.rank)}
              </div>

              {/* User Info */}
              <div className="flex-1 ml-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {isCurrentUser ? 'You' : entry.userName}
                  </span>
                  <span className="text-sm">{getRoleIcon(entry.userRole)}</span>
                  {isCurrentUser && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      You
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <span>{entry.totalQuizzes} quizzes</span>
                  <span>{entry.averageScore}% avg</span>
                  <span className="flex items-center">
                    🔥 {entry.currentStreak}
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-lg text-purple-600">
                  {formatScore(entry.totalPoints)}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>

              {/* Badges */}
              <div className="ml-4 flex -space-x-1">
                {entry.badges.slice(0, 3).map((badge, badgeIndex) => (
                  <div
                    key={badge.id}
                    className="w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-xs"
                    title={badge.badge.name}
                  >
                    {badge.badge.icon}
                  </div>
                ))}
                {entry.badges.length > 3 && (
                  <div className="w-6 h-6 bg-gray-100 border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                    +{entry.badges.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current User Position (if not in top entries) */}
      {showCurrentUser && currentUserEntry && !displayedEntries.some(e => e.userId === currentUserId) && (
        <>
          <div className="my-4 border-t border-gray-200"></div>
          <div className="text-center text-sm text-gray-500 mb-2">Your Position</div>
          
          <div className="flex items-center p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
            <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-sm border-2 ${getRankColor(currentUserEntry.rank)}`}>
              #{currentUserEntry.rank}
            </div>

            <div className="flex-1 ml-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900">You</span>
                <span className="text-sm">{getRoleIcon(currentUserEntry.userRole)}</span>
              </div>
              
              <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                <span>{currentUserEntry.totalQuizzes} quizzes</span>
                <span>{currentUserEntry.averageScore}% avg</span>
                <span className="flex items-center">
                  🔥 {currentUserEntry.currentStreak}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-lg text-purple-600">
                {formatScore(currentUserEntry.totalPoints)}
              </div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {leaderboard.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🏆</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Rankings Yet</h4>
          <p className="text-gray-600">Complete some quizzes to appear on the leaderboard!</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Rankings are updated in real-time. Keep learning to climb the leaderboard! 📚
        </p>
      </div>
    </div>
  );
};