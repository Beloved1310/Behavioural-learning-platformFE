import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { MainLayout } from '../components/layout';
import { adminService, DashboardStats } from '../services/adminService';
import { Users, UserCheck, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { TutorApprovalQueue } from '../components/admin/TutorApprovalQueue';
import { UserManagement } from '../components/admin/UserManagement';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'users'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role !== UserRole.ADMIN) {
      navigate('/dashboard');
      return;
    }

    loadDashboardStats();
  }, [user, navigate]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard stats');
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage tutors, users, and platform settings</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('tutors')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tutors'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Tutor Approvals
                {stats && stats.pendingTutors > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-full">
                    {stats.pendingTutors}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                User Management
              </button>
            </nav>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                      </div>
                      <Users className="h-12 w-12 text-purple-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Students</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.totalStudents}
                        </p>
                      </div>
                      <UserCheck className="h-12 w-12 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Verified Tutors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.verifiedTutors}
                        </p>
                      </div>
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Tutors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.pendingTutors}
                        </p>
                      </div>
                      <AlertCircle className="h-12 w-12 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Tutors</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalTutors}</p>
                      </div>
                      <UserCheck className="h-12 w-12 text-indigo-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Parents</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                          {stats.totalParents}
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-pink-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users (30d)</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeUsers}</p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-green-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('tutors')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <Clock className="h-6 w-6 text-purple-500 mb-2" />
                    <h3 className="font-semibold text-gray-900">Review Pending Tutors</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats?.pendingTutors || 0} tutors awaiting approval
                    </p>
                  </button>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                  >
                    <Users className="h-6 w-6 text-purple-500 mb-2" />
                    <h3 className="font-semibold text-gray-900">Manage Users</h3>
                    <p className="text-sm text-gray-600 mt-1">View and manage all platform users</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tutors' && <TutorApprovalQueue onRefresh={loadDashboardStats} />}

          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </MainLayout>
  );
};
