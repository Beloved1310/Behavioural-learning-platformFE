import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  DashboardStats,
  Activity,
  UpcomingSession,
  Badge,
  ProgressData,
  QuickAction,
} from '../types';
import { DashboardLayout } from '../components/layout';
import { MotivationalSystem } from '../components/behavioral/MotivationalSystem';
import { useBehavioralTracking } from '../hooks/useBehavioralTracking';
import { getTimeBasedGreeting } from '../utils/greetings';
import { GoalProgressCard } from '../components/dashboard/GoalProgressCard';
import { WeeklyCommitmentCard } from '../components/dashboard/WeeklyCommitmentCard';
import { HabitStreakCard } from '../components/dashboard/HabitStreakCard';
import { MilestoneCard } from '../components/dashboard/MilestoneCard';
import { ReflectionCard } from '../components/dashboard/ReflectionCard';
import { WeeklyAssessmentModal } from '../components/dashboard/WeeklyAssessmentModal';
import { assessmentsService } from '../services/assessmentsService';
import { behavioralService } from '../services/behavioralService';
import { sessionService, Session } from '../services/sessionService';
import { gamificationService } from '../services/gamificationService';
import {
  Clock,
  CheckCircle2,
  Flame,
  Calendar,
  Star,
  Rocket,
  Gamepad2,
  Bot,
  Target,
  PartyPopper,
  Trophy,
  BookOpen,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { trackCustomEvent } = useBehavioralTracking(user?.id || '');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const timeGreeting = getTimeBasedGreeting();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [consistencyScore, setConsistencyScore] = useState<number>(0);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [weeklyChanges, setWeeklyChanges] = useState({
    studyHours: 0,
    sessions: 0,
  });
  const [isPersonalBest, setIsPersonalBest] = useState(false);
  const [nextSessionTitle, setNextSessionTitle] = useState<string | null>(null);
  const [todayStudyData, setTodayStudyData] = useState({
    completedMinutes: 0,
    dailyGoalMinutes: 60, // Default 60 minutes
    remainingMinutes: 60,
    progressPercent: 0,
  });

  const loadRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const activities: Activity[] = [];

      // Load quiz attempts
      try {
        const quizAttempts = await gamificationService.getRecentAttempts(5);
        quizAttempts.forEach((attempt: any) => {
          activities.push({
            id: attempt.id || attempt._id?.toString() || `quiz-${Date.now()}`,
            type: 'quiz_completed',
            title: attempt.quizTitle || attempt.quiz?.title || 'Quiz Completed',
            description: `Amazing job! You got ${attempt.score || 0}% on ${attempt.quizSubject || 'the quiz'}!`,
            timestamp: attempt.completedAt || attempt.createdAt || new Date().toISOString(),
            points: attempt.totalPoints || attempt.points || 0,
          });
        });
      } catch (error) {
        console.error('Failed to load quiz attempts:', error);
      }

      // Load recent badges (from profile)
      try {
        const profile = await gamificationService.getUserProfile();
        if (profile.badges && Array.isArray(profile.badges)) {
          // Get the most recent badges (already sorted by earnedAt desc)
          profile.badges.slice(0, 3).forEach((userBadge: any) => {
            const badge = userBadge.badge || userBadge;
            activities.push({
              id: userBadge.badgeId || badge.id || `badge-${Date.now()}`,
              type: 'badge_earned',
              title: `${badge.name || 'Badge'} Earned`,
              description: badge.description || 'You earned a new badge!',
              timestamp: userBadge.earnedAt || new Date().toISOString(),
              badgeIcon: badge.icon || '🏆',
            });
          });
        }
      } catch (error) {
        console.error('Failed to load badges for activities:', error);
      }

      // Load completed sessions
      try {
        const sessionsResponse = await sessionService.getSessions({
          status: 'completed',
          limit: 5,
        });
        const sessions = sessionsResponse.sessions || [];
        sessions.forEach((session: Session) => {
          const tutorName = session.tutor
            ? `${session.tutor.firstName || ''} ${session.tutor.lastName || ''}`.trim() || 'Tutor'
            : 'Tutor';

          activities.push({
            id: session.id,
            type: 'session_attended',
            title: session.title || 'Session Completed',
            description: session.tutorId
              ? `Learned ${session.subject || 'something new'} with ${tutorName}! 🦕`
              : `Completed ${session.subject || 'a session'}!`,
            timestamp: session.endTime || session.startTime || new Date().toISOString(),
            points: session.duration ? Math.round(session.duration / 10) : 0, // Approximate points based on duration
          });
        });
      } catch (error) {
        console.error('Failed to load sessions for activities:', error);
      }

      // Sort all activities by timestamp (most recent first)
      activities.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });

      // Limit to most recent 10 activities
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Failed to load recent activities:', error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);

      // Get session stats
      const sessionStats = await sessionService.getSessionStats();

      // Get user profile for streak
      const profile = await gamificationService.getUserProfile();

      // Get consistency score (includes streak)
      const consistencyData = await behavioralService.getConsistencyScore(30);

      // Calculate total study hours from session stats
      const totalStudyHours = sessionStats.totalStudyHours || 0;

      // Get completed sessions count
      const completedSessions = sessionStats.completedSessions || 0;

      // Get current streak (from profile or consistency data)
      const currentStreak = profile.streak?.currentStreak || consistencyData.streak || 0;

      // Get next session from upcomingSessions (already loaded)
      const nextSession =
        upcomingSessions.length > 0 ? upcomingSessions[0].scheduledTime : undefined;
      const nextTitle = upcomingSessions.length > 0 ? upcomingSessions[0].title : null;

      // Calculate weekly changes (this week vs last week)
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      thisWeekStart.setHours(0, 0, 0, 0);

      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);

      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekEnd.getDate() + 7);

      // Get sessions for this week and last week
      const [thisWeekResponse, lastWeekResponse] = await Promise.all([
        sessionService.getSessions({
          startDate: thisWeekStart.toISOString(),
          endDate: thisWeekEnd.toISOString(),
          status: 'completed',
        }),
        sessionService.getSessions({
          startDate: lastWeekStart.toISOString(),
          endDate: thisWeekStart.toISOString(),
          status: 'completed',
        }),
      ]);

      // Extract sessions arrays from response objects
      const thisWeekSessions = thisWeekResponse.sessions || [];
      const lastWeekSessions = lastWeekResponse.sessions || [];

      // Calculate this week's study hours
      const thisWeekHours = thisWeekSessions.reduce((total: number, session) => {
        return total + (session.duration || 0) / 60; // Convert minutes to hours
      }, 0);

      // Calculate last week's study hours
      const lastWeekHours = lastWeekSessions.reduce((total: number, session) => {
        return total + (session.duration || 0) / 60;
      }, 0);

      // Calculate this week's completed sessions
      const thisWeekCompleted = thisWeekSessions.length;
      const lastWeekCompleted = lastWeekSessions.length;

      // Calculate changes
      const studyHoursChange = thisWeekHours - lastWeekHours;
      const sessionsChange = thisWeekCompleted - lastWeekCompleted;

      setWeeklyChanges({
        studyHours: studyHoursChange,
        sessions: sessionsChange,
      });

      // Check if current streak is personal best (simplified - would need historical data)
      // For now, assume it's a personal best if streak > 5
      setIsPersonalBest(currentStreak > 5);

      // Set next session title
      setNextSessionTitle(nextTitle);

      // Set dashboard stats
      setDashboardStats({
        totalStudyHours: totalStudyHours,
        completedSessions: completedSessions,
        currentStreak: currentStreak,
        nextSession: nextSession,
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // Set default values on error
      setDashboardStats({
        totalStudyHours: 0,
        completedSessions: 0,
        currentStreak: 0,
        nextSession: undefined,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const loadProgressData = async () => {
    try {
      setLoadingProgress(true);
      const userProgress = await gamificationService.getProgress();

      // Transform UserProgress to ProgressData format
      const transformed: ProgressData[] = userProgress.map((progress: any) => {
        // Calculate percentage based on currentXP and nextLevelXP
        const totalXP = progress.currentXP + (progress.level - 1) * progress.nextLevelXP;
        const targetXP = progress.level * progress.nextLevelXP;
        const percentage = targetXP > 0 ? Math.round((totalXP / targetXP) * 100) : 0;

        // Determine trend (simplified - could be improved with historical data)
        // For now, we'll use a simple heuristic based on average score
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (progress.averageScore >= 80) {
          trend = 'up';
        } else if (progress.averageScore < 60) {
          trend = 'down';
        }

        // Get subject emoji/icon
        const subjectEmojis: { [key: string]: string } = {
          Math: '🔢',
          Mathematics: '🔢',
          Reading: '📖',
          Science: '🔬',
          Geography: '🌍',
          World: '🌍',
          Arts: '🎨',
          Music: '🎵',
          English: '📚',
          History: '📜',
          Language: '🗣️',
        };

        const subjectName = progress.subject || 'Subject';
        const emoji = Object.keys(subjectEmojis).find((key) =>
          subjectName.toLowerCase().includes(key.toLowerCase())
        )
          ? subjectEmojis[
              Object.keys(subjectEmojis).find((key) =>
                subjectName.toLowerCase().includes(key.toLowerCase())
              )!
            ]
          : '📚';

        return {
          subject: `${subjectName} ${emoji}`,
          current: Math.min(totalXP, targetXP),
          target: targetXP,
          percentage: Math.min(100, percentage),
          trend,
        };
      });

      // Sort by percentage (highest first) or by last activity
      transformed.sort((a, b) => b.percentage - a.percentage);

      setProgressData(transformed);
    } catch (error) {
      console.error('Failed to load progress data:', error);
      setProgressData([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  const loadUserBadges = async () => {
    try {
      setLoadingBadges(true);
      const profile = await gamificationService.getUserProfile();

      // Transform badges from profile to Dashboard Badge format
      if (profile.badges && Array.isArray(profile.badges)) {
        const transformedBadges: Badge[] = profile.badges.map((userBadge: any) => {
          const badge = userBadge.badge || userBadge;
          return {
            id: userBadge.badgeId || badge.id,
            name: badge.name || '',
            description: badge.description || '',
            icon: badge.icon || '🏆',
            category: badge.category || 'achievement',
            earnedAt: userBadge.earnedAt || new Date().toISOString(),
          };
        });

        // Sort by earnedAt (most recent first)
        transformedBadges.sort((a, b) => {
          const dateA = new Date(a.earnedAt || '').getTime();
          const dateB = new Date(b.earnedAt || '').getTime();
          return dateB - dateA;
        });

        setBadges(transformedBadges);
      } else {
        setBadges([]);
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
      setBadges([]);
    } finally {
      setLoadingBadges(false);
    }
  };

  const loadUpcomingSessions = async () => {
    try {
      setLoadingSessions(true);
      const now = new Date();
      const sessionsResponse = await sessionService.getSessions({
        limit: 20,
      });
      const sessions = sessionsResponse.sessions || [];

      // Filter upcoming sessions (future sessions) and transform to UpcomingSession format
      const upcoming = sessions
        .filter((session: Session) => {
          const sessionDate = new Date(session.startTime);
          return (
            sessionDate > now &&
            (session.status === 'scheduled' ||
              session.status === 'confirmed' ||
              session.status === 'pending')
          );
        })
        .sort(
          (a: Session, b: Session) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
        .slice(0, 5)
        .map((session: Session): UpcomingSession => {
          // Calculate duration from startTime and endTime, or use session.duration
          let duration = session.duration;
          if (!duration && session.endTime) {
            const start = new Date(session.startTime);
            const end = new Date(session.endTime);
            duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
          }

          // Map session type
          let mappedType: 'tutoring' | 'self_study' | 'quiz' = 'self_study';
          if (session.type === 'tutoring') {
            mappedType = 'tutoring';
          } else if (session.type === 'quiz') {
            mappedType = 'quiz';
          }

          // Map status
          let mappedStatus: 'scheduled' | 'confirmed' | 'pending' = 'scheduled';
          if (session.status === 'confirmed') {
            mappedStatus = 'confirmed';
          } else if (session.status === 'pending') {
            mappedStatus = 'pending';
          } else {
            mappedStatus = 'scheduled';
          }

          // Get tutor name
          const tutorName = session.tutor
            ? `${session.tutor.firstName || ''} ${session.tutor.lastName || ''}`.trim() || 'Tutor'
            : undefined;

          return {
            id: session.id,
            title: session.title,
            subject: session.subject,
            tutor: tutorName,
            scheduledTime: session.startTime,
            duration: duration || 30,
            type: mappedType,
            status: mappedStatus,
          };
        });

      setUpcomingSessions(upcoming);
    } catch (error) {
      console.error('Failed to load upcoming sessions:', error);
      // Set empty array on error
      setUpcomingSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const [quickActions] = useState<QuickAction[]>([
    {
      id: '1',
      title: 'Start Learning Adventure',
      description: 'Begin your fun learning journey today!',
      icon: 'rocket',
      route: '/gamification',
      color: 'blue',
    },
    {
      id: '2',
      title: 'Play Learning Games',
      description: 'Test your skills with fun quizzes!',
      icon: 'gamepad',
      route: '/gamification',
      color: 'green',
    },
    {
      id: '3',
      title: 'Chat with Helper',
      description: 'Get help from awesome tutors!',
      icon: 'bot',
      route: '/chat',
      color: 'purple',
    },
    {
      id: '4',
      title: 'See My Progress',
      description: "Check how amazing you're doing!",
      icon: 'star',
      route: '/behavioral',
      color: 'orange',
    },
  ]);

  useEffect(() => {
    // Track dashboard visit
    trackCustomEvent('dashboard_visit', { timestamp: new Date() });

    // Load upcoming sessions from backend
    loadUpcomingSessions();

    // Load user badges from backend
    loadUserBadges();

    // Load recent activities from backend
    loadRecentActivities();

    // Load progress data from backend
    loadProgressData();

    // Load dashboard stats (will be updated when upcomingSessions loads)
    loadDashboardStats();

    // Load today's study data
    loadTodayStudyData();
  }, []);

  // Reload dashboard stats when upcomingSessions changes
  useEffect(() => {
    if (upcomingSessions.length > 0 || dashboardStats === null) {
      loadDashboardStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upcomingSessions.length]);

  const loadConsistencyScore = async () => {
    try {
      const response = await behavioralService.getConsistencyScore(30);
      setConsistencyScore(response.consistencyScore || 0);
    } catch (error) {
      console.error('Failed to load consistency score:', error);
    }
  };

  const loadTodayStudyData = async () => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's completed sessions
      const todaySessionsResponse = await sessionService.getSessions({
        startDate: today.toISOString(),
        endDate: tomorrow.toISOString(),
        status: 'completed',
      });
      const todaySessions = todaySessionsResponse.sessions || [];

      // Calculate total minutes completed today
      const completedMinutes = todaySessions.reduce((total: number, session) => {
        return total + (session.duration || 0);
      }, 0);

      // Get daily goal from weekly commitments (if available)
      let dailyGoalMinutes = 60; // Default goal

      // Try to get from weekly commitments
      try {
        const { commitmentsService } = await import('../services/commitmentsService');
        const { commitment } = await commitmentsService.getCurrentCommitments();
        if (commitment && commitment.commitments) {
          // Find a time-based commitment and calculate daily goal
          const timeCommitment = commitment.commitments.find(
            (item) => item.type === 'time' && !item.completed
          );
          if (timeCommitment && timeCommitment.target) {
            // If target is weekly, divide by 7 for daily goal
            // If target is daily, use as is
            // For now, assume it's weekly and divide by 7
            dailyGoalMinutes = Math.round(timeCommitment.target / 7);
          }
        }
      } catch (error) {
        // If commitments service fails, use default
        console.log('Could not load commitment goal, using default:', error);
      }

      const remainingMinutes = Math.max(0, dailyGoalMinutes - completedMinutes);
      const progressPercent =
        dailyGoalMinutes > 0
          ? Math.min(100, Math.round((completedMinutes / dailyGoalMinutes) * 100))
          : 0;

      setTodayStudyData({
        completedMinutes,
        dailyGoalMinutes,
        remainingMinutes,
        progressPercent,
      });
    } catch (error) {
      console.error("Failed to load today's study data:", error);
      // Set default values on error
      setTodayStudyData({
        completedMinutes: 0,
        dailyGoalMinutes: 60,
        remainingMinutes: 60,
        progressPercent: 0,
      });
    }
  };

  const checkWeeklyAssessment = async () => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday

      // Show modal on Sunday or Monday
      if (dayOfWeek === 0 || dayOfWeek === 1) {
        const assessment = await assessmentsService.getCurrentAssessment();
        if (!assessment) {
          // Small delay to let dashboard load first
          setTimeout(() => setShowAssessmentModal(true), 2000);
        }
      }
    } catch (error) {
      console.error('Failed to check weekly assessment:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quiz_completed':
        return 'brain';
      case 'session_attended':
        return 'book';
      case 'badge_earned':
        return 'trophy';
      case 'milestone_reached':
        return 'target';
      default:
        return 'check';
    }
  };

  const getStatusColor = (status: UpcomingSession['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionColor = (color: QuickAction['color']) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'green':
        return 'bg-green-500 hover:bg-green-600';
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'orange':
        return 'bg-orange-500 hover:bg-orange-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <DashboardLayout>
      <style>{`
        @keyframes rocketLaunch {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        @keyframes gameBounce {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.2) rotate(-10deg); }
          50% { transform: scale(1.1) rotate(10deg); }
          75% { transform: scale(1.15) rotate(-5deg); }
        }
        @keyframes robotWave {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.1); }
          50% { transform: rotate(15deg) scale(1.05); }
          75% { transform: rotate(-10deg) scale(1.08); }
        }
        @keyframes starTwinkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          25% { transform: scale(1.2) rotate(90deg); opacity: 0.8; }
          50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
          75% { transform: scale(1.15) rotate(270deg); opacity: 0.9; }
        }
        @keyframes celebration {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.3) rotate(-15deg); }
          50% { transform: scale(1.2) rotate(15deg); }
          75% { transform: scale(1.1) rotate(-10deg); }
        }
        @keyframes pulseTarget {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
      <div className="space-y-4 sm:space-y-6 animate-fadeIn">
        {/* Welcome Header with Gradient Background */}
        <div className="mb-6 sm:mb-8 lg:mb-10">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mt-4 sm:-mt-8 -mr-4 sm:-mr-8 w-16 h-16 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-4 sm:-mb-8 -ml-4 sm:-ml-8 w-20 h-20 sm:w-40 sm:h-40 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2 drop-shadow-lg truncate">
                  {timeGreeting.greeting}, {user?.firstName}! {timeGreeting.emoji}
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 font-medium">
                  {timeGreeting.message}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 gap-1">
                    <Target className="w-3 h-3" />
                    Super Learner Mode
                  </span>
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white border border-white/30 gap-1">
                    <Flame
                      className="w-3 h-3 animate-flicker"
                      style={{ animation: 'flicker 1.5s ease-in-out infinite' }}
                    />
                    {dashboardStats?.currentStreak || 0} Day Adventure Streak!
                  </span>
                </div>
              </div>
              <div className="hidden sm:block sm:ml-6 flex-shrink-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30 relative overflow-hidden">
                  {/* Animated upward arrow */}
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{
                      animation: 'moveUpward 2s ease-in-out infinite',
                      transform: 'translateY(0)',
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  {/* Floating particles moving up */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="absolute w-1.5 h-1.5 bg-white/70 rounded-full"
                      style={{
                        animation: 'floatUp 2s ease-out infinite',
                        animationDelay: '0s',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    ></div>
                    <div
                      className="absolute w-1 h-1 bg-white/50 rounded-full"
                      style={{
                        animation: 'floatUp 2s ease-out infinite',
                        animationDelay: '0.7s',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    ></div>
                    <div
                      className="absolute w-1 h-1 bg-white/40 rounded-full"
                      style={{
                        animation: 'floatUp 2s ease-out infinite',
                        animationDelay: '1.4s',
                        left: '50%',
                        transform: 'translateX(-50%)',
                      }}
                    ></div>
                  </div>
                  <style>{`
                    @keyframes moveUpward {
                      0% {
                        transform: translateY(4px);
                        opacity: 0.8;
                      }
                      50% {
                        transform: translateY(-8px);
                        opacity: 1;
                      }
                      100% {
                        transform: translateY(-12px);
                        opacity: 0.7;
                      }
                    }
                    @keyframes floatUp {
                      0% {
                        transform: translateX(-50%) translateY(0) scale(1);
                        opacity: 1;
                      }
                      100% {
                        transform: translateX(-50%) translateY(-30px) scale(0.3);
                        opacity: 0;
                      }
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational System */}
        <MotivationalSystem maxPrompts={2} className="mb-6" />

        {/* Enhanced Stats Overview */}
        {dashboardStats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-10">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-blue-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-600 mb-1 truncate">
                    Learning Hours
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {dashboardStats.totalStudyHours}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    {weeklyChanges.studyHours !== 0 && (
                      <span
                        className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                          weeklyChanges.studyHours > 0
                            ? 'text-green-600 bg-green-50'
                            : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {weeklyChanges.studyHours > 0 ? '+' : ''}
                        {weeklyChanges.studyHours.toFixed(1)} this week
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <Clock
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin-slow"
                    style={{ animation: 'spin 3s linear infinite' }}
                  />
                  <style>{`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-green-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-600 mb-1 truncate">
                    Adventures Done
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {dashboardStats.completedSessions}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    {weeklyChanges.sessions !== 0 && (
                      <span
                        className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                          weeklyChanges.sessions > 0
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-red-600 bg-red-50'
                        }`}
                      >
                        {weeklyChanges.sessions > 0 ? '+' : ''}
                        {weeklyChanges.sessions} this week
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle2
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce-slow"
                    style={{ animation: 'bounce 2s ease-in-out infinite' }}
                  />
                  <style>{`
                    @keyframes bounce {
                      0%, 100% { transform: scale(1) translateY(0); }
                      50% { transform: scale(1.2) translateY(-3px); }
                    }
                  `}</style>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-red-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-600 mb-1 truncate">
                    Amazing Streak
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {dashboardStats.currentStreak}
                    <span className="text-sm sm:text-lg text-gray-500 ml-1">days</span>
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    {isPersonalBest && (
                      <span className="text-xs text-orange-600 font-medium bg-orange-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Personal best!
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Flame
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-flicker"
                    style={{ animation: 'flicker 1.5s ease-in-out infinite' }}
                  />
                  <style>{`
                    @keyframes flicker {
                      0%, 100% { transform: scale(1); filter: brightness(1); }
                      25% { transform: scale(1.1); filter: brightness(1.3); }
                      50% { transform: scale(0.95); filter: brightness(0.9); }
                      75% { transform: scale(1.05); filter: brightness(1.2); }
                    }
                  `}</style>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:border-purple-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-600 mb-1 truncate">
                    Next Adventure
                  </p>
                  <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    {dashboardStats.nextSession
                      ? formatTime(dashboardStats.nextSession)
                      : 'Not scheduled'}
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    {nextSessionTitle && (
                      <span className="text-xs text-purple-600 font-medium bg-purple-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full truncate">
                        {nextSessionTitle}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse"
                    style={{ animation: 'pulse 2s ease-in-out infinite' }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:border-indigo-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-amber-600 mb-1 truncate">
                    Consistency Score
                  </p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {consistencyScore}%
                  </p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <span
                      className={`text-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                        consistencyScore >= 80
                          ? 'bg-green-50 text-green-600'
                          : consistencyScore >= 50
                            ? 'bg-yellow-50 text-yellow-600'
                            : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {consistencyScore >= 80
                        ? 'Excellent!'
                        : consistencyScore >= 50
                          ? 'Good'
                          : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-twinkle"
                    style={{ animation: 'twinkle 2s ease-in-out infinite' }}
                  />
                  <style>{`
                    @keyframes twinkle {
                      0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                      25% { transform: scale(1.3) rotate(90deg); opacity: 0.8; }
                      50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
                      75% { transform: scale(1.2) rotate(270deg); opacity: 0.9; }
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid grid gap-6 lg:gap-8 transition-sidebar">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Goal Progress Card */}
            <GoalProgressCard />

            {/* Habit Streak Visualization */}
            <HabitStreakCard />

            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900">
                  Fun Learning Adventures
                </h3>
                <span className="text-xs sm:text-sm text-amber-600">
                  Pick your next amazing activity!
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    className="group relative overflow-hidden bg-white border-2 border-gray-100 hover:border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 text-left hover:bg-gradient-to-br hover:from-white hover:to-gray-50"
                    onClick={() => navigate(action.route)}
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${getActionColor(action.color)} group-hover:scale-110 transition-transform duration-200`}
                      >
                        {action.icon === 'rocket' && (
                          <Rocket
                            className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-rocket"
                            style={{ animation: 'rocketLaunch 2s ease-in-out infinite' }}
                          />
                        )}
                        {action.icon === 'gamepad' && (
                          <Gamepad2
                            className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-gamepad"
                            style={{ animation: 'gameBounce 1.5s ease-in-out infinite' }}
                          />
                        )}
                        {action.icon === 'bot' && (
                          <Bot
                            className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bot"
                            style={{ animation: 'robotWave 2s ease-in-out infinite' }}
                          />
                        )}
                        {action.icon === 'star' && (
                          <Star
                            className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-star"
                            style={{ animation: 'starTwinkle 2s ease-in-out infinite' }}
                          />
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors truncate">
                      {action.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {action.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Progress Overview */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900">
                  Your Amazing Progress! 📈
                </h3>
                {progressData.length > 4 && (
                  <button
                    onClick={() => navigate('/gamification?tab=progress')}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors self-start sm:self-auto"
                  >
                    View All →
                  </button>
                )}
              </div>
              <div className="space-y-6">
                {loadingProgress ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading progress...</p>
                  </div>
                ) : progressData.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-2 block">📈</span>
                    <p className="text-gray-600 text-sm">
                      No progress data yet. Start learning to track your progress!
                    </p>
                  </div>
                ) : (
                  progressData.slice(0, 4).map((progress) => (
                    <div
                      key={progress.subject}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-base font-semibold text-gray-900">
                            {progress.subject}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">
                            {progress.current}/{progress.target}
                          </span>
                          <div className="flex items-center space-x-1">
                            {progress.trend === 'up' && <span className="text-green-500">📈</span>}
                            {progress.trend === 'down' && <span className="text-red-500">📉</span>}
                            {progress.trend === 'stable' && (
                              <span className="text-gray-500">➡️</span>
                            )}
                            <span className="text-xs font-medium text-gray-500">
                              {progress.percentage}%
                            </span>
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
                  ))
                )}
              </div>
            </div>

            {/* Enhanced Recent Activities */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900 flex items-center gap-2">
                  Look What You Did!
                  <PartyPopper
                    className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 animate-celebration"
                    style={{ animation: 'celebration 1.5s ease-in-out infinite' }}
                  />
                </h3>
                {recentActivities.length > 3 && (
                  <button
                    onClick={() => navigate('/gamification?tab=progress')}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors self-start sm:self-auto"
                  >
                    View All →
                  </button>
                )}
              </div>
              <div className="space-y-3 sm:space-y-4">
                {loadingActivities ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                    <p className="text-xs sm:text-sm text-gray-600">Loading activities...</p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2 animate-pulse" />
                    <p className="text-gray-600 text-xs sm:text-sm">
                      No recent activities yet. Start learning to see your achievements here!
                    </p>
                  </div>
                ) : (
                  recentActivities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className="group flex items-start space-x-2 sm:space-x-4 p-3 sm:p-4 bg-gray-50 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-all duration-200 hover:shadow-sm"
                    >
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        {activity.badgeIcon ? (
                          <span className="text-base sm:text-lg">{activity.badgeIcon}</span>
                        ) : (
                          (() => {
                            const iconType = getActivityIcon(activity.type);
                            if (iconType === 'brain')
                              return (
                                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 animate-pulse" />
                              );
                            if (iconType === 'book')
                              return <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />;
                            if (iconType === 'trophy')
                              return <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />;
                            if (iconType === 'target')
                              return (
                                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 animate-pulse" />
                              );
                            return <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />;
                          })()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-0 mb-1">
                          <h4 className="text-sm sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-gray-500 font-medium bg-white px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
                          {activity.description}
                        </p>
                        {activity.points && (
                          <div className="flex items-center">
                            <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 sm:px-3 py-1 rounded-full font-medium">
                              +{activity.points} XP earned
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Weekly Commitment Card */}
            <WeeklyCommitmentCard />

            {/* Milestone Card */}
            <MilestoneCard />

            {/* Reflection Journal Card */}
            <ReflectionCard />

            {/* Enhanced Upcoming Sessions */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900">Coming Up Next! 🗓️</h3>
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium self-start sm:self-auto">
                  {upcomingSessions.length} fun activities!
                </span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                      <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {session.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1 truncate">{session.subject}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium flex-shrink-0 ${getStatusColor(session.status)}`}
                      >
                        {session.status}
                      </span>
                    </div>
                    {session.tutor && (
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-300 rounded-full flex-shrink-0"></div>
                        <p className="text-xs text-gray-600 font-medium truncate">
                          {session.tutor}
                        </p>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {formatDate(session.scheduledTime)} at {formatTime(session.scheduledTime)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500 flex-shrink-0">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>{session.duration} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 sm:mt-6 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 hover:shadow-sm border border-purple-100 hover:border-purple-200">
                See All My Adventures! →
              </button>
            </div>

            {/* Enhanced Badges */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-purple-900">
                  Your Super Badges! 🏆
                </h3>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium self-start sm:self-auto">
                  {badges.length} earned
                </span>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="group bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 border border-yellow-100 hover:border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start space-x-2 sm:space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                        <span className="text-lg sm:text-xl">{badge.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors truncate">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                          {badge.description}
                        </p>
                        {badge.earnedAt && (
                          <div className="flex items-center space-x-1">
                            <PartyPopper
                              className="w-3 h-3 text-orange-600 animate-celebration"
                              style={{ animation: 'celebration 1.5s ease-in-out infinite' }}
                            />
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
              <button
                onClick={() => navigate('/gamification?tab=badges')}
                className="w-full mt-4 sm:mt-6 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 hover:shadow-sm border border-yellow-100 hover:border-yellow-200"
              >
                See All My Super Badges! →
              </button>
            </div>

            {/* Enhanced Study Reminder */}
            {todayStudyData.dailyGoalMinutes > 0 && (
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-2 sm:-mt-4 -mr-2 sm:-mr-4 w-12 h-12 sm:w-24 sm:h-24 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute bottom-0 left-0 -mb-3 sm:-mb-6 -ml-3 sm:-ml-6 w-16 h-16 sm:w-32 sm:h-32 bg-white bg-opacity-5 rounded-full"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Target
                        className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse-target"
                        style={{ animation: 'pulseTarget 2s ease-in-out infinite' }}
                      />
                    </div>
                    {todayStudyData.remainingMinutes > 0 && (
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full whitespace-nowrap">
                          {todayStudyData.remainingMinutes} min left
                        </div>
                      </div>
                    )}
                    {todayStudyData.remainingMinutes === 0 &&
                      todayStudyData.completedMinutes > 0 && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs bg-green-500 bg-opacity-30 px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1 justify-end">
                            Goal achieved!
                            <PartyPopper
                              className="w-3 h-3 animate-celebration"
                              style={{ animation: 'celebration 1.5s ease-in-out infinite' }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                  {todayStudyData.progressPercent >= 100 ? (
                    <>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 flex items-center gap-2">
                        Your Effort Paid Off!
                        <PartyPopper
                          className="w-4 h-4 sm:w-5 sm:h-5 animate-celebration"
                          style={{ animation: 'celebration 1.5s ease-in-out infinite' }}
                        />
                      </h3>
                      <p className="text-xs sm:text-sm text-white text-opacity-90 mb-3 sm:mb-4 leading-relaxed">
                        You've completed {todayStudyData.completedMinutes} minutes of learning
                        today! Your consistent effort is building stronger learning habits! 🌟
                      </p>
                    </>
                  ) : todayStudyData.progressPercent >= 75 ? (
                    <>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                        You're Growing! 🌟
                      </h3>
                      <p className="text-xs sm:text-sm text-white text-opacity-90 mb-3 sm:mb-4 leading-relaxed">
                        {todayStudyData.remainingMinutes > 0
                          ? `You only need ${todayStudyData.remainingMinutes} more ${todayStudyData.remainingMinutes === 1 ? 'minute' : 'minutes'}! Your effort is building amazing habits - keep going!`
                          : `You've completed ${todayStudyData.completedMinutes} minutes today! Your daily effort is making you stronger!`}
                      </p>
                    </>
                  ) : todayStudyData.progressPercent >= 50 ? (
                    <>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                        Keep Growing! 💪
                      </h3>
                      <p className="text-xs sm:text-sm text-white text-opacity-90 mb-3 sm:mb-4 leading-relaxed">
                        You're halfway there! {todayStudyData.remainingMinutes} more{' '}
                        {todayStudyData.remainingMinutes === 1 ? 'minute' : 'minutes'} to reach your
                        goal. Every minute you spend learning makes your brain stronger!
                      </p>
                    </>
                  ) : todayStudyData.completedMinutes > 0 ? (
                    <>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                        Your Progress is Growing! 🌱
                      </h3>
                      <p className="text-xs sm:text-sm text-white text-opacity-90 mb-3 sm:mb-4 leading-relaxed">
                        You've completed {todayStudyData.completedMinutes}{' '}
                        {todayStudyData.completedMinutes === 1 ? 'minute' : 'minutes'} today!{' '}
                        {todayStudyData.remainingMinutes} more{' '}
                        {todayStudyData.remainingMinutes === 1 ? 'minute' : 'minutes'} to reach your
                        goal. Every step counts!
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">
                        Ready to Grow? 📚
                      </h3>
                      <p className="text-xs sm:text-sm text-white text-opacity-90 mb-3 sm:mb-4 leading-relaxed">
                        Start your learning journey today! Complete{' '}
                        {todayStudyData.dailyGoalMinutes} minutes to build stronger learning habits.
                        Your brain gets stronger every time you learn something new!
                      </p>
                    </>
                  )}
                  <div className="bg-white bg-opacity-20 rounded-full h-2 mb-3 sm:mb-4">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-500"
                      style={{ width: `${todayStudyData.progressPercent}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => navigate('/gamification')}
                    className="w-full bg-white text-purple-600 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm hover:bg-opacity-90 transition-all duration-200 hover:shadow-md flex items-center justify-center gap-2"
                  >
                    Let's Keep Learning!
                    <Rocket
                      className="w-4 h-4 sm:w-5 sm:h-5 animate-rocket"
                      style={{ animation: 'rocketLaunch 2s ease-in-out infinite' }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Assessment Modal */}
        {showAssessmentModal && (
          <WeeklyAssessmentModal
            onClose={() => setShowAssessmentModal(false)}
            onSuccess={() => {
              setShowAssessmentModal(false);
              loadConsistencyScore();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
