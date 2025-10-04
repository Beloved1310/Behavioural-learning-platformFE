import React, { useMemo } from 'react';

interface Session {
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  isRecurring?: boolean;
}

interface SessionStatsProps {
  sessions: Session[];
}

export const SessionStats: React.FC<SessionStatsProps> = ({ sessions }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentSessions = sessions.filter(session =>
      new Date(session.startTime) >= oneWeekAgo
    );

    const thisWeekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= oneWeekAgo && sessionDate <= now;
    });

    const thisMonthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= oneMonthAgo && sessionDate <= now;
    });

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const missedSessions = sessions.filter(s => s.status === 'missed');
    const scheduledSessions = sessions.filter(s =>
      s.status === 'scheduled' && new Date(s.startTime) > now
    );

    const totalStudyTime = completedSessions.reduce((total, session) => {
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      return total + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }, 0);

    const thisWeekStudyTime = thisWeekSessions
      .filter(s => s.status === 'completed')
      .reduce((total, session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        return total + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);

    const completionRate = sessions.length > 0
      ? Math.round((completedSessions.length / (completedSessions.length + missedSessions.length)) * 100)
      : 0;

    const streakData = calculateStreak(sessions);

    const subjectBreakdown = completedSessions.reduce((breakdown, session) => {
      const subject = session.subject;
      breakdown[subject] = (breakdown[subject] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    const typeBreakdown = completedSessions.reduce((breakdown, session) => {
      const type = session.type;
      breakdown[type] = (breakdown[type] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      missedSessions: missedSessions.length,
      scheduledSessions: scheduledSessions.length,
      totalStudyTime: Math.round(totalStudyTime),
      thisWeekStudyTime: Math.round(thisWeekStudyTime),
      completionRate,
      currentStreak: streakData.currentStreak,
      bestStreak: streakData.bestStreak,
      subjectBreakdown,
      typeBreakdown,
      thisWeekSessions: thisWeekSessions.length,
      thisMonthSessions: thisMonthSessions.length
    };
  }, [sessions]);

  function calculateStreak(sessions: Session[]) {
    const completedSessions = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Get unique dates
    const uniqueDates = [...new Set(
      completedSessions.map(s => new Date(s.startTime).toDateString())
    )];

    // Calculate current streak
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateString = currentDate.toDateString();
      if (uniqueDates.includes(dateString)) {
        currentStreak++;
      } else {
        break;
      }
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Calculate best streak
    let consecutiveDays = 0;
    let lastDate = new Date(uniqueDates[0]);

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const timeDiff = lastDate.getTime() - currentDate.getTime();
      const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      if (dayDiff === 1) {
        consecutiveDays++;
      } else {
        bestStreak = Math.max(bestStreak, consecutiveDays + 1);
        consecutiveDays = 0;
      }

      lastDate = currentDate;
    }

    bestStreak = Math.max(bestStreak, consecutiveDays + 1);

    return { currentStreak, bestStreak };
  }

  const getSubjectEmoji = (subject: string) => {
    const emojiMap: Record<string, string> = {
      'math': '🔢',
      'reading': '📖',
      'science': '🔬',
      'history': '🌍',
      'art': '🎨',
      'music': '🎵',
      'general': '📚'
    };
    return emojiMap[subject] || '📚';
  };

  const getTypeEmoji = (type: string) => {
    const emojiMap: Record<string, string> = {
      'study': '📚',
      'tutoring': '👨‍🏫',
      'quiz': '🧠',
      'reading': '📖'
    };
    return emojiMap[type] || '📝';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Study Time */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">Total Learning Time</p>
            <p className="text-3xl font-bold text-purple-900">
              {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m
            </p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                +{Math.floor(stats.thisWeekStudyTime / 60)}h {stats.thisWeekStudyTime % 60}m this week
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-xl text-white">⏱️</span>
          </div>
        </div>
      </div>

      {/* Completed Sessions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">Adventures Completed</p>
            <p className="text-3xl font-bold text-purple-900">{stats.completedSessions}</p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                {stats.thisWeekSessions} this week
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
            <span className="text-xl text-white">✅</span>
          </div>
        </div>
      </div>

      {/* Current Streak */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-purple-900">{stats.currentStreak}<span className="text-lg text-gray-500 ml-1">days</span></p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                🏆 Best: {stats.bestStreak} days
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
            <span className="text-xl text-white">🔥</span>
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-purple-900">{stats.completionRate}%</p>
            <div className="flex items-center mt-2">
              <span className="text-xs text-pink-600 font-medium bg-pink-50 px-2 py-1 rounded-full">
                📅 {stats.scheduledSessions} upcoming
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-xl text-white">📊</span>
          </div>
        </div>
      </div>

      {/* Subject Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2">
        <h3 className="text-lg font-bold text-purple-900 mb-4">📚 Learning Subjects</h3>
        <div className="space-y-3">
          {Object.entries(stats.subjectBreakdown)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([subject, count]) => (
              <div key={subject} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{getSubjectEmoji(subject)}</span>
                  <span className="font-medium text-purple-900 capitalize">{subject}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      style={{
                        width: `${(count / Math.max(...Object.values(stats.subjectBreakdown))) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-amber-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Session Types */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2">
        <h3 className="text-lg font-bold text-purple-900 mb-4">🎯 Learning Types</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats.typeBreakdown).map(([type, count]) => (
            <div key={type} className="text-center p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl">
              <div className="text-2xl mb-2">{getTypeEmoji(type)}</div>
              <div className="font-bold text-lg text-purple-900">{count}</div>
              <div className="text-xs text-amber-600 capitalize font-medium">{type} Sessions</div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg sm:col-span-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold mb-1">This Week's Amazing Progress! 🌟</h3>
            <p className="text-purple-100">Keep up the fantastic work!</p>
          </div>
          <div className="text-4xl opacity-80">🚀</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.thisWeekSessions}</div>
            <div className="text-xs text-purple-200">Sessions This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.floor(stats.thisWeekStudyTime / 60)}h {stats.thisWeekStudyTime % 60}m</div>
            <div className="text-xs text-purple-200">Learning Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-xs text-purple-200">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.scheduledSessions}</div>
            <div className="text-xs text-purple-200">Coming Up</div>
          </div>
        </div>

        {stats.currentStreak >= 7 && (
          <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg text-center">
            <div className="text-lg font-bold mb-1">🏆 Amazing Streak Champion!</div>
            <div className="text-sm text-purple-100">
              You've been learning for {stats.currentStreak} days straight! You're incredible!
            </div>
          </div>
        )}

        {stats.completionRate >= 90 && (
          <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg text-center">
            <div className="text-lg font-bold mb-1">⭐ Super Achiever!</div>
            <div className="text-sm text-purple-100">
              {stats.completionRate}% completion rate! You're doing amazingly well!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};