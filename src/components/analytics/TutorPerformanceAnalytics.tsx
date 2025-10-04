import React, { useState, useEffect } from 'react';
import { useTutorAnalytics } from '../../store/analyticsStore';
import { useAuthStore } from '../../store/authStore';
import { TutorPerformanceAnalytics, UserRole } from '../../types';
import {
  Users,
  Star,
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  DollarSign,
  Award,
  BookOpen,
  Target,
  Calendar,
  ThumbsUp,
  Activity,
  BarChart3,
  Filter
} from 'lucide-react';

export const TutorPerformanceAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const { tutorAnalytics, fetchTutorPerformanceAnalytics } = useTutorAnalytics();
  const [selectedAnalytics, setSelectedAnalytics] = useState<TutorPerformanceAnalytics | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role === UserRole.TUTOR || user.role === UserRole.ADMIN)) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const tutorId = user.role === UserRole.TUTOR ? user.id : 'sample-tutor';
      await fetchTutorPerformanceAnalytics(tutorId, dateRange.startDate, dateRange.endDate);

      if (tutorAnalytics.length > 0) {
        setSelectedAnalytics(tutorAnalytics[0]);
      }
    } catch (error) {
      console.error('Failed to load tutor analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getExpertiseLevel = (level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => {
    const levels = {
      beginner: { color: 'bg-gray-100 text-gray-800', icon: '📚' },
      intermediate: { color: 'bg-blue-100 text-blue-800', icon: '📖' },
      advanced: { color: 'bg-purple-100 text-purple-800', icon: '🎓' },
      expert: { color: 'bg-yellow-100 text-yellow-800', icon: '🏆' }
    };
    return levels[level];
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

  if (!selectedAnalytics) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600 mb-6">Generate your performance analytics to track teaching effectiveness.</p>
        <button
          onClick={loadAnalytics}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Generate Analytics
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {selectedAnalytics.profileImage && (
            <img
              src={selectedAnalytics.profileImage}
              alt={selectedAnalytics.tutorName}
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
              {selectedAnalytics.tutorName} - Performance Analytics
            </h2>
            <p className="text-sm text-gray-600">
              {new Date(selectedAnalytics.period.startDate).toLocaleDateString()} - {new Date(selectedAnalytics.period.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <button
            onClick={loadAnalytics}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Update
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Overall Rating</p>
              <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.overallRating}</p>
            </div>
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
            </div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-500">
              From {selectedAnalytics.studentSatisfaction.totalReviews} reviews
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.totalStudents}</p>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Hours</p>
              <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.totalHours}</p>
            </div>
            <Clock className="h-6 w-6 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {selectedAnalytics.totalSessions} sessions
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${selectedAnalytics.earnings.total}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(selectedAnalytics.earnings.trend)}
                <span className="text-xs text-gray-500 ml-1">
                  Avg ${selectedAnalytics.earnings.average}/hr
                </span>
              </div>
            </div>
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>

      {/* Subject Expertise */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Subject Expertise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedAnalytics.subjectExpertise.map((subject, index) => {
            const expertiseLevel = getExpertiseLevel(subject.level);
            return (
              <div key={index} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${expertiseLevel.color}`}>
                    {expertiseLevel.icon} {subject.level}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-medium">{subject.studentsHelped}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Hours</p>
                    <p className="font-medium">{subject.sessionHours}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Rating</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-medium ml-1">{subject.averageRating}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Session Metrics */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Session Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${selectedAnalytics.sessionMetrics.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{selectedAnalytics.sessionMetrics.completionRate}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Punctuality Score</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${selectedAnalytics.sessionMetrics.punctualityScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{selectedAnalytics.sessionMetrics.punctualityScore}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Preparation Score</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${selectedAnalytics.sessionMetrics.preparationScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{selectedAnalytics.sessionMetrics.preparationScore}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Outcomes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Student Outcomes
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-600">{selectedAnalytics.studentOutcomes.averageImprovement}%</p>
              <p className="text-sm text-green-800">Average Improvement</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-lg font-bold text-blue-600">{selectedAnalytics.studentOutcomes.successRate}%</p>
                <p className="text-xs text-blue-800">Success Rate</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-lg font-bold text-purple-600">{selectedAnalytics.studentOutcomes.retentionRate}%</p>
                <p className="text-xs text-purple-800">Retention Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Rating Distribution
        </h3>
        <div className="space-y-3">
          {selectedAnalytics.studentSatisfaction.ratingDistribution.map((rating) => (
            <div key={rating.rating} className="flex items-center">
              <div className="flex items-center w-16">
                <span className="text-sm text-gray-600 mr-2">{rating.rating}</span>
                <Star className="h-4 w-4 text-yellow-400 territoire-current" />
              </div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${rating.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-gray-600 w-16 text-right">
                {rating.count} ({rating.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Student Feedback */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recent Student Feedback
        </h3>
        <div className="space-y-4">
          {selectedAnalytics.recentFeedback.map((feedback) => (
            <div key={feedback.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{feedback.studentName}</h4>
                  <p className="text-sm text-gray-500">{feedback.subject}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({feedback.rating}/5)</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{feedback.comment}</p>
              <p className="text-xs text-gray-500">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
          <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.engagement.messagesSent}</p>
          <p className="text-sm text-gray-500">Messages Sent</p>
          <p className="text-xs text-gray-400 mt-1">
            Avg response: {selectedAnalytics.engagement.responseTime}min
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
          <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.engagement.resourcesShared}</p>
          <p className="text-sm text-gray-500">Resources Shared</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
          <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{selectedAnalytics.studentSatisfaction.averageRating}</p>
          <p className="text-sm text-gray-500">Student Satisfaction</p>
        </div>
      </div>
    </div>
  );
};