import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TutorLayout } from '../components/layout/TutorLayout';
import { tutorStudentsService, StudentProgress } from '../services/tutorStudentsService';
import {
  Search,
  Filter,
  Users,
  Flame,
  Target,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  MessageSquare,
  Eye,
} from 'lucide-react';
import { Pagination } from '../components/ui/Pagination';

export const TutorStudents: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'on-track' | 'needs-attention' | 'at-risk'
  >('all');
  const [sortBy, setSortBy] = useState<'name' | 'streak' | 'consistency' | 'lastLogin'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    loadStudents();
  }, [currentPage]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchQuery, statusFilter, sortBy]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const result = await tutorStudentsService.getAllStudentsProgress(currentPage, 10);
      setStudents(result.students);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) || student.email.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'streak':
          return b.streak - a.streak;
        case 'consistency':
          return b.consistencyScore - a.consistencyScore;
        case 'lastLogin':
          const aDate = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const bDate = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          return bDate - aDate;
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'border-green-200 bg-green-50';
      case 'needs-attention':
        return 'border-yellow-200 bg-yellow-50';
      case 'at-risk':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-track':
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
            🟢 On Track
          </span>
        );
      case 'needs-attention':
        return (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
            🟡 Needs Attention
          </span>
        );
      case 'at-risk':
        return (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
            🔴 At Risk
          </span>
        );
      default:
        return null;
    }
  };

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
                <span className="truncate">Student Management</span>
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage and monitor all your students
              </p>
            </div>
            <button
              onClick={() => navigate('/tutor/students/onboard')}
              className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 font-medium flex items-center justify-center space-x-2 text-sm sm:text-base flex-shrink-0"
            >
              <Users className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="on-track">On Track</option>
                  <option value="needs-attention">Needs Attention</option>
                  <option value="at-risk">At Risk</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="name">Name</option>
                  <option value="streak">Streak</option>
                  <option value="consistency">Consistency</option>
                  <option value="lastLogin">Last Login</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">No students found</p>
            <p className="text-gray-500 text-sm sm:text-base">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first student'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/tutor/students/onboard')}
                className="mt-4 bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm sm:text-base"
              >
                Add Student
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`p-4 sm:p-5 rounded-lg sm:rounded-xl border-2 ${getStatusColor(student.status)} hover:shadow-lg transition-all`}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                      {student.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{student.email}</p>
                  </div>
                  <div className="flex-shrink-0">{getStatusBadge(student.status)}</div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Flame className="w-4 h-4" />
                      <span>Streak</span>
                    </span>
                    <span className="font-bold text-gray-900">{student.streak} days</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>Goals</span>
                    </span>
                    <span className="font-bold text-gray-900">{student.goalProgress}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Commitments</span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {student.commitmentsCompleted}/{student.commitmentsTotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Consistency</span>
                    </span>
                    <span className="font-bold text-gray-900">{student.consistencyScore}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>Last Login</span>
                    </span>
                    <span className="font-medium text-gray-700">
                      {formatLastLogin(student.lastLoginAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => navigate(`/tutor/chat?student=${student.id}`)}
                    className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-lg hover:bg-blue-600 text-xs sm:text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Message</span>
                  </button>
                  <button
                    onClick={() => navigate(`/tutor/students/${student.id}`)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 text-xs sm:text-sm font-medium flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>View</span>
                  </button>
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
