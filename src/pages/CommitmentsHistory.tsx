import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { commitmentsService } from '../services/commitmentsService';
import { ArrowLeft, Trash2, Calendar, Target } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../utils/logger';
import { getErrorMessage } from '../utils/errors';

interface CommitmentHistoryItem {
  id: string;
  weekStart: string;
  weekEnd: string;
  completionRate: number;
  totalCommitments: number;
  completedCommitments: number;
}

export const CommitmentsHistory: React.FC = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const [history, setHistory] = useState<CommitmentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await commitmentsService.getHistory();
      setHistory(data);
    } catch (error) {
      logger.error('Failed to load commitment history', error);
      showError('Failed to load commitment history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commitmentId: string) => {
    if (
      !confirm('Are you sure you want to delete this commitment? This action cannot be undone.')
    ) {
      return;
    }

    try {
      setDeletingId(commitmentId);
      await commitmentsService.deleteCommitment(commitmentId);
      await loadHistory(); // Reload history after deletion
    } catch (error) {
      logger.error('Failed to delete commitment', error);
      showError(getErrorMessage(error, 'Failed to delete commitment. Please try again.'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatWeekRange = (weekStart: string, weekEnd: string) => {
    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-3 sm:mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commitment History</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                View and manage your weekly commitments
              </p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
          {history.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No Commitments Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                Start setting weekly commitments to track your progress!
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-600 font-medium text-sm sm:text-base"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                          {formatWeekRange(item.weekStart, item.weekEnd)}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 gap-2 sm:gap-0 mt-2 sm:mt-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm text-gray-600">Completion:</span>
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {item.completedCommitments}/{item.totalCommitments}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs sm:text-sm text-gray-600">Rate:</span>
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              item.completionRate >= 80
                                ? 'text-green-600'
                                : item.completionRate >= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {item.completionRate}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                        <div
                          className={`h-1.5 sm:h-2 rounded-full transition-all duration-500 ${
                            item.completionRate >= 80
                              ? 'bg-green-500'
                              : item.completionRate >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }`}
                          style={{ width: `${item.completionRate}%` }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="ml-2 sm:ml-4 p-1.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                      title="Delete commitment"
                      aria-label="Delete commitment"
                    >
                      {deletingId === item.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
