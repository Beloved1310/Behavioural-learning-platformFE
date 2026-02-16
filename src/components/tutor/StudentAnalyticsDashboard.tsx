import React, { useState, useEffect } from 'react';
import { tutorStudentsService } from '../../services/tutorStudentsService';
import { sessionService } from '../../services/sessionService';
import { BarChart3, TrendingUp, Calendar, Target, CheckCircle2, Flame } from 'lucide-react';

interface StudentAnalyticsDashboardProps {
  studentId: string;
}

interface AnalyticsData {
  streak: number;
  goalProgress: number;
  consistencyScore: number;
  totalSessions: number;
  completedSessions: number;
  totalStudyHours: number;
  commitmentsCompleted: number;
  commitmentsTotal: number;
  weeklyProgress: {
    week: string;
    sessions: number;
    studyHours: number;
    goalsCompleted: number;
  }[];
}

export const StudentAnalyticsDashboard: React.FC<StudentAnalyticsDashboardProps> = ({
  studentId,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [studentId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load student progress
      const result = await tutorStudentsService.getAllStudentsProgress();
      const students = result.students || [];
      const student = students.find((s) => s.id === studentId);

      // Load sessions
      const sessionsResult = await sessionService.getSessions();
      const allSessions = sessionsResult.sessions || [];
      const studentSessions = allSessions.filter((s) => s.userId === studentId);
      const completedSessions = studentSessions.filter((s) => s.status === 'completed');
      const totalStudyHours = completedSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;

      // Calculate weekly progress (last 4 weeks)
      const weeklyProgress = calculateWeeklyProgress(studentSessions);

      if (student) {
        setAnalytics({
          streak: student.streak,
          goalProgress: student.goalProgress,
          consistencyScore: student.consistencyScore,
          totalSessions: studentSessions.length,
          completedSessions: completedSessions.length,
          totalStudyHours: Math.round(totalStudyHours * 10) / 10,
          commitmentsCompleted: student.commitmentsCompleted,
          commitmentsTotal: student.commitmentsTotal,
          weeklyProgress,
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyProgress = (sessions: any[]) => {
    const weeks: {
      [key: string]: { sessions: number; studyHours: number; goalsCompleted: number };
    } = {};
    const now = new Date();

    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekKey = `Week ${4 - i}`;
      const weekSessions = sessions.filter((s) => {
        const sessionDate = new Date(s.startTime);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });

      weeks[weekKey] = {
        sessions: weekSessions.length,
        studyHours:
          Math.round((weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60) * 10) / 10,
        goalsCompleted: 0, // Would need goal data
      };
    }

    return Object.entries(weeks).map(([week, data]) => ({ week, ...data }));
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const sessionCompletionRate =
    analytics.totalSessions > 0
      ? Math.round((analytics.completedSessions / analytics.totalSessions) * 100)
      : 0;

  const commitmentCompletionRate =
    analytics.commitmentsTotal > 0
      ? Math.round((analytics.commitmentsCompleted / analytics.commitmentsTotal) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-700">Total Study Hours</p>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">{analytics.totalStudyHours}h</p>
          <p className="text-xs text-blue-600 mt-1">
            {analytics.completedSessions} sessions completed
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-700">Session Completion</p>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{sessionCompletionRate}%</p>
          <p className="text-xs text-green-600 mt-1">
            {analytics.completedSessions} of {analytics.totalSessions} sessions
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-700">Commitment Rate</p>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">{commitmentCompletionRate}%</p>
          <p className="text-xs text-purple-600 mt-1">
            {analytics.commitmentsCompleted} of {analytics.commitmentsTotal} commitments
          </p>
        </div>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Weekly Progress (Last 4 Weeks)</span>
          </h3>
          <div className="space-y-4">
            {analytics.weeklyProgress.map((week, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{week.week}</span>
                  <span className="text-sm text-gray-600">{week.sessions} sessions</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (week.sessions / 5) * 100)}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>{week.studyHours}h studied</span>
                  <span>{week.goalsCompleted} goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Performance Metrics</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>Current Streak</span>
                </span>
                <span className="text-lg font-bold text-gray-900">{analytics.streak} days</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (analytics.streak / 30) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span>Goal Progress</span>
                </span>
                <span className="text-lg font-bold text-gray-900">{analytics.goalProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${analytics.goalProgress}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span>Consistency Score</span>
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {analytics.consistencyScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analytics.consistencyScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
