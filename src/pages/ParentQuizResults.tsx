import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParentLayout } from '../components/layout/ParentLayout';
import { useAuthStore } from '../store/authStore';
import { BookOpen, TrendingUp, TrendingDown, Clock, Award, User, ArrowLeft } from 'lucide-react';
import { UserRole } from '../types';
import apiService from '../services/api';

interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
}

interface Child {
  id: string;
  name: string;
  email: string;
}

export const ParentQuizResults: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== UserRole.PARENT) {
      navigate('/parent/dashboard');
      return;
    }
    loadChildren();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedChildId) {
      loadQuizResults(selectedChildId);
    }
  }, [selectedChildId]);

  const loadChildren = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/v1/api/users/children');
      setChildren(response.data || []);
      if (response.data && response.data.length > 0) {
        setSelectedChildId(response.data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load children:', err);
      setError('Failed to load children. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizResults = async (childId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.get(
        `/v1/api/gamification/quiz-attempts?studentId=${childId}`
      );
      setQuizAttempts(response.data || []);
    } catch (err: any) {
      console.error('Failed to load quiz results:', err);
      setError('Failed to load quiz results. Please try again.');
      setQuizAttempts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-50';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-4 w-4" />;
    if (percentage >= 60) return <Award className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const averageScore =
    quizAttempts.length > 0
      ? Math.round(
          quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length
        )
      : 0;

  if (!user || user.role !== UserRole.PARENT) {
    return null;
  }

  return (
    <ParentLayout>
      <div>
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
          <button
            onClick={() => navigate('/parent/dashboard')}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
          <p className="text-indigo-700 font-medium">
            View your children's quiz performance and progress
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="bg-white rounded-xl shadow-md border-l-4 border-indigo-500 p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">Select Child</label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="w-full md:w-64 px-4 py-3 border-2 border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50 text-gray-900 font-medium"
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {isLoading && !selectedChild ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : selectedChild ? (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border-l-4 border-blue-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-indigo-700 mb-1">Total Quizzes</p>
                    <p className="text-3xl font-bold text-gray-900">{quizAttempts.length}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md border-l-4 border-green-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-green-700 mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900">{averageScore}%</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md border-l-4 border-purple-500 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-purple-700 mb-1">Student</p>
                    <p className="text-xl font-bold text-gray-900">{selectedChild.name}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                    <User className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Results List */}
            <div className="bg-white rounded-xl shadow-md border border-indigo-100">
              <div className="p-6 border-b-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-xl">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedChild.name}'s Quiz History
                </h2>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : quizAttempts.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No quiz results found for {selectedChild.name}</p>
                </div>
              ) : (
                <div className="divide-y divide-indigo-100">
                  {quizAttempts.map((attempt) => (
                    <div key={attempt.id} className="p-6 hover:bg-indigo-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-lg font-bold text-gray-900">{attempt.quizTitle}</h3>
                            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-full shadow-sm">
                              {attempt.subject}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center font-medium">
                              <Clock className="h-4 w-4 mr-1 text-indigo-600" />
                              {formatTime(attempt.timeSpent)}
                            </span>
                            <span className="text-indigo-700">
                              {formatDate(attempt.completedAt)}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            Score: <span className="text-indigo-600">{attempt.score}</span> /{' '}
                            <span className="text-gray-500">{attempt.totalPoints}</span> points
                          </div>
                        </div>
                        <div
                          className={`flex items-center space-x-2 px-5 py-3 rounded-xl shadow-md ${getScoreColor(attempt.percentage)}`}
                        >
                          {getScoreIcon(attempt.percentage)}
                          <span className="font-bold text-lg">{attempt.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No children found. Please contact support if this is an error.
            </p>
          </div>
        )}
      </div>
    </ParentLayout>
  );
};
