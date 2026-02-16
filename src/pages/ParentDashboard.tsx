import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParentLayout } from '../components/layout/ParentLayout';
import { useAuthStore } from '../store/authStore';
import { ParentalDashboard } from '../components/analytics/ParentalDashboard';
import {
  CreditCard,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import { UserRole } from '../types';

export const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role !== UserRole.PARENT) {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  if (!user || user.role !== UserRole.PARENT) {
    return null;
  }

  return (
    <ParentLayout>
      <div>
        {/* Header */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-600">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.firstName}!</h1>
          <p className="text-indigo-700 font-medium">
            Monitor your children's learning progress and manage your account
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/analytics?tab=parental-dashboard')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all text-left border-l-4 border-green-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg mb-1">Progress Reports</div>
                <div className="text-sm text-gray-600">View detailed student progress</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/parent/quiz-results')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all text-left border-l-4 border-purple-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg mb-1">Quiz Results</div>
                <div className="text-sm text-gray-600">View children's quiz performance</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/payment')}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all text-left border-l-4 border-blue-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 text-lg mb-1">Payment Center</div>
                <div className="text-sm text-gray-600">Manage payments & subscriptions</div>
              </div>
            </div>
          </button>
        </div>

        {/* Main Dashboard Content */}
        <div className="bg-white rounded-xl shadow-md border border-indigo-100 p-6">
          <ParentalDashboard />
        </div>
      </div>
    </ParentLayout>
  );
};
