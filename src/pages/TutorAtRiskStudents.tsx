import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { tutorStudentsService, AtRiskStudent } from '../services/tutorStudentsService';
import { AlertCircle, User, MessageSquare, Eye, TrendingDown, Clock } from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';

export const TutorAtRiskStudents: React.FC = () => {
  const navigate = useNavigate();
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    loadAtRiskStudents();
    // Refresh every 30 seconds
    const interval = setInterval(loadAtRiskStudents, 30000);
    return () => clearInterval(interval);
  }, [currentPage]);

  const loadAtRiskStudents = async () => {
    try {
      setLoading(true);
      const data = await tutorStudentsService.getAtRiskStudents();
      setAtRiskStudents(data);
      // If pagination is needed in the future, update this
      setPagination(null);
    } catch (error) {
      console.error('Failed to load at-risk students:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'attention':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'monitor':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
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

  return (
    <TutorLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center space-x-2">
                  <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span>At-Risk Students</span>
                </h1>
                <p className="text-red-100 mt-1 text-sm sm:text-base">
                  Students who need immediate attention and support
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/30">
                <div className="text-white/80 text-xs sm:text-sm font-medium">Total At-Risk</div>
                <div className="text-white text-xl sm:text-2xl font-bold">
                  {atRiskStudents.length}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students List */}
        {atRiskStudents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              No At-Risk Students
            </h3>
            <p className="text-gray-600 text-sm sm:text-base">
              Great news! All your students are doing well. 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {atRiskStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-4 sm:p-6 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 gap-2 sm:gap-0 mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
                          {student.name?.[0] || 'S'}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-600">{student.email}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto border ${getPriorityColor(
                          student.priority || 'attention'
                        )}`}
                      >
                        {student.priority?.toUpperCase() || 'ATTENTION'}
                      </span>
                    </div>

                    <div className="bg-red-50 rounded-lg p-3 sm:p-4 mb-3">
                      <div className="flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm sm:text-base text-red-800 font-medium">
                          {student.reason || 'Student needs attention'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                        <TrendingDown className="w-4 h-4 flex-shrink-0 text-red-500" />
                        <span>
                          <span className="font-medium">Streak:</span> {student.streak || 0} days
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 text-sm sm:text-base">
                        <Clock className="w-4 h-4 flex-shrink-0 text-gray-500" />
                        <span>
                          <span className="font-medium">Last Login:</span>{' '}
                          {formatLastLogin(student.lastLoginAt)}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Consistency:</span>{' '}
                        {student.consistencyScore || 0}%
                      </div>
                      <div className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Status:</span>{' '}
                        <span className="text-red-600 font-semibold">At Risk</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:ml-4 flex-shrink-0">
                    <button
                      onClick={() => navigate(`/tutor/chat?student=${student.id}`)}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => navigate(`/tutor/students/${student.id}`)}
                      className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 border-2 border-purple-200 text-purple-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              pagination={pagination}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </div>
    </TutorLayout>
  );
};

