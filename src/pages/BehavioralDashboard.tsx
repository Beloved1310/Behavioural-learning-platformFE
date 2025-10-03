import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/';
import { MoodTracker } from '../components/behavioral/MoodTracker';
import { BehavioralInsights } from '../components/behavioral/BehavioralInsights';
import { StudyConsistencyAnalysis } from '../components/behavioral/StudyConsistencyAnalysis';
import { MotivationalSystem } from '../components/behavioral/MotivationalSystem';
import { SentimentAnalysis } from '../components/behavioral/SentimentAnalysis';
import { AdaptiveContentDelivery } from '../components/behavioral/AdaptiveContentDelivery';
import { ProgressReports } from '../components/behavioral/ProgressReports';
import { useBehavioralTracking } from '../hooks/useBehavioralTracking';
import { useAuthStore } from '../store/authStore';

export const BehavioralDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const { user } = useAuthStore();
  const { trackCustomEvent } = useBehavioralTracking(user?.id || '');

  useEffect(() => {
    trackCustomEvent('page_view', { page: 'behavioral_dashboard', timestamp: new Date() });
  }, [trackCustomEvent]);

  const handleMoodLogged = (mood: string, intensity: number) => {
    trackCustomEvent('mood_logged', { mood, intensity, page: 'behavioral_dashboard' });
    setShowMoodTracker(false);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', emoji: '🌟' },
    { id: 'insights', name: 'Insights', emoji: '🧠' },
    { id: 'consistency', name: 'Consistency', emoji: '📊' },
    { id: 'mood', name: 'Mood & Feelings', emoji: '💭' },
    { id: 'content', name: 'Recommendations', emoji: '✨' },
    { id: 'reports', name: 'Progress Reports', emoji: '📈' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">
              Your Learning Journey 🚀
            </h1>
            <p className="text-amber-600 mt-1">
              Discover insights about how you learn best!
            </p>
          </div>
          <button
            onClick={() => setShowMoodTracker(!showMoodTracker)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 flex items-center"
          >
            <span className="mr-2">💭</span>
            Log My Mood
          </button>
        </div>

        {/* Motivational System - Always visible at top */}
        <MotivationalSystem maxPrompts={3} />

        {/* Quick Mood Tracker */}
        {showMoodTracker && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-200">
            <MoodTracker
              onMoodLogged={handleMoodLogged}
              className="border-none shadow-none"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex flex-wrap border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-purple-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.emoji}</span>
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <BehavioralInsights maxInsights={4} />
                  <AdaptiveContentDelivery maxContent={4} />
                </div>
                <StudyConsistencyAnalysis />
              </div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <BehavioralInsights maxInsights={10} />
            )}

            {/* Consistency Tab */}
            {activeTab === 'consistency' && (
              <StudyConsistencyAnalysis />
            )}

            {/* Mood Tab */}
            {activeTab === 'mood' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <MoodTracker onMoodLogged={handleMoodLogged} />
                  <SentimentAnalysis />
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === 'content' && (
              <AdaptiveContentDelivery maxContent={12} />
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <ProgressReports reportType="both" />
            )}
          </div>
        </div>

        {/* Footer Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center text-sm text-blue-800">
            <span className="text-lg mr-2">💡</span>
            <div>
              <p className="font-semibold mb-1">Learning Tip:</p>
              <p>
                The more you use the app, the better we understand how you learn best!
                Keep logging your moods and completing sessions to get more personalized insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};