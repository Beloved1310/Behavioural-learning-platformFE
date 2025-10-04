import React, { useState, useEffect } from 'react';
import { useStudentReports } from '../../store/analyticsStore';
import { useAuthStore } from '../../store/authStore';
import { StudentProgressReport, UserRole } from '../../types';
import {
  User,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Clock,
  Target,
  MessageSquare,
  BookOpen,
  Brain,
  Star,
  AlertCircle,
  ChevronRight,
  Download,
  Filter
} from 'lucide-react';

export const StudentProgressReports: React.FC = () => {
  const { user } = useAuthStore();
  const { studentReports, fetchStudentProgressReport } = useStudentReports();
  const [selectedReport, setSelectedReport] = useState<StudentProgressReport | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load initial report
  useEffect(() => {
    if (user && (user.role === UserRole.STUDENT || user.role === UserRole.ADMIN)) {
      loadReport();
    }
  }, [user, dateRange]);

  const loadReport = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const studentId = user.role === UserRole.STUDENT ? user.id : 'sample-student';
      await fetchStudentProgressReport(studentId, dateRange.startDate, dateRange.endDate);

      // Select the most recent report
      if (studentReports.length > 0) {
        setSelectedReport(studentReports[0]);
      }
    } catch (error) {
      console.error('Failed to load progress report:', error);
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
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeValue = grade.charAt(0);
    switch (gradeValue) {
      case 'A':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'B':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Progress Report Available</h3>
        <p className="text-gray-600 mb-6">Generate your first progress report to track learning achievements.</p>
        <button
          onClick={loadReport}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generate Report
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <User className="h-6 w-6" />
            Student Progress Report
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Comprehensive analysis of learning progress and achievements
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Selector */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={loadReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Filter className="h-4 w-4 mr-2" />
            Update Report
          </button>
        </div>
      </div>

      {/* Overall Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        <div className={`p-4 sm:p-6 border rounded-lg ${getGradeColor(selectedReport.overallGrade)}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">Overall Grade</p>
              <p className="text-2xl font-bold">{selectedReport.overallGrade}</p>
            </div>
            <Award className="h-8 w-8" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{selectedReport.overallProgress}%</p>
            </div>
            <Target className="h-8 w-8 text-blue-500" />
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${selectedReport.overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Study Hours</p>
              <p className="text-2xl font-bold text-gray-900">{selectedReport.studyHours.total}</p>
              <div className="flex items-center mt-1">
                {getTrendIcon(selectedReport.studyHours.trend)}
                <span className="text-xs text-gray-500 ml-1">
                  Avg {selectedReport.studyHours.average}h/week
                </span>
              </div>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">{selectedReport.attendanceRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {selectedReport.quizPerformance.totalQuizzes} sessions
              </p>
            </div>
            <Calendar className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Subject Progress
        </h3>
        <div className="space-y-4">
          {selectedReport.subjectProgress.map((subject, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                  <p className="text-sm text-gray-500">
                    Level {subject.currentLevel} of {subject.targetLevel} • {subject.hoursSpent}h studied
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{subject.averageScore}% avg</p>
                  <p className="text-xs text-gray-500">
                    Last activity: {new Date(subject.lastActivity).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{subject.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${subject.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Recent Milestones</p>
                <div className="flex flex-wrap gap-2">
                  {subject.milestones.slice(0, 3).map((milestone) => (
                    <span
                      key={milestone.id}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        milestone.isCompleted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {milestone.isCompleted && <Star className="h-3 w-3 mr-1" />}
                      {milestone.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements and Areas for Improvement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {selectedReport.achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    +{achievement.pointsEarned} points • {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {selectedReport.areasForImprovement.map((area, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{area}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Strengths</h4>
            <div className="flex flex-wrap gap-2">
              {selectedReport.strengths.map((strength, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                >
                  <Star className="h-3 w-3 mr-1" />
                  {strength}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tutor Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Tutor Comments & Feedback
        </h3>
        <div className="space-y-4">
          {selectedReport.tutorComments.map((comment) => (
            <div key={comment.id} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-gray-900">{comment.tutorName}</h4>
                  <p className="text-sm text-gray-500">{comment.subject}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < comment.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">({comment.rating}/5)</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.comment}</p>
              <p className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Action */}
      <div className="flex justify-end">
        <button
          onClick={() => {/* Handle export */}}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>
    </div>
  );
};