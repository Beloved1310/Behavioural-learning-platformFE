import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { tutorStudentsService } from '../services/tutorStudentsService';
import { sessionService } from '../services/sessionService';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Clock,
  Target,
  CheckCircle2,
  TrendingUp,
  Flame,
  MessageSquare,
  BarChart3,
  BookOpen,
  FileText,
} from 'lucide-react';
import { StudentAnalyticsDashboard } from '../components/tutor/StudentAnalyticsDashboard';

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  gradeLevel?: string;
  academicGoals?: string[];
  streak: number;
  goalProgress: number;
  commitmentsCompleted: number;
  commitmentsTotal: number;
  consistencyScore: number;
  status: 'on-track' | 'needs-attention' | 'at-risk';
  lastLoginAt?: string;
  totalPoints?: number;
}

export const TutorStudentDetail: React.FC = () => {
  const navigate = useNavigate();
  const { studentId } = useParams<{ studentId: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'sessions' | 'activity'>(
    'overview'
  );

  useEffect(() => {
    if (studentId) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      // Load student detail
      const studentDetail = await tutorStudentsService.getStudentDetail(studentId!);

      if (studentDetail) {
        setStudent({
          id: studentDetail.id,
          name: studentDetail.name,
          email: studentDetail.email,
          profileImage: studentDetail.profileImage,
          gradeLevel: studentDetail.gradeLevel,
          academicGoals: studentDetail.academicGoals,
          streak: studentDetail.streak,
          goalProgress: studentDetail.goalProgress,
          commitmentsCompleted: studentDetail.commitmentsCompleted,
          commitmentsTotal: studentDetail.commitmentsTotal,
          consistencyScore: studentDetail.consistencyScore,
          status: studentDetail.status,
          lastLoginAt: studentDetail.lastLoginAt,
          totalPoints: studentDetail.totalPoints || 0,
        });
      }

      // Load sessions with this student
      const sessionsResult = await sessionService.getSessions();
      const allSessions = sessionsResult.sessions || [];
      const studentSessions = allSessions.filter((s) => s.userId === studentId);
      setSessions(
        studentSessions
          .slice(0, 10)
          .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      );
    } catch (error) {
      console.error('Failed to load student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'needs-attention':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'at-risk':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <TutorLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  if (!student) {
    return (
      <TutorLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-lg font-medium mb-2">Student not found</p>
            <button
              onClick={() => navigate('/tutor/students')}
              className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium"
            >
              Back to Students
            </button>
          </div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/tutor/students')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Students</span>
          </button>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-lg sm:text-2xl font-bold flex-shrink-0">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                    {student.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-1 sm:gap-0 mt-2">
                    <div className="flex items-center space-x-1 text-gray-600 text-xs sm:text-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.gradeLevel && (
                      <div className="flex items-center space-x-1 text-gray-600 text-xs sm:text-sm">
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>Grade {student.gradeLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0">
                <span
                  className={`px-2 sm:px-3 py-1 rounded-full border text-xs sm:text-sm font-medium text-center ${getStatusColor(student.status)}`}
                >
                  {student.status === 'on-track' && '🟢 On Track'}
                  {student.status === 'needs-attention' && '🟡 Needs Attention'}
                  {student.status === 'at-risk' && '🔴 At Risk'}
                </span>
                <button
                  onClick={() => navigate(`/tutor/chat?student=${student.id}`)}
                  className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Current Streak</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{student.streak} days</p>
              </div>
              <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 flex-shrink-0 ml-2" />
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Goal Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {student.goalProgress}%
                </p>
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 ml-2" />
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Commitments</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {student.commitmentsCompleted}/{student.commitmentsTotal}
                </p>
              </div>
              <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 ml-2" />
            </div>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Consistency</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {student.consistencyScore}%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0 ml-2" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 min-w-max" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'sessions', label: 'Sessions', icon: Calendar },
                { id: 'activity', label: 'Activity', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900 font-medium">{student.email}</p>
                    </div>
                    {student.gradeLevel && (
                      <div>
                        <p className="text-sm text-gray-600">Grade Level</p>
                        <p className="text-gray-900 font-medium">Grade {student.gradeLevel}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Last Login</p>
                      <p className="text-gray-900 font-medium">{formatDate(student.lastLoginAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="text-gray-900 font-medium capitalize">
                        {student.status.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                </div>

                {student.academicGoals && student.academicGoals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Goals</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.academicGoals.map((goal, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {goal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>{studentId && <StudentAnalyticsDashboard studentId={studentId} />}</div>
            )}

            {activeTab === 'sessions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
                {sessions.length === 0 ? (
                  <p className="text-gray-600">No sessions found</p>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{session.title}</p>
                            <p className="text-sm text-gray-600">{session.subject}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{session.duration} min</span>
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : session.status === 'scheduled'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <p className="text-gray-600">Activity history will be displayed here</p>
                {/* TODO: Implement activity feed */}
              </div>
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
};
