import React, { useState, useEffect } from 'react';
import { useParentalDashboard } from '../../store/analyticsStore';
import { useAuthStore } from '../../store/authStore';
import { ParentalDashboard as ParentalDashboardType, ChildOverview, ParentAlert } from '../../types';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  BookOpen,
  Trophy,
  AlertCircle,
  DollarSign,
  Calendar,
  Star,
  Target,
  Activity,
  Bell,
  CheckCircle,
  Eye,
  MessageSquare,
  User,
  Award,
  ArrowRight
} from 'lucide-react';

export const ParentalDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { parentalDashboard, fetchParentalDashboard, markAlertAsRead } = useParentalDashboard();
  const [selectedChild, setSelectedChild] = useState<ChildOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      await fetchParentalDashboard(user.id);
      // Select first child by default
      if (parentalDashboard?.children.length) {
        setSelectedChild(parentalDashboard.children[0]);
      }
    } catch (error) {
      console.error('Failed to load parental dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: ParentAlert['type']) => {
    switch (type) {
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'low_performance':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'missed_session':
        return <Calendar className="h-5 w-5 text-orange-500" />;
      case 'spending_limit':
        return <DollarSign className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (severity: ParentAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quiz_completed':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'session_attended':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'achievement_earned':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'payment_made':
        return <DollarSign className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleAlertAction = async (alert: ParentAlert) => {
    await markAlertAsRead(alert.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!parentalDashboard) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Dashboard Data Available</h3>
        <p className="text-gray-600 mb-6">Unable to load your family's progress data at this time.</p>
        <button
          onClick={loadDashboard}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Reload Dashboard
        </button>
      </div>
    );
  }

  const unreadAlerts = parentalDashboard.alerts.filter(alert => !alert.isRead);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Family Learning Dashboard
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Monitor your children's learning progress and achievements
          </p>
        </div>

        {unreadAlerts.length > 0 && (
          <div className="flex items-center px-3 py-2 bg-red-100 text-red-800 rounded-lg">
            <Bell className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">{unreadAlerts.length} new alert{unreadAlerts.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Family Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Study Hours</p>
              <p className="text-2xl font-bold text-gray-900">{parentalDashboard.familyStats.totalStudyHours}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Quizzes Completed</p>
              <p className="text-2xl font-bold text-gray-900">{parentalDashboard.familyStats.totalQuizzesCompleted}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900">{parentalDashboard.familyStats.averageProgress}%</p>
            </div>
            <Target className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${parentalDashboard.familyStats.totalSpent}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
      </div>

      {/* Children Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Children's Progress
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {parentalDashboard.children.map((child) => (
            <div
              key={child.studentId}
              className={`bg-white border rounded-lg p-4 sm:p-6 cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedChild?.studentId === child.studentId ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
              onClick={() => setSelectedChild(child)}
            >
              <div className="flex items-center space-x-4 mb-4">
                {child.profileImage ? (
                  <img
                    src={child.profileImage}
                    alt={child.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900">{child.name}</h4>
                  <p className="text-sm text-gray-500">Age {child.age} • {child.grade}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <div className="flex items-center">
                    {getTrendIcon(child.currentProgress.recentTrend)}
                    <span className="ml-1 text-sm font-medium">{child.currentProgress.overallProgress}%</span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${child.currentProgress.overallProgress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Strongest</p>
                    <p className="font-medium text-green-600">{child.currentProgress.strongestSubject}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Needs Work</p>
                    <p className="font-medium text-orange-600">{child.currentProgress.weakestSubject}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{child.weeklyStats.hoursStudied}h</p>
                      <p className="text-gray-500">This week</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{child.weeklyStats.streakDays}</p>
                      <p className="text-gray-500">Day streak</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Child Details */}
      {selectedChild && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedChild.name}'s Detailed Progress
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Stats */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">This Week's Activity</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xl font-bold text-blue-600">{selectedChild.weeklyStats.hoursStudied}</p>
                  <p className="text-sm text-blue-800">Hours Studied</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xl font-bold text-green-600">{selectedChild.weeklyStats.quizzesCompleted}</p>
                  <p className="text-sm text-green-800">Quizzes Completed</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xl font-bold text-purple-600">{selectedChild.weeklyStats.averageScore}%</p>
                  <p className="text-sm text-purple-800">Average Score</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xl font-bold text-orange-600">{selectedChild.weeklyStats.streakDays}</p>
                  <p className="text-sm text-orange-800">Study Streak</p>
                </div>
              </div>
            </div>

            {/* Achievements and Concerns */}
            <div className="space-y-4">
              {/* Recent Achievements */}
              {selectedChild.recentAchievements.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recent Achievements</h4>
                  <div className="space-y-2">
                    {selectedChild.recentAchievements.slice(0, 2).map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-lg">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                          <p className="text-xs text-yellow-600">+{achievement.pointsEarned} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas of Concern */}
              {selectedChild.concerns.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Areas of Concern</h4>
                  <div className="space-y-2">
                    {selectedChild.concerns.map((concern, index) => (
                      <div key={index} className="flex items-start space-x-3 p-2 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">{concern}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Session */}
              {selectedChild.nextSession && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Next Session</h4>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-medium text-green-900">{selectedChild.nextSession.subject}</p>
                    <p className="text-xs text-green-700">
                      with {selectedChild.nextSession.tutorName}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {new Date(selectedChild.nextSession.scheduledTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alerts & Notifications
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {parentalDashboard.alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No new alerts</p>
              </div>
            ) : (
              parentalDashboard.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`border rounded-lg p-3 ${getAlertColor(alert.severity)} ${
                    !alert.isRead ? 'ring-2 ring-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{alert.title}</h4>
                      <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {alert.studentName} • {new Date(alert.createdAt).toLocaleDateString()}
                        </p>
                        {!alert.isRead && (
                          <button
                            onClick={() => handleAlertAction(alert)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {parentalDashboard.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-100 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {activity.studentName} • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    {activity.metadata?.score && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {activity.metadata.score}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Report Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Report Summary - {parentalDashboard.monthlyReport.month} {parentalDashboard.monthlyReport.year}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Family Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Study Hours</span>
                <span className="font-medium">{parentalDashboard.monthlyReport.summary.totalHoursStudied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quizzes Completed</span>
                <span className="font-medium">{parentalDashboard.monthlyReport.summary.totalQuizzesCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Progress</span>
                <span className="font-medium">{parentalDashboard.monthlyReport.summary.averageFamilyProgress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spending</span>
                <span className="font-medium">${parentalDashboard.monthlyReport.summary.totalSpending}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <div className="space-y-2">
              {parentalDashboard.monthlyReport.recommendations.slice(0, 3).map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};