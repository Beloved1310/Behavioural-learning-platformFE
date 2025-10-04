import React, { useState, useEffect } from 'react';
import { useExportData } from '../../store/analyticsStore';
import { useAuthStore } from '../../store/authStore';
import { ExportOptions, ExportResult, UserRole } from '../../types';
import {
  Download,
  FileText,
  File,
  Calendar,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Filter,
  Plus,
  Loader2
} from 'lucide-react';

export const DataExportCenter: React.FC = () => {
  const { user } = useAuthStore();
  const { exportHistory, exportData, fetchExportHistory } = useExportData();
  const [isLoading, setIsLoading] = useState(false);
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    },
    includeCharts: true,
    sections: []
  });

  useEffect(() => {
    if (user) {
      fetchExportHistory(user.id);
    }
  }, [user]);

  const getAvailableSections = () => {
    const sections = [];

    if (user?.role === UserRole.STUDENT || user?.role === UserRole.ADMIN) {
      sections.push(
        { id: 'student-progress', name: 'Student Progress Reports', icon: '📊' },
        { id: 'quiz-performance', name: 'Quiz Performance', icon: '🧩' },
        { id: 'study-hours', name: 'Study Hours & Attendance', icon: '⏰' }
      );
    }

    if (user?.role === UserRole.TUTOR || user?.role === UserRole.ADMIN) {
      sections.push(
        { id: 'tutor-performance', name: 'Tutor Performance Analytics', icon: '👨‍🏫' },
        { id: 'student-feedback', name: 'Student Feedback', icon: '💬' },
        { id: 'earnings', name: 'Earnings Report', icon: '💰' }
      );
    }

    if (user?.role === UserRole.PARENT) {
      sections.push(
        { id: 'family-progress', name: 'Family Progress Overview', icon: '👨‍👩‍👧‍👦' },
        { id: 'spending-report', name: 'Spending Report', icon: '💳' },
        { id: 'activity-log', name: 'Activity Log', icon: '📝' }
      );
    }

    if (user?.role === UserRole.ADMIN) {
      sections.push(
        { id: 'platform-metrics', name: 'Platform Usage Metrics', icon: '📈' },
        { id: 'user-analytics', name: 'User Analytics', icon: '👥' },
        { id: 'financial-reports', name: 'Financial Reports', icon: '💹' }
      );
    }

    return sections;
  };

  const availableSections = getAvailableSections();

  const handleExport = async () => {
    if (exportOptions.sections.length === 0) {
      alert('Please select at least one section to export.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await exportData(exportOptions);
      setShowExportForm(false);

      // Reset form
      setExportOptions(prev => ({
        ...prev,
        sections: []
      }));

      // Show success message
      alert(`Export completed! Your ${result.format.toUpperCase()} file is ready for download.`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionToggle = (sectionId: string) => {
    setExportOptions(prev => ({
      ...prev,
      sections: prev.sections.includes(sectionId)
        ? prev.sections.filter(id => id !== sectionId)
        : [...prev.sections, sectionId]
    }));
  };

  const getStatusIcon = (status: ExportResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'generating':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'csv':
        return <File className="h-5 w-5 text-green-500" />;
      case 'excel':
        return <File className="h-5 w-5 text-blue-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Download className="h-6 w-6" />
            Data Export Center
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Export your data in PDF, CSV, or Excel formats
          </p>
        </div>

        <button
          onClick={() => setShowExportForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Export
        </button>
      </div>

      {/* Export Form Modal */}
      {showExportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Create Data Export</h3>
                <button
                  onClick={() => setShowExportForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['pdf', 'csv', 'excel'] as const).map((format) => (
                      <button
                        key={format}
                        onClick={() => setExportOptions(prev => ({ ...prev, format }))}
                        className={`p-3 border rounded-lg text-center transition-colors ${
                          exportOptions.format === format
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {getFormatIcon(format)}
                        <span className="block text-sm font-medium mt-1 capitalize">{format}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={exportOptions.dateRange.startDate}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, startDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={exportOptions.dateRange.endDate}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, endDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Sections Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Sections to Include
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSections.map((section) => (
                      <label
                        key={section.id}
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                          exportOptions.sections.includes(section.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={exportOptions.sections.includes(section.id)}
                          onChange={() => handleSectionToggle(section.id)}
                          className="sr-only"
                        />
                        <span className="text-lg mr-3">{section.icon}</span>
                        <span className="text-sm font-medium text-gray-900">{section.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Export Options</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeCharts}
                        onChange={(e) => setExportOptions(prev => ({
                          ...prev,
                          includeCharts: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Include charts and visualizations</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowExportForm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isLoading || exportOptions.sections.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isLoading ? 'Creating Export...' : 'Create Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export History */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Export History</h3>
          <p className="text-sm text-gray-600 mt-1">Your recent data exports and downloads</p>
        </div>

        {exportHistory.length === 0 ? (
          <div className="text-center py-12">
            <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No exports yet</h4>
            <p className="text-gray-600 mb-6">Create your first data export to get started.</p>
            <button
              onClick={() => setShowExportForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Export
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {exportHistory.map((exportItem) => (
              <div key={exportItem.id} className="p-4 sm:p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getFormatIcon(exportItem.format)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {exportItem.fileName}
                      </h4>
                      <div className="flex items-center mt-1 text-xs text-gray-500 space-x-4">
                        <span>{formatFileSize(exportItem.size)}</span>
                        <span>•</span>
                        <span>Created {new Date(exportItem.createdAt).toLocaleDateString()}</span>
                        {isExpired(exportItem.expiresAt) ? (
                          <span className="text-red-600">• Expired</span>
                        ) : (
                          <span>• Expires {new Date(exportItem.expiresAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {getStatusIcon(exportItem.status)}
                      <span className="ml-1 text-xs text-gray-600 capitalize">
                        {exportItem.status}
                      </span>
                    </div>

                    {exportItem.status === 'completed' && !isExpired(exportItem.expiresAt) && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(exportItem.downloadUrl, '_blank')}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = exportItem.downloadUrl;
                            link.download = exportItem.fileName;
                            link.click();
                          }}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      </div>
                    )}

                    {(exportItem.status === 'failed' || isExpired(exportItem.expiresAt)) && (
                      <button
                        onClick={() => {/* Handle delete */}}
                        className="inline-flex items-center px-2 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Export Guidelines
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>• PDF exports include charts, graphs, and formatted reports suitable for printing and sharing</p>
          <p>• CSV exports contain raw data that can be opened in spreadsheet applications</p>
          <p>• Excel exports include both data and basic formatting for advanced analysis</p>
          <p>• All export files are available for download for 7 days after creation</p>
          <p>• Large exports may take a few minutes to generate depending on the date range and sections selected</p>
        </div>
      </div>
    </div>
  );
};