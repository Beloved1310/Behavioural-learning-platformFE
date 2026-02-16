import React, { useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  Flame,
  Trophy,
  Calendar,
  BarChart3,
  BookOpen,
  Target,
  Star,
  Rocket,
  GraduationCap,
  Brain,
  BookMarked,
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'confirmed' | 'pending';
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

    const recentSessions = sessions.filter((session) => new Date(session.startTime) >= oneWeekAgo);

    const thisWeekSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= oneWeekAgo && sessionDate <= now;
    });

    const thisMonthSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= oneMonthAgo && sessionDate <= now;
    });

    const completedSessions = sessions.filter((s) => s.status === 'completed');
    const missedSessions = sessions.filter((s) => s.status === 'missed');
    const scheduledSessions = sessions.filter(
      (s) => s.status === 'scheduled' && new Date(s.startTime) > now
    );

    const totalStudyTime = completedSessions.reduce((total, session) => {
      if (!session.startTime || !session.endTime) return total;
      const start = new Date(session.startTime);
      const end = new Date(session.endTime);
      const timeDiff = end.getTime() - start.getTime();
      if (isNaN(timeDiff) || timeDiff < 0) return total;
      return total + timeDiff / (1000 * 60); // minutes
    }, 0);

    const thisWeekStudyTime = thisWeekSessions
      .filter((s) => s.status === 'completed')
      .reduce((total, session) => {
        if (!session.startTime || !session.endTime) return total;
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const timeDiff = end.getTime() - start.getTime();
        if (isNaN(timeDiff) || timeDiff < 0) return total;
        return total + timeDiff / (1000 * 60);
      }, 0);

    // Calculate completion rate, avoiding division by zero
    const totalCompletedOrMissed = completedSessions.length + missedSessions.length;
    const completionRate =
      totalCompletedOrMissed > 0
        ? Math.round((completedSessions.length / totalCompletedOrMissed) * 100)
        : 0;

    const streakData = calculateStreak(sessions);

    const subjectBreakdown = completedSessions.reduce(
      (breakdown, session) => {
        const subject = session.subject;
        breakdown[subject] = (breakdown[subject] || 0) + 1;
        return breakdown;
      },
      {} as Record<string, number>
    );

    const typeBreakdown = completedSessions.reduce(
      (breakdown, session) => {
        const type = session.type;
        breakdown[type] = (breakdown[type] || 0) + 1;
        return breakdown;
      },
      {} as Record<string, number>
    );

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
      thisMonthSessions: thisMonthSessions.length,
    };
  }, [sessions]);

  function calculateStreak(sessions: Session[]) {
    const completedSessions = sessions
      .filter((s) => s.status === 'completed')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Get unique dates
    const uniqueDates = [
      ...new Set(completedSessions.map((s) => new Date(s.startTime).toDateString())),
    ];

    // Calculate current streak
    const today = new Date().toDateString();
    let currentDate = new Date();

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
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

  const getSubjectIcon = (subject: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
      math: { icon: <Target className="w-5 h-5" />, color: 'text-blue-600' },
      reading: { icon: <BookOpen className="w-5 h-5" />, color: 'text-green-600' },
      science: { icon: <Brain className="w-5 h-5" />, color: 'text-purple-600' },
      history: { icon: <BookMarked className="w-5 h-5" />, color: 'text-orange-600' },
      art: { icon: <Star className="w-5 h-5" />, color: 'text-pink-600' },
      music: { icon: <Star className="w-5 h-5" />, color: 'text-yellow-600' },
      general: { icon: <BookOpen className="w-5 h-5" />, color: 'text-gray-600' },
    };
    return iconMap[subject.toLowerCase()] || iconMap['general'];
  };

  const getTypeIcon = (type: string) => {
    const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
      study: { icon: <BookOpen className="w-6 h-6" />, color: 'text-blue-600' },
      tutoring: { icon: <GraduationCap className="w-6 h-6" />, color: 'text-purple-600' },
      quiz: { icon: <Brain className="w-6 h-6" />, color: 'text-green-600' },
      reading: { icon: <BookOpen className="w-6 h-6" />, color: 'text-orange-600' },
    };
    return iconMap[type] || { icon: <BookOpen className="w-6 h-6" />, color: 'text-gray-600' };
  };

  return (
    <>
      <style>{`
        @keyframes clockSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes checkBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.2) translateY(-3px); }
        }
        @keyframes flameFlicker {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          25% { transform: scale(1.1); filter: brightness(1.3); }
          50% { transform: scale(0.95); filter: brightness(0.9); }
          75% { transform: scale(1.05); filter: brightness(1.2); }
        }
        @keyframes chartGrow {
          0%, 100% { transform: scaleY(1) translateY(0); }
          50% { transform: scaleY(1.2) translateY(-3px); }
        }
        @keyframes starTwinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
          75% { transform: scale(1.15) rotate(270deg); opacity: 0.9; }
        }
        @keyframes rocketLaunch {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
      `}</style>
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
                  +{Math.floor(stats.thisWeekStudyTime / 60)}h {stats.thisWeekStudyTime % 60}m this
                  week
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
              <Clock
                className="w-6 h-6 text-white animate-clockSpin"
                style={{ animation: 'clockSpin 3s linear infinite' }}
              />
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
              <CheckCircle2
                className="w-6 h-6 text-white animate-checkBounce"
                style={{ animation: 'checkBounce 2s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Current Streak</p>
              <p className="text-3xl font-bold text-purple-900">
                {stats.currentStreak}
                <span className="text-lg text-gray-500 ml-1">days</span>
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <Trophy className="w-3 h-3" />
                  Best: {stats.bestStreak} days
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Flame
                className="w-6 h-6 text-white animate-flameFlicker"
                style={{ animation: 'flameFlicker 1.5s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-purple-900">
                {isNaN(stats.completionRate) ? 0 : stats.completionRate}%
              </p>
              <div className="flex items-center mt-2">
                <span className="text-xs text-pink-600 font-medium bg-pink-50 px-2 py-1 rounded-full flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {stats.scheduledSessions} upcoming
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <BarChart3
                className="w-6 h-6 text-white animate-chartGrow"
                style={{ animation: 'chartGrow 2s ease-in-out infinite' }}
              />
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-900" />
            Learning Subjects
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.subjectBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([subject, count]) => {
                const subjectIcon = getSubjectIcon(subject);
                return (
                  <div key={subject} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={subjectIcon.color}>{subjectIcon.icon}</span>
                      <span className="font-medium text-purple-900 capitalize">{subject}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.subjectBreakdown))) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-amber-600 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Session Types */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2">
          <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-900 animate-pulse" />
            Learning Types
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.typeBreakdown).map(([type, count]) => {
              const typeIcon = getTypeIcon(type);
              return (
                <div
                  key={type}
                  className="text-center p-3 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl"
                >
                  <div className={`flex justify-center mb-2 ${typeIcon.color}`}>
                    {typeIcon.icon}
                  </div>
                  <div className="font-bold text-lg text-purple-900">{count}</div>
                  <div className="text-xs text-amber-600 capitalize font-medium">
                    {type} Sessions
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white shadow-lg sm:col-span-full">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
                This Week's Amazing Progress!
                <Star
                  className="w-5 h-5 animate-starTwinkle"
                  style={{ animation: 'starTwinkle 2s ease-in-out infinite' }}
                />
              </h3>
              <p className="text-purple-100">Keep up the fantastic work!</p>
            </div>
            <div className="opacity-80">
              <Rocket
                className="w-10 h-10 animate-rocketLaunch"
                style={{ animation: 'rocketLaunch 2s ease-in-out infinite' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.thisWeekSessions}</div>
              <div className="text-xs text-purple-200">Sessions This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.floor(stats.thisWeekStudyTime / 60)}h {stats.thisWeekStudyTime % 60}m
              </div>
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
              <div className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Amazing Streak Champion!
              </div>
              <div className="text-sm text-purple-100">
                You've been learning for {stats.currentStreak} days straight! You're incredible!
              </div>
            </div>
          )}

          {stats.completionRate >= 90 && (
            <div className="mt-4 p-3 bg-white bg-opacity-20 rounded-lg text-center">
              <div className="text-lg font-bold mb-1 flex items-center justify-center gap-2">
                <Star
                  className="w-5 h-5 animate-starTwinkle"
                  style={{ animation: 'starTwinkle 2s ease-in-out infinite' }}
                />
                Super Achiever!
              </div>
              <div className="text-sm text-purple-100">
                {stats.completionRate}% completion rate! You're doing amazingly well!
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
