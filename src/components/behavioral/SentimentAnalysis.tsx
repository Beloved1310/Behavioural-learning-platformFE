import React, { useEffect, useState } from 'react';
import { behavioralTrackingService } from '../../services/behavioralTrackingService';
import { useAuthStore } from '../../store/authStore';

interface SentimentData {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
  moodTrends: {
    date: string;
    sentiment: number;
    mood: string;
    displayDate: string;
  }[];
  topPositiveTriggers: string[];
  concernAreas: string[];
  recommendations: string[];
}

interface SentimentAnalysisProps {
  className?: string;
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ className = '' }) => {
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const analyzeSentiment = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const analysis = await behavioralTrackingService.performSentimentAnalysis(user.id);
        setSentimentData(analysis);
      } catch (error) {
        console.error('Failed to analyze sentiment:', error);
      } finally {
        setLoading(false);
      }
    };

    analyzeSentiment();
  }, [user?.id]);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded mb-6"></div>
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!sentimentData) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <div className="text-center py-8">
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-lg font-bold text-purple-900 mb-2">Share Your Feelings!</h3>
          <p className="text-amber-600">Log your moods to see how you're feeling about learning!</p>
        </div>
      </div>
    );
  }

  const getSentimentEmoji = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentMessage = (sentiment: string, score: number) => {
    const percentage = Math.round((score + 1) * 50); // Convert -1,1 to 0,100

    switch (sentiment) {
      case 'positive':
        return `You're feeling great about learning! (${percentage}% positive)`;
      case 'negative':
        return `You might be having some challenges with learning (${percentage}% positive)`;
      default:
        return `Your feelings about learning are mixed (${percentage}% positive)`;
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      'excited': '🤩',
      'happy': '😊',
      'good': '🙂',
      'okay': '😐',
      'tired': '😴',
      'sad': '😢',
      'frustrated': '😤'
    };
    return moodEmojis[mood] || '🙂';
  };

  const maxSentiment = Math.max(...sentimentData.moodTrends.map(t => Math.abs(t.sentiment)));

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-900">How You Feel About Learning</h3>
          <p className="text-amber-600">Understanding your emotions helps us support you better!</p>
        </div>
        <div className="text-4xl">{getSentimentEmoji(sentimentData.overallSentiment)}</div>
      </div>

      {/* Overall Sentiment */}
      <div className={`p-4 rounded-xl mb-6 ${getSentimentColor(sentimentData.overallSentiment)}`}>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-lg mb-1">Overall Feeling</h4>
            <p className="text-sm">{getSentimentMessage(sentimentData.overallSentiment, sentimentData.sentimentScore)}</p>
          </div>
          <div className="text-3xl">{getSentimentEmoji(sentimentData.overallSentiment)}</div>
        </div>
      </div>

      {/* Mood Trends Chart */}
      <div className="mb-8">
        <h4 className="text-lg font-bold text-purple-900 mb-4">📈 Your Mood Journey</h4>
        <div className="space-y-3">
          {sentimentData.moodTrends.slice(-7).map((trend, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 w-24">
                <span className="text-lg">{getMoodEmoji(trend.mood)}</span>
                <span className="text-xs text-purple-700 font-medium">{trend.displayDate}</span>
              </div>
              <div className="flex-1 relative">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div
                    className={`h-4 rounded-full transition-all duration-500 ${
                      trend.sentiment >= 0
                        ? 'bg-gradient-to-r from-green-400 to-green-500'
                        : 'bg-gradient-to-r from-red-400 to-red-500'
                    }`}
                    style={{
                      width: `${50 + (trend.sentiment * 50)}%`,
                      minWidth: '4px'
                    }}
                  />
                  <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-gray-400 transform -translate-x-0.5" />
                </div>
              </div>
              <div className="text-xs text-amber-600 font-medium w-12 text-right">
                {trend.sentiment > 0 ? '+' : ''}{(trend.sentiment * 100).toFixed(0)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>More Negative</span>
          <span>Neutral</span>
          <span>More Positive</span>
        </div>
      </div>

      {/* Positive Triggers */}
      {sentimentData.topPositiveTriggers.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-purple-900 mb-3">🌟 What Makes You Happy</h4>
          <div className="space-y-2">
            {sentimentData.topPositiveTriggers.map((trigger, index) => (
              <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 mr-2">✨</span>
                <span className="text-purple-800 text-sm">{trigger}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Concern Areas */}
      {sentimentData.concernAreas.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-purple-900 mb-3">💝 Areas We Can Help With</h4>
          <div className="space-y-2">
            {sentimentData.concernAreas.map((concern, index) => (
              <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-600 mr-2">💛</span>
                <span className="text-purple-800 text-sm">{concern}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {sentimentData.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-purple-900 mb-3">💡 Ways to Feel Even Better</h4>
          <div className="space-y-2">
            {sentimentData.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-purple-600 mr-2 mt-0.5">💜</span>
                <span className="text-purple-800 text-sm leading-relaxed">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
        <div className="flex items-center text-sm text-pink-800">
          <span className="text-lg mr-2">🤗</span>
          <p>
            Remember, it's completely normal to have different feelings about learning!
            We're here to support you and make learning as fun and comfortable as possible.
          </p>
        </div>
      </div>
    </div>
  );
};