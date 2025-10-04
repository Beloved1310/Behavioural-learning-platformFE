import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EnhancedComponentLoader } from '../components/common/SkeletonLoaders';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import {
  BarChart3,
  Users,
  TrendingUp,
  Download,
  User,
  Activity,
  Calendar,
  Award
} from 'lucide-react';

// Lazy-loaded Analytics Components
const StudentProgressReports = lazy(() => import('../components/analytics/StudentProgressReports').then(module => ({ default: module.StudentProgressReports })));
const TutorPerformanceAnalytics = lazy(() => import('../components/analytics/TutorPerformanceAnalytics').then(module => ({ default: module.TutorPerformanceAnalytics })));
const PlatformUsageMetrics = lazy(() => import('../components/analytics/PlatformUsageMetrics').then(module => ({ default: module.PlatformUsageMetrics })));
const DataExportCenter = lazy(() => import('../components/analytics/DataExportCenter').then(module => ({ default: module.DataExportCenter })));
const ParentalDashboard = lazy(() => import('../components/analytics/ParentalDashboard').then(module => ({ default: module.ParentalDashboard })));

type AnalyticsTab = 'overview' | 'student-reports' | 'tutor-analytics' | 'platform-metrics' | 'export-center' | 'parental-dashboard';

const getLoadingMessage = (tabId: string): string => {
  const messages: Record<string, string> = {
    'overview': 'Loading analytics overview...',
    'student-reports': 'Loading student progress reports...',
    'tutor-analytics': 'Loading tutor performance analytics...',
    'platform-metrics': 'Loading platform usage metrics...',
    'export-center': 'Loading export center...',
    'parental-dashboard': 'Loading parental dashboard...'
  };
  return messages[tabId] || 'Loading analytics...';
};

export const Analytics: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');

  // Determine available tabs based on user role
  const getAvailableTabs = () => {
    const baseTabs = [
      {
        id: 'overview' as AnalyticsTab,
        name: 'Overview',
        icon: BarChart3,
        available: true,
        description: 'Analytics dashboard overview'
      }
    ];

    if (user?.role === UserRole.STUDENT || user?.role === UserRole.ADMIN) {
      baseTabs.push({
        id: 'student-reports' as AnalyticsTab,
        name: 'Progress Reports',
        icon: User,
        available: true,
        description: 'Individual student progress analysis'
      });
    }

    if (user?.role === UserRole.TUTOR || user?.role === UserRole.ADMIN) {
      baseTabs.push({
        id: 'tutor-analytics' as AnalyticsTab,
        name: 'Tutor Performance',
        icon: Users,
        available: true,
        description: 'Tutor performance metrics and feedback'
      });
    }

    if (user?.role === UserRole.ADMIN) {
      baseTabs.push({
        id: 'platform-metrics' as AnalyticsTab,
        name: 'Platform Metrics',
        icon: TrendingUp,
        available: true,
        description: 'Platform usage and engagement data'
      });
    }

    baseTabs.push({
      id: 'export-center' as AnalyticsTab,
      name: 'Export Center',
      icon: Download,
      available: true,
      description: 'Export reports and data'
    });

    if (user?.role === UserRole.PARENT) {
      baseTabs.push({
        id: 'parental-dashboard' as AnalyticsTab,
        name: 'Family Dashboard',
        icon: Activity,
        available: true,
        description: "Monitor your children's progress"
      });
    }

    return baseTabs;
  };

  const tabs = getAvailableTabs();

  // Set default tab based on user role
  useEffect(() => {
    if (user?.role === UserRole.PARENT) {
      setActiveTab('parental-dashboard');
    } else if (user?.role === UserRole.STUDENT) {
      setActiveTab('student-reports');
    } else if (user?.role === UserRole.TUTOR) {
      setActiveTab('tutor-analytics');
    }
  }, [user?.role]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsOverview />;
      case 'student-reports':
        return <StudentProgressReports />;
      case 'tutor-analytics':
        return <TutorPerformanceAnalytics />;
      case 'platform-metrics':
        return <PlatformUsageMetrics />;
      case 'export-center':
        return <DataExportCenter />;
      case 'parental-dashboard':
        return <ParentalDashboard />;
      default:
        return <AnalyticsOverview />;
    }
  };

  const handleKeyNavigation = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const nextIndex = e.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : (index - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIndex].id);
      setTimeout(() => {
        const nextTab = document.querySelector(`button[data-tab="${tabs[nextIndex].id}"]`) as HTMLButtonElement;
        nextTab?.focus();
      }, 0);
    }
  };

  return (
    <MainLayout>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Analytics & Reporting
                </h1>
              </div>
              <p className="text-sm sm:text-base text-gray-600">
                Comprehensive insights into learning progress, performance, and platform usage
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200 mb-6 sm:mb-8">
              <nav
                className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-6 overflow-x-auto scrollbar-hide"
                role="tablist"
                aria-label="Analytics Navigation"
              >
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      onKeyDown={(e) => handleKeyNavigation(e, index)}
                      className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 py-3 sm:py-4 px-3 sm:px-4 lg:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-0 flex-shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white active:scale-95 touch-manipulation ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 bg-blue-50 sm:bg-transparent'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent active:bg-gray-100'
                      }`}
                      aria-selected={activeTab === tab.id}
                      aria-controls={`tabpanel-${tab.id}`}
                      aria-label={`${tab.name} tab`}
                      data-tab={tab.id}
                      role="tab"
                      tabIndex={activeTab === tab.id ? 0 : -1}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-0 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs sm:text-sm truncate max-w-24 sm:max-w-none">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div
              className="bg-white rounded-lg shadow-sm overflow-hidden touch-pan-y"
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              tabIndex={0}
            >
              <div className="p-4 sm:p-6 lg:p-8">
                <Suspense fallback={
                  <EnhancedComponentLoader
                    message={getLoadingMessage(activeTab)}
                    size="md"
                  />
                }>
                  {renderTabContent()}
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
};

// Analytics Overview Component
const AnalyticsOverview: React.FC = () => {
  const { user } = useAuthStore();

  const quickStats = [
    {
      title: 'Total Reports',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Calendar,
      description: 'Generated this month'
    },
    {
      title: 'Active Users',
      value: '1,247',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
      description: 'Currently engaged'
    },
    {
      title: 'Platform Score',
      value: '94%',
      change: '+2%',
      changeType: 'positive' as const,
      icon: Award,
      description: 'Overall satisfaction'
    }
  ];

  const getQuickActions = () => {
    const actions = [];

    if (user?.role === UserRole.STUDENT || user?.role === UserRole.ADMIN) {
      actions.push({
        title: 'Generate Progress Report',
        description: 'Create a detailed progress analysis',
        icon: User,
        color: 'blue' as const,
        action: () => document.querySelector('[data-tab="student-reports"]')?.click()
      });
    }

    if (user?.role === UserRole.TUTOR || user?.role === UserRole.ADMIN) {
      actions.push({
        title: 'View Performance Metrics',
        description: 'Check tutor analytics and feedback',
        icon: TrendingUp,
        color: 'green' as const,
        action: () => document.querySelector('[data-tab="tutor-analytics"]')?.click()
      });
    }

    if (user?.role === UserRole.PARENT) {
      actions.push({
        title: 'Family Dashboard',
        description: "Monitor your children's progress",
        icon: Activity,
        color: 'purple' as const,
        action: () => document.querySelector('[data-tab="parental-dashboard"]')?.click()
      });
    }

    actions.push({
      title: 'Export Data',
      description: 'Download reports in PDF or CSV format',
      icon: Download,
      color: 'orange' as const,
      action: () => document.querySelector('[data-tab="export-center"]')?.click()
    });

    return actions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
          Analytics Overview
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Quick insights and access to detailed analytics across the platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  stat.changeType === 'positive'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm font-medium text-gray-900">{stat.title}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
              green: 'bg-green-50 border-green-200 hover:bg-green-100',
              purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
              orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100'
            };

            return (
              <button
                key={index}
                onClick={action.action}
                className={`text-left p-4 sm:p-6 border rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${colorClasses[action.color]}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    action.color === 'blue' ? 'bg-blue-100' :
                    action.color === 'green' ? 'bg-green-100' :
                    action.color === 'purple' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      action.color === 'blue' ? 'text-blue-600' :
                      action.color === 'green' ? 'text-green-600' :
                      action.color === 'purple' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;