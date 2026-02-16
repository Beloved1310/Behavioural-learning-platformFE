import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import { useChatStore } from '../store/chatStore';
import { Session } from '../types';
import {
  Calendar,
  MessageSquare,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  BookOpen,
} from 'lucide-react';
import { TutorStudentProgressCard } from '../components/tutor/TutorStudentProgressCard';
import { TutorSupportQueue } from '../components/tutor/TutorSupportQueue';
import { TutorGoalAssignment } from '../components/tutor/TutorGoalAssignment';
import { TutorPendingGoalsQueue } from '../components/tutor/TutorPendingGoalsQueue';
import { TutorCommitmentAssignment } from '../components/tutor/TutorCommitmentAssignment';
import { TutorReflectionFeedback } from '../components/tutor/TutorReflectionFeedback';
import { TutorAssessmentFeedback } from '../components/tutor/TutorAssessmentFeedback';
import { tutorStudentsService } from '../services/tutorStudentsService';
import { tutorGoalsService } from '../services/tutorGoalsService';
import { tutorSessionService } from '../services/tutorSessionService';

export const TutorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { sessions, loadSessions, isLoading } = useSessionStore();
  const { conversations, loadConversations } = useChatStore();
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Session[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [atRiskCount, setAtRiskCount] = useState(0);
  const [pendingGoalsCount, setPendingGoalsCount] = useState(0);

  useEffect(() => {
    // Wait for user to be loaded
    if (!user) {
      return;
    }

    if (user.role !== 'TUTOR') {
      navigate('/dashboard');
      return;
    }

    // Ensure token is available before making API calls
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token found, redirecting to login');
      navigate('/login');
      return;
    }

    // Small delay to ensure token is properly set in API service
    const timer = setTimeout(() => {
      // Load sessions and conversations
      loadSessions({ status: 'scheduled' }).catch((error) => {
        console.error('Failed to load sessions:', error);
        // If it's an auth error, redirect to login
        if (
          error instanceof Error &&
          (error.message.includes('401') || error.message.includes('Authentication'))
        ) {
          navigate('/login');
        }
      });
      loadConversations().catch((error) => {
        console.error('Failed to load conversations:', error);
        // If it's an auth error, redirect to login
        if (
          error instanceof Error &&
          (error.message.includes('401') || error.message.includes('Authentication'))
        ) {
          navigate('/login');
        }
      });

      // Load tutor dashboard stats
      loadTutorStats();
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate, loadSessions, loadConversations]);

  const loadTutorStats = async () => {
    try {
      // Load stats separately to handle errors gracefully
      const studentsPromise = tutorStudentsService
        .getAllStudentsProgress()
        .then((result) => result.students || [])
        .catch((error) => {
          console.error('Failed to load students:', error);
          return [];
        });

      const atRiskPromise = tutorStudentsService.getAtRiskStudents().catch((error) => {
        console.error('Failed to load at-risk students:', error);
        return [];
      });

      const pendingGoalsPromise = tutorGoalsService.getPendingGoals().catch((error) => {
        console.error('Failed to load pending goals:', error);
        return [];
      });

      const [students, atRisk, pendingGoals] = await Promise.all([
        studentsPromise,
        atRiskPromise,
        pendingGoalsPromise,
      ]);

      setTotalStudents(students.length);
      setAtRiskCount(atRisk.length);
      setPendingGoalsCount(pendingGoals.length);
    } catch (error) {
      console.error('Failed to load tutor stats:', error);
      // Set defaults to prevent UI crashes
      setTotalStudents(0);
      setAtRiskCount(0);
      setPendingGoalsCount(0);
    }
  };

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const now = new Date();

      // Upcoming sessions (scheduled, in the future)
      const upcoming = sessions
        .filter((session) => {
          const sessionDate = new Date(session.startTime);
          return sessionDate > now && session.status === 'scheduled';
        })
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5);

      setUpcomingSessions(upcoming);
    }
  }, [sessions]);

  // Load pending requests separately using the tutor session service
  useEffect(() => {
    const loadPendingRequests = async () => {
      try {
        const result = await tutorSessionService.getPendingRequests();
        const pending = result.requests || [];
        // Convert PendingSessionRequest[] to Session[] format for display
        const pendingSessions: Session[] = pending.map((req) => ({
          id: req.id,
          userId: req.studentId,
          title: req.title,
          subject: req.subject,
          type: 'tutoring' as const,
          startTime: req.scheduledAt,
          endTime: req.endTime,
          duration: req.duration,
          tutorId: user?.id || '',
          tutor: {
            id: user?.id || '',
            name: user?.firstName + ' ' + user?.lastName || '',
          },
          status: 'pending' as const,
          createdAt: req.requestedAt,
          updatedAt: req.requestedAt,
        }));
        setPendingRequests(pendingSessions);
      } catch (error) {
        console.error('Failed to load pending requests:', error);
        setPendingRequests([]);
      }
    };

    if (user && user.role === 'TUTOR') {
      loadPendingRequests();
      // Refresh every 30 seconds to keep list updated
      const interval = setInterval(loadPendingRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Recent chats (last 5 conversations) with student names extracted
  const recentChats = conversations
    .map((conversation) => {
      // Extract student name from participants (filter out current tutor)
      const currentUserId = user?.id || '';
      const otherParticipants = conversation.participants.filter(
        (p) => p.id !== currentUserId
      );
      
      // Get student name using the same logic as ChatList
      let participantName = 'Student';
      if (otherParticipants.length > 0) {
        const student = otherParticipants[0];
        // Try name field first
        if (student.name && student.name.trim() && student.name !== 'Unknown User') {
          participantName = student.name.trim();
        } else {
          // Then try firstName and lastName
          const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
          if (fullName) {
            participantName = fullName;
          } else {
            // Fallback based on role
            participantName = student.role === 'STUDENT' ? 'Student' : 'User';
          }
        }
      }

      return {
        ...conversation,
        participantName,
        lastMessageAt: conversation.lastActivity || conversation.lastMessage?.timestamp || conversation.lastMessage?.createdAt,
      };
    })
    .sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const sessionDate = new Date(dateString);
    const diff = sessionDate.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <TutorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header with Gradient */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2 truncate">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-purple-100 text-sm sm:text-base lg:text-lg">
                  Here's your tutoring overview
                </p>
              </div>
              <div className="mt-2 sm:mt-0 flex flex-wrap gap-2 sm:gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/30 flex-1 sm:flex-none min-w-[100px]">
                  <div className="text-white/80 text-xs sm:text-sm font-medium">Total Students</div>
                  <div className="text-white text-xl sm:text-2xl font-bold">{totalStudents}</div>
                </div>
                {atRiskCount > 0 && (
                  <div className="bg-red-500/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-red-300/30 flex-1 sm:flex-none min-w-[100px]">
                    <div className="text-white/80 text-xs sm:text-sm font-medium">Need Support</div>
                    <div className="text-white text-xl sm:text-2xl font-bold">{atRiskCount}</div>
                  </div>
                )}
                {pendingGoalsCount > 0 && (
                  <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-yellow-300/30 flex-1 sm:flex-none min-w-[100px]">
                    <div className="text-white/80 text-xs sm:text-sm font-medium">
                      Pending Goals
                    </div>
                    <div className="text-white text-xl sm:text-2xl font-bold">
                      {pendingGoalsCount}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Support Queue - Priority Section */}
        <div className="mb-6">
          <TutorSupportQueue />
          {atRiskCount > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/tutor/students/at-risk')}
                className="text-sm text-red-600 hover:text-red-700 font-semibold hover:underline transition-all"
              >
                View All At-Risk Students →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions - Enhanced Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => {
              const element = document.getElementById('pending-goals');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group relative bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            {pendingGoalsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center shadow-lg animate-pulse">
                {pendingGoalsCount}
              </span>
            )}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                  Pending Goals
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Review approvals</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              const element = document.getElementById('assign-goals');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-purple-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <Target className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                  Assign Goal
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Set student goals</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              const element = document.getElementById('assign-commitments');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group relative bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                  Assign Commitments
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Set weekly tasks</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/tutor/quiz/create')}
            className="group relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-green-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                  Create Quiz
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Build new quizzes</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              const element = document.getElementById('reflection-feedback');
              element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="group relative bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-lg sm:rounded-xl p-4 sm:p-5 hover:border-pink-400 hover:shadow-xl transition-all duration-300 text-left transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 text-base sm:text-lg mb-1 truncate">
                  Reflection Feedback
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Review reflections</div>
              </div>
            </div>
          </button>
        </div>

        {/* Pending Goals Queue */}
        <div id="pending-goals" className="mb-8 scroll-mt-8">
          <TutorPendingGoalsQueue />
        </div>

        {/* Student Progress and Goal Assignment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Student Progress Overview */}
          <div>
            <TutorStudentProgressCard />
          </div>

          {/* Goal Assignment */}
          <div id="assign-goals" className="scroll-mt-8">
            <TutorGoalAssignment />
          </div>
        </div>

        {/* Commitment Assignment and Reflection Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
          {/* Commitment Assignment */}
          <div id="assign-commitments" className="scroll-mt-8">
            <TutorCommitmentAssignment />
          </div>

          {/* Reflection Feedback */}
          <div id="reflection-feedback" className="scroll-mt-8">
            <TutorReflectionFeedback />
          </div>
        </div>

        {/* Assessment Feedback */}
        <div id="assessment-feedback" className="mb-6 sm:mb-8 scroll-mt-8">
          <TutorAssessmentFeedback />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Upcoming Sessions */}
          <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-lg sm:rounded-xl shadow-lg border border-purple-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="truncate">Upcoming Sessions</span>
              </h2>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <button
                  onClick={() => navigate('/tutor/history')}
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all"
                >
                  History →
                </button>
              <button
                onClick={() => navigate('/tutor/sessions')}
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-semibold hover:underline transition-all"
              >
                View All →
              </button>
              </div>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-purple-400" />
                </div>
                <p className="text-gray-500 font-medium">No upcoming sessions</p>
                <p className="text-sm text-gray-400 mt-1">Schedule sessions to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/tutor/sessions/${session.id}`)}
                    className="group bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                          {session.title}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                          {session.tutor?.name || 'Student Session'}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{formatDate(session.startTime)}</span>
                          </span>
                          <span className="flex-shrink-0">{session.duration} min</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-purple-600 font-medium whitespace-nowrap">
                          {getTimeUntil(session.startTime)}
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">until start</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Session Requests */}
          <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-lg sm:rounded-xl shadow-lg border border-orange-100 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="truncate">Pending Requests</span>
              </h2>
              {pendingRequests.length > 0 && (
                <button
                  onClick={() => navigate('/tutor/sessions/approve')}
                  className="text-xs sm:text-sm text-orange-600 hover:text-orange-700 font-semibold hover:underline transition-all flex-shrink-0 ml-2"
                >
                  Approve All →
                </button>
              )}
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <p className="text-gray-500 font-medium">No pending requests</p>
                <p className="text-sm text-gray-400 mt-1">All requests have been processed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => navigate(`/tutor/sessions/${session.id}`)}
                    className="group bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                          {session.title}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 mb-2 truncate">
                          {session.subject} • {session.type}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {formatDate(session.startTime)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded whitespace-nowrap">
                          Pending
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Chats */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-br from-white to-blue-50/30 rounded-lg sm:rounded-xl shadow-lg border border-blue-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="truncate">Recent Chats</span>
            </h2>
            <button
              onClick={() => navigate('/tutor/chat')}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all flex-shrink-0 ml-2"
            >
              View All →
            </button>
          </div>

          {recentChats.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-500 font-medium">No recent conversations</p>
              <p className="text-sm text-gray-400 mt-1">Start chatting with your students</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => navigate(`/tutor/chat?conversation=${chat.id}`)}
                  className="group bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md flex-shrink-0">
                        {chat.participantName?.[0] || 'S'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 truncate text-sm sm:text-base">
                          {chat.participantName || 'Student'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 truncate">
                          {chat.lastMessage
                            ? chat.lastMessage.content || 'No messages yet'
                            : 'No messages yet'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2 sm:ml-3">
                      {chat.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 sm:px-2.5 py-1 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full shadow-md mb-1">
                          {chat.unreadCount}
                        </span>
                      )}
                      {chat.lastMessageAt && (
                        <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                          {new Date(chat.lastMessageAt).toLocaleDateString('en-GB', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
};
