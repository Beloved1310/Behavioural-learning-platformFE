import React, { useEffect, useState } from 'react';
import { behavioralTrackingService, BehavioralInsight } from '../../services/behavioralTrackingService';
import { useAuthStore } from '../../store/authStore';

interface InsightCardProps {
  insight: BehavioralInsight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'engagement': return '🎯';
      case 'streak': return '🔥';
      case 'improvement': return '📈';
      case 'achievement': return '🏆';
      case 'motivation': return '⭐';
      case 'consistency': return '📅';
      case 'mood': return '💭';
      case 'recommendation': return '💡';
      default: return '🌟';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'from-blue-400 to-blue-600';
      case 'streak': return 'from-orange-400 to-orange-600';
      case 'improvement': return 'from-green-400 to-green-600';
      case 'achievement': return 'from-purple-400 to-purple-600';
      case 'motivation': return 'from-yellow-400 to-yellow-600';
      case 'consistency': return 'from-pink-400 to-pink-600';
      case 'mood': return 'from-indigo-400 to-indigo-600';
      case 'recommendation': return 'from-teal-400 to-teal-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-400';
      case 'medium': return 'border-l-4 border-yellow-400';
      case 'low': return 'border-l-4 border-green-400';
      default: return 'border-l-4 border-blue-400';
    }
  };

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${getPriorityBorder(insight.priority)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 bg-gradient-to-br ${getInsightColor(insight.type)} rounded-xl flex items-center justify-center mr-4`}>
            <span className="text-xl text-white">{getInsightIcon(insight.type)}</span>
          </div>
          <div>
            <h3 className="font-bold text-purple-900 text-lg">{insight.title}</h3>
            <p className="text-sm text-amber-600 capitalize">{insight.type} • {insight.priority} priority</p>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(insight.timestamp).toLocaleDateString()}
        </div>
      </div>

      <p className="text-purple-800 mb-4 leading-relaxed">{insight.message}</p>

      {insight.actionItems && insight.actionItems.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-purple-900 text-sm mb-2">What you can do:</h4>
          <ul className="space-y-2">
            {insight.actionItems.map((item, index) => (
              <li key={index} className="flex items-center text-sm text-purple-700">
                <span className="text-green-500 mr-2">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.data && Object.keys(insight.data).length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mt-4">
          <div className="text-xs text-purple-700 space-y-1">
            {Object.entries(insight.data).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                <span className="font-semibold">{typeof value === 'number' ? value.toLocaleString() : String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface BehavioralInsightsProps {
  className?: string;
  maxInsights?: number;
}

export const BehavioralInsights: React.FC<BehavioralInsightsProps> = ({
  className = '',
  maxInsights = 10
}) => {
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const { user } = useAuthStore();

  useEffect(() => {
    const loadInsights = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const userInsights = await behavioralTrackingService.generateInsights(user.id);
        setInsights(userInsights.slice(0, maxInsights));
      } catch (err) {
        console.error('Failed to load behavioral insights:', err);
        setError('Unable to load insights right now. Try again later!');
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, [user?.id, maxInsights]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded-full mr-3"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">😅</div>
          <h3 className="text-lg font-bold text-purple-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-amber-600">{error}</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🌱</div>
          <h3 className="text-lg font-bold text-purple-900 mb-2">Keep Learning!</h3>
          <p className="text-amber-600">Use the app more to get personalized insights about your learning journey!</p>
        </div>
      </div>
    );
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedInsights = [...insights].sort((a, b) => {
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-lg">🧠</span>
          </div>
          <h2 className="text-2xl font-bold text-purple-900">Your Learning Insights</h2>
        </div>
        <div className="text-sm text-amber-600">
          Based on your activity
        </div>
      </div>

      <div className="space-y-6">
        {sortedInsights.map((insight, index) => (
          <InsightCard key={`${insight.id}-${index}`} insight={insight} />
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-center text-sm text-blue-800">
          <span className="text-lg mr-2">💡</span>
          <p>These insights are based on your learning patterns and help you become an even better learner!</p>
        </div>
      </div>
    </div>
  );
};