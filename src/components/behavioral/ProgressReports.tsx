import React, { useEffect, useState } from 'react';
import { behavioralTrackingService } from '../../services/behavioralTrackingService';
import { useAuthStore } from '../../store/authStore';

interface ProgressReport {
  id: string;
  type: 'weekly' | 'monthly';
  period: string;
  generatedAt: Date;
  summary: {
    totalSessions: number;
    totalLearningTime: number; // minutes
    averageSessionLength: number;
    streakDays: number;
    completedGoals: number;
    totalGoals: number;
    improvementAreas: string[];
    achievements: string[];
  };
  detailed: {
    subjectProgress: { subject: string; sessions: number; improvement: number; emoji: string }[];
    weeklyBreakdown: { week: string; sessions: number; hours: number }[];
    moodAnalysis: {
      averageMood: number;
      moodTrend: 'improving' | 'stable' | 'concerning';
      positiveFactors: string[];
    };
    recommendations: string[];
    nextWeekGoals: string[];
  };
  highlights: string[];
  parentNote?: string;
}

interface ProgressReportsProps {
  className?: string;
  reportType?: 'weekly' | 'monthly' | 'both';
}

export const ProgressReports: React.FC<ProgressReportsProps> = ({
  className = '',
  reportType = 'both'
}) => {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ProgressReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadReports = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const weeklyReports = await behavioralTrackingService.generateWeeklyReport(user.id);
        const monthlyReports = await behavioralTrackingService.generateMonthlyReport(user.id);

        const allReports = [];
        if (reportType === 'weekly' || reportType === 'both') {
          allReports.push(weeklyReports);
        }
        if (reportType === 'monthly' || reportType === 'both') {
          allReports.push(monthlyReports);
        }

        setReports(allReports.filter(Boolean));
        if (allReports.length > 0) {
          setSelectedReport(allReports[0]);
        }
      } catch (error) {
        console.error('Failed to load progress reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [user?.id, reportType]);

  const generateNewReport = async (type: 'weekly' | 'monthly') => {
    if (!user?.id) return;

    try {
      setGenerating(true);
      const newReport = type === 'weekly'
        ? await behavioralTrackingService.generateWeeklyReport(user.id)
        : await behavioralTrackingService.generateMonthlyReport(user.id);

      if (newReport) {
        setReports(prev => [newReport, ...prev]);
        setSelectedReport(newReport);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '🤩';
    if (mood >= 6) return '😊';
    if (mood >= 4) return '🙂';
    if (mood >= 2) return '😐';
    return '😔';
  };

  const getTrendEmoji = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'stable': return '📊';
      case 'concerning': return '📉';
      default: return '📊';
    }
  };

  const getProgressColor = (improvement: number) => {
    if (improvement > 20) return 'text-green-600 bg-green-100';
    if (improvement > 0) return 'text-blue-600 bg-blue-100';
    if (improvement > -10) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-purple-900 mb-2">Getting Your Reports Ready!</h3>
          <p className="text-amber-600 mb-4">Keep learning to generate your first progress report!</p>
          <button
            onClick={() => generateNewReport('weekly')}
            disabled={generating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Report Selection */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-900">Your Progress Reports 📊</h3>
          <p className="text-amber-600">Track your amazing learning journey!</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedReport?.id || ''}
            onChange={(e) => {
              const report = reports.find(r => r.id === e.target.value);
              if (report) setSelectedReport(report);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {reports.map(report => (
              <option key={report.id} value={report.id}>
                {report.type === 'weekly' ? '📅' : '📊'} {report.period}
              </option>
            ))}
          </select>
          <button
            onClick={() => generateNewReport('weekly')}
            disabled={generating}
            className="bg-purple-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-600 transition-colors disabled:opacity-50"
          >
            {generating ? '⏳' : '🔄'} New
          </button>
        </div>
      </div>

      {selectedReport && (
        <div className="space-y-6">
          {/* Summary Overview */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-2xl font-bold">
                  {selectedReport.type === 'weekly' ? '📅 Weekly' : '📊 Monthly'} Report
                </h4>
                <p className="text-purple-100">{selectedReport.period}</p>
              </div>
              <div className="text-4xl opacity-80">🌟</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedReport.summary.totalSessions}</div>
                <div className="text-xs text-purple-200">Learning Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Math.floor(selectedReport.summary.totalLearningTime / 60)}h{' '}
                  {selectedReport.summary.totalLearningTime % 60}m
                </div>
                <div className="text-xs text-purple-200">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{selectedReport.summary.streakDays}</div>
                <div className="text-xs text-purple-200">Streak Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {selectedReport.summary.completedGoals}/{selectedReport.summary.totalGoals}
                </div>
                <div className="text-xs text-purple-200">Goals Achieved</div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h4 className="font-bold text-purple-900 mb-3 flex items-center">
              <span className="text-xl mr-2">✨</span>
              This {selectedReport.type}'s Highlights
            </h4>
            <div className="space-y-2">
              {selectedReport.highlights.map((highlight, index) => (
                <div key={index} className="flex items-center text-sm text-purple-800">
                  <span className="text-yellow-600 mr-2">⭐</span>
                  {highlight}
                </div>
              ))}
            </div>
          </div>

          {/* Subject Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-purple-900 mb-4 flex items-center">
              <span className="text-xl mr-2">📚</span>
              Subject Progress
            </h4>
            <div className="space-y-3">
              {selectedReport.detailed.subjectProgress.map((subject) => (
                <div key={subject.subject} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{subject.emoji}</span>
                    <div>
                      <div className="font-medium text-purple-900">{subject.subject}</div>
                      <div className="text-xs text-gray-600">{subject.sessions} sessions completed</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getProgressColor(subject.improvement)}`}>
                    {subject.improvement > 0 ? '+' : ''}{subject.improvement}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mood Analysis */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-purple-900 mb-4 flex items-center">
              <span className="text-xl mr-2">💭</span>
              How You've Been Feeling
            </h4>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{getMoodEmoji(selectedReport.detailed.moodAnalysis.averageMood)}</div>
                <div>
                  <div className="font-medium text-purple-900">
                    Average mood: {selectedReport.detailed.moodAnalysis.averageMood.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-amber-600 flex items-center">
                    {getTrendEmoji(selectedReport.detailed.moodAnalysis.moodTrend)}
                    <span className="ml-1 capitalize">{selectedReport.detailed.moodAnalysis.moodTrend}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedReport.detailed.moodAnalysis.positiveFactors.length > 0 && (
              <div>
                <h5 className="font-medium text-purple-900 mb-2">What made you happy:</h5>
                <div className="space-y-1">
                  {selectedReport.detailed.moodAnalysis.positiveFactors.map((factor, index) => (
                    <div key={index} className="flex items-center text-sm text-green-800">
                      <span className="text-green-500 mr-2">💚</span>
                      {factor}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-purple-900 mb-4 flex items-center">
              <span className="text-xl mr-2">💡</span>
              Recommendations for You
            </h4>
            <div className="space-y-3">
              {selectedReport.detailed.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-blue-600 mr-3 mt-1">💙</span>
                  <span className="text-purple-800 text-sm leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Week Goals */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h4 className="font-bold text-purple-900 mb-4 flex items-center">
              <span className="text-xl mr-2">🎯</span>
              Goals for Next {selectedReport.type === 'weekly' ? 'Week' : 'Month'}
            </h4>
            <div className="space-y-2">
              {selectedReport.detailed.nextWeekGoals.map((goal, index) => (
                <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                  <span className="text-green-600 mr-2">🎯</span>
                  <span className="text-purple-800 text-sm">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Parent Note (if available) */}
          {selectedReport.parentNote && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4 border border-pink-200">
              <h4 className="font-bold text-purple-900 mb-2 flex items-center">
                <span className="text-xl mr-2">👨‍👩‍👧‍👦</span>
                Note for Parents
              </h4>
              <p className="text-purple-800 text-sm leading-relaxed">{selectedReport.parentNote}</p>
            </div>
          )}

          {/* Report Info */}
          <div className="text-center text-xs text-gray-500">
            Report generated on {new Date(selectedReport.generatedAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};