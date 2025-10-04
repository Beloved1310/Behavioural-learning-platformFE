import React, { useState, useEffect } from 'react';
import { usePlatformMetrics } from '../../store/analyticsStore';
import { PlatformUsageMetrics } from '../../types';
import {
  Users,
  Activity,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  BookOpen,
  FileText,
  Zap,
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart,
  Filter
} from 'lucide-react';

export const PlatformUsageMetrics: React.FC = () => {
  const { platformMetrics, fetchPlatformUsageMetrics } = usePlatformMetrics();
  const [selectedMetrics, setSelectedMetrics] = useState<PlatformUsageMetrics | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      await fetchPlatformUsageMetrics(dateRange.startDate, dateRange.endDate);
      setSelectedMetrics(platformMetrics);
    } catch (error) {
      console.error('Failed to load platform metrics:', error);
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

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedMetrics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Platform Metrics Available</h3>
        <p className="text-gray-600 mb-6">Load platform usage data to view comprehensive analytics.</p>
        <button
          onClick={loadMetrics}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Load Metrics
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Platform Usage Metrics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive analytics of platform usage, engagement, and performance
          </p>
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
            onClick={loadMetrics}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Update
          </button>
        </div>
      </div>

      {/* User Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedMetrics.userMetrics.totalUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedMetrics.userMetrics.activeUsers)}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              {selectedMetrics.userMetrics.userRetentionRate}% retention
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">New Users</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedMetrics.userMetrics.newRegistrations)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {selectedMetrics.userMetrics.userGrowthRate}% growth
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Daily Active</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedMetrics.engagementMetrics.dailyActiveUsers)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Active</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(selectedMetrics.engagementMetrics.monthlyActiveUsers)}</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Session & Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Sessions</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(selectedMetrics.sessionMetrics.totalSessions)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Session Duration</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatTime(selectedMetrics.sessionMetrics.averageSessionDuration)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${selectedMetrics.sessionMetrics.sessionCompletionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{selectedMetrics.sessionMetrics.sessionCompletionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Engagement Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Page Views</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatNumber(selectedMetrics.engagementMetrics.pageViews)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Time Spent</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatTime(selectedMetrics.engagementMetrics.averageTimeSpent)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <div className="flex items-center">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${selectedMetrics.engagementMetrics.bounceRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{selectedMetrics.engagementMetrics.bounceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Content Engagement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{formatNumber(selectedMetrics.contentMetrics.quizzesCompleted)}</p>
            <p className="text-sm text-blue-800">Quizzes Completed</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{formatNumber(selectedMetrics.contentMetrics.resourcesAccessed)}</p>
            <p className="text-sm text-green-800">Resources Accessed</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <MessageSquare className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{formatNumber(selectedMetrics.contentMetrics.messagesExchanged)}</p>
            <p className="text-sm text-purple-800">Messages Exchanged</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{formatNumber(selectedMetrics.contentMetrics.documentsShared)}</p>
            <p className="text-sm text-orange-800">Documents Shared</p>
          </div>
        </div>
      </div>

      {/* Device and Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Device Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(selectedMetrics.deviceMetrics).map(([device, percentage]) => (
              <div key={device} className="flex items-center">
                <div className="flex items-center w-20">
                  {getDeviceIcon(device)}
                  <span className="text-sm text-gray-600 ml-2 capitalize">{device}</span>
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {selectedMetrics.geographicDistribution.map((geo, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{geo.country}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${geo.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-900 w-16 text-right">
                    {formatNumber(geo.users)} ({geo.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Feature Usage
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedMetrics.featureUsage.map((feature, index) => (
            <div key={index} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{feature.feature}</h4>
                <div className="flex items-center">
                  {getTrendIcon(feature.trend)}
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Usage</span>
                  <span>{feature.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${feature.percentage}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{formatNumber(feature.usage)} interactions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Platform Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-2">
              <p className="text-2xl font-bold text-green-600">{selectedMetrics.performanceMetrics.averageLoadTime}s</p>
            </div>
            <p className="text-sm text-gray-600">Average Load Time</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-2">
              <p className="text-2xl font-bold text-blue-600">{selectedMetrics.performanceMetrics.uptime}%</p>
            </div>
            <p className="text-sm text-gray-600">Uptime</p>
          </div>

          <div className="text-center">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-2">
              <p className="text-2xl font-bold text-yellow-600">{(selectedMetrics.performanceMetrics.errorRate * 100).toFixed(2)}%</p>
            </div>
            <p className="text-sm text-gray-600">Error Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};