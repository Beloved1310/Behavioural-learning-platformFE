import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { DashboardStats, Activity, UpcomingSession, Badge, ProgressData, QuickAction } from '../types';
import { DashboardLayout } from '../components/layout';
import { MotivationalSystem } from '../components/behavioral/MotivationalSystem';
import { useBehavioralTracking } from '../hooks/useBehavioralTracking';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { trackCustomEvent } = useBehavioralTracking(user?.id || '');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      title: 'Start Learning Adventure',
      description: 'Begin your fun learning journey today!',
      icon: '🚀',
      route: '/study',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Play Learning Games',
      description: 'Test your skills with fun quizzes!',
      icon: '🎮',
      route: '/quiz',
      color: 'green'
    },
    {
      id: '3',
      title: 'Chat with Helper',
      description: 'Get help from awesome tutors!',
      icon: '🤖',
      route: '/tutors',
      color: 'purple'
    },
    {
      id: '4',
      title: 'See My Progress',
      description: 'Check how amazing you\'re doing!',
      icon: '⭐',
      route: '/progress',
      color: 'orange'
    }
  ]);

  useEffect(() => {
    // Track dashboard visit
    trackCustomEvent('dashboard_visit', { timestamp: new Date() });

    // Mock data - replace with real API calls later
    setDashboardStats({
      totalStudyHours: 24.5,
      completedSessions: 12,
      currentStreak: 7,
      nextSession: '2024-01-15T14:00:00Z'
    });

    setRecentActivities([
      {
        id: '1',
        type: 'quiz_completed',
        title: 'Awesome Addition Quest Complete!',
        description: 'Amazing job! You got 9 out of 10 addition problems right! 🎉',
        timestamp: '2024-01-14T10:30:00Z',
        points: 50
      },
      {
        id: '2',
        type: 'badge_earned',
        title: 'Reading Rockstar Badge',
        description: 'You read for 7 days in a row! Keep it up, superstar! 🌟',
        timestamp: '2024-01-14T09:00:00Z',
        badgeIcon: '🏆'
      },
      {
        id: '3',
        type: 'session_attended',
        title: 'Fun Science Discovery',
        description: 'Learned about dinosaurs with Teacher Sarah! 🦕',
        timestamp: '2024-01-13T16:00:00Z',
        points: 75
      },
      {
        id: '4',
        type: 'milestone_reached',
        title: 'Creative Writing Milestone',
        description: 'Wrote your first amazing story about space adventures! 🚀',
        timestamp: '2024-01-13T14:30:00Z',
        points: 100
      }
    ]);

    setUpcomingSessions([
      {
        id: '1',
        title: 'Fun with Fractions! 🍕',
        subject: 'Fun with Numbers',
        tutor: 'Teacher Emma',
        scheduledTime: '2024-01-15T14:00:00Z',
        duration: 45,
        type: 'tutoring',
        status: 'confirmed'
      },
      {
        id: '2',
        title: 'Amazing Animals Reading 🐾',
        subject: 'Reading Adventures',
        scheduledTime: '2024-01-15T16:30:00Z',
        duration: 30,
        type: 'self_study',
        status: 'scheduled'
      },
      {
        id: '3',
        title: 'Cool Chemistry Experiments 🧪',
        subject: 'Science Explorers',
        tutor: 'Teacher Mike',
        scheduledTime: '2024-01-16T10:00:00Z',
        duration: 40,
        type: 'tutoring',
        status: 'confirmed'
      },
      {
        id: '4',
        title: 'World Explorer Quiz 🗺️',
        subject: 'World Discoveries',
        scheduledTime: '2024-01-16T15:00:00Z',
        duration: 25,
        type: 'quiz',
        status: 'pending'
      },
      {
        id: '5',
        title: 'Draw Your Superhero 🎨',
        subject: 'Creative Arts',
        tutor: 'Teacher Luna',
        scheduledTime: '2024-01-17T11:00:00Z',
        duration: 50,
        type: 'tutoring',
        status: 'scheduled'
      }
    ]);

    setBadges([
      {
        id: '1',
        name: 'Learning Superhero! 🦸‍♂️',
        description: 'Started your awesome learning adventure!',
        icon: '🌟',
        category: 'achievement',
        earnedAt: '2024-01-10T12:00:00Z'
      },
      {
        id: '2',
        name: 'Quiz Champion! 🏆',
        description: 'Amazing! You aced 5 fun quizzes in a row!',
        icon: '👑',
        category: 'achievement',
        earnedAt: '2024-01-12T15:30:00Z'
      },
      {
        id: '3',
        name: 'Morning Star! ⭐',
        description: 'Wow! You love learning so much, you start early!',
        icon: '🌅',
        category: 'time',
        earnedAt: '2024-01-14T07:45:00Z'
      },
      {
        id: '4',
        name: 'Reading Rocket! 🚀',
        description: 'You read 10 amazing stories! Keep exploring!',
        icon: '📚',
        category: 'achievement',
        earnedAt: '2024-01-13T16:20:00Z'
      },
      {
        id: '5',
        name: 'Math Wizard! 🧙‍♂️',
        description: 'You solved 50 number puzzles like magic!',
        icon: '🔮',
        category: 'achievement',
        earnedAt: '2024-01-11T14:15:00Z'
      },
      {
        id: '6',
        name: 'Science Explorer! 🔬',
        description: 'You discovered 3 cool science facts!',
        icon: '🧪',
        category: 'discovery',
        earnedAt: '2024-01-09T10:30:00Z'
      }
    ]);

    setProgressData([
      { subject: 'Fun with Numbers 🔢', current: 75, target: 100, percentage: 75, trend: 'up' },
      { subject: 'Reading Adventures 📖', current: 88, target: 100, percentage: 88, trend: 'up' },
      { subject: 'Science Explorers 🔬', current: 65, target: 80, percentage: 81, trend: 'up' },
      { subject: 'World Discoveries 🌍', current: 42, target: 60, percentage: 70, trend: 'stable' },
      { subject: 'Creative Arts 🎨', current: 55, target: 70, percentage: 79, trend: 'up' },
      { subject: 'Music & Sounds 🎵', current: 30, target: 50, percentage: 60, trend: 'down' }
    ]);
  }, []);


  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quiz_completed': return '🧠';
      case 'session_attended': return '📚';
      case 'badge_earned': return '🏆';
      case 'milestone_reached': return '🎯';
      default: return '✅';
    }
  };

  const getStatusColor = (status: UpcomingSession['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionColor = (color: QuickAction['color']) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 hover:bg-blue-600';
      case 'green': return 'bg-green-500 hover:bg-green-600';
      case 'purple': return 'bg-purple-500 hover:bg-purple-600';
      case 'orange': return 'bg-orange-500 hover:bg-orange-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fadeIn">
        {/* Welcome Header with better visual hierarchy */}
        <div className="mb-8 sm:mb-10">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-base sm:text-lg text-amber-700 mb-4">
                  Ready for another awesome learning adventure? Let's have some fun! 🎉
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    🎯 Super Learner Mode
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    🔥 {dashboardStats?.currentStreak || 0} Day Adventure Streak!
                  </span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl text-white">🚀</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational System */}
        <MotivationalSystem maxPrompts={2} className="mb-6" />

        {/* Enhanced Stats Overview */}
        {dashboardStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Learning Hours</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalStudyHours}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                      +2.5 this week
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">⏱️</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Adventures Done</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats.completedSessions}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                      3 this week
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">✅</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Amazing Streak</p>
                  <p className="text-3xl font-bold text-gray-900">{dashboardStats.currentStreak}<span className="text-lg text-gray-500 ml-1">days</span></p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-full">
                      🏆 Personal best!
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">🔥</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-600 mb-1">Next Adventure</p>
                  <p className="text-xl font-bold text-gray-900">
                    {dashboardStats.nextSession ? formatTime(dashboardStats.nextSession) : 'Not scheduled'}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-full">
                      🍕 Fun with Fractions!
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl text-white">📅</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid grid gap-6 lg:gap-8 transition-sidebar">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900">Fun Learning Adventures</h3>
                <span className="text-sm text-amber-600">Pick your next amazing activity!</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                      key={action.id}
                      className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-left hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
                      onClick={() => {
                        if (action.route === '/quiz') {
                          navigate('/gamification');
                        } else {
                          console.log(`Navigate to ${action.route}`);
                        }
                      }}
                    >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getActionColor(action.color)} group-hover:scale-110 transition-transform duration-200`}>
                        <span className="text-xl text-white">{action.icon}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

              {/* Enhanced Progress Overview */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900">Your Amazing Progress! 📈</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  View All →
                </button>
              </div>
              <div className="space-y-6">
                {progressData.map((progress) => (
                  <div key={progress.subject} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-base font-semibold text-gray-900">{progress.subject}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600">
                          {progress.current}/{progress.target}
                        </span>
                        <div className="flex items-center space-x-1">
                          {progress.trend === 'up' && <span className="text-green-500">📈</span>}
                          {progress.trend === 'down' && <span className="text-red-500">📉</span>}
                          {progress.trend === 'stable' && <span className="text-gray-500">➡️</span>}
                          <span className="text-xs font-medium text-gray-500">{progress.percentage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {/* Enhanced Recent Activities */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900">Look What You Did! 🎉</h3>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                  View All →
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="group flex items-start space-x-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-sm">
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                      <span className="text-lg">{activity.badgeIcon || getActivityIcon(activity.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {activity.title}
                        </h4>
                        <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-full">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 leading-relaxed">{activity.description}</p>
                      {activity.points && (
                        <div className="flex items-center">
                          <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full font-medium">
                            +{activity.points} XP earned
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Enhanced Upcoming Sessions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900">Coming Up Next! 🗓️</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  {upcomingSessions.length} fun activities!
                </span>
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="group bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-blue-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {session.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">{session.subject}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                    </div>
                    {session.tutor && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        <p className="text-xs text-gray-600 font-medium">{session.tutor}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <span>📅</span>
                        <span>{formatDate(session.scheduledTime)} at {formatTime(session.scheduledTime)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <span>⏱️</span>
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 bg-purple-50 hover:bg-purple-100 text-purple-700 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-sm border border-purple-100 hover:border-purple-200">
                See All My Adventures! →
              </button>
            </div>

            {/* Enhanced Badges */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-purple-900">Your Super Badges! 🏆</h3>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                  {badges.length} earned
                </span>
              </div>
              <div className="space-y-4">
                {badges.map((badge) => (
                  <div key={badge.id} className="group bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border border-yellow-100 hover:border-yellow-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <span className="text-xl">{badge.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">{badge.description}</p>
                        {badge.earnedAt && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-orange-600">🎉</span>
                            <span className="text-xs text-gray-500 font-medium">
                              Earned {formatDate(badge.earnedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-sm border border-yellow-100 hover:border-yellow-200">
                See All My Super Badges! →
              </button>
              </div>

            {/* Enhanced Study Reminder */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
              <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                      30 min left
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-2">You're Doing Amazing! 🌟</h3>
                <p className="text-sm text-white text-opacity-90 mb-4 leading-relaxed">
                  Wow! You only need 30 more minutes to complete today's learning adventure. You're such a superstar!
                </p>
                <div className="bg-white bg-opacity-20 rounded-full h-2 mb-4">
                  <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <button className="w-full bg-white text-purple-600 py-3 px-4 rounded-xl font-semibold text-sm hover:bg-opacity-90 transition-all duration-200 hover:shadow-md">
                  Let's Keep Learning! 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};