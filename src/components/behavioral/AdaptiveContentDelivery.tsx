import React, { useEffect, useState } from 'react';
import { behavioralTrackingService } from '../../services/behavioralTrackingService';
import { useAuthStore } from '../../store/authStore';

interface AdaptiveContent {
  id: string;
  type: 'lesson' | 'quiz' | 'reading' | 'game' | 'video';
  subject: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  adaptationReason: string;
  priority: number; // 1-10, higher is more recommended
  tags: string[];
  emoji: string;
}

interface LearningPreferences {
  preferredTime: string;
  preferredDifficulty: string;
  strongSubjects: string[];
  strugglingSubjects: string[];
  preferredContentTypes: string[];
  optimalSessionLength: number;
}

interface AdaptiveContentDeliveryProps {
  className?: string;
  maxContent?: number;
}

export const AdaptiveContentDelivery: React.FC<AdaptiveContentDeliveryProps> = ({
  className = '',
  maxContent = 6
}) => {
  const [adaptiveContent, setAdaptiveContent] = useState<AdaptiveContent[]>([]);
  const [preferences, setPreferences] = useState<LearningPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const generateAdaptiveContent = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const patterns = await behavioralTrackingService.analyzeEngagementPatterns(user.id);
        const consistency = await behavioralTrackingService.analyzeStudyConsistency(user.id);
        const sentiment = await behavioralTrackingService.performSentimentAnalysis(user.id);

        // Analyze learning preferences from behavioral data
        const learningPrefs: LearningPreferences = {
          preferredTime: getCurrentTimePreference(),
          preferredDifficulty: getDifficultyPreference(patterns, sentiment),
          strongSubjects: getStrongSubjects(patterns),
          strugglingSubjects: getStrugglingSubjects(patterns, sentiment),
          preferredContentTypes: getPreferredContentTypes(patterns),
          optimalSessionLength: getOptimalSessionLength(patterns)
        };

        setPreferences(learningPrefs);

        // Generate adaptive content based on preferences and current state
        const content: AdaptiveContent[] = [];

        // Content for struggling subjects (high priority)
        learningPrefs.strugglingSubjects.forEach(subject => {
          content.push({
            id: `support-${subject}`,
            type: 'lesson',
            subject,
            title: `${subject} Made Easy! 🌟`,
            description: `A gentle, step-by-step approach to ${subject} designed just for you!`,
            difficulty: 'easy',
            estimatedTime: Math.min(learningPrefs.optimalSessionLength, 20),
            adaptationReason: `Recommended because you've been working on ${subject}`,
            priority: 10,
            tags: ['supportive', 'foundational', 'confidence-building'],
            emoji: '💝'
          });
        });

        // Mood-based content adaptation
        if (sentiment && sentiment.overallSentiment === 'negative') {
          content.push({
            id: 'mood-boost',
            type: 'game',
            subject: 'Fun Activities',
            title: 'Learning Games & Fun! 🎮',
            description: 'Interactive games designed to boost your confidence and make learning enjoyable!',
            difficulty: 'easy',
            estimatedTime: 15,
            adaptationReason: 'Recommended to boost your mood and confidence',
            priority: 9,
            tags: ['fun', 'interactive', 'mood-boosting'],
            emoji: '🎮'
          });
        }

        // Strength-based challenges
        learningPrefs.strongSubjects.forEach(subject => {
          content.push({
            id: `challenge-${subject}`,
            type: 'quiz',
            subject,
            title: `${subject} Challenge! 🏆`,
            description: `You're great at ${subject}! Ready for an exciting challenge?`,
            difficulty: 'medium',
            estimatedTime: 15,
            adaptationReason: `Recommended because you excel at ${subject}`,
            priority: 7,
            tags: ['challenging', 'strength-building', 'achievement'],
            emoji: '🏆'
          });
        });

        // Time-optimized content
        const currentHour = new Date().getHours();
        if (currentHour >= 16 && currentHour <= 18) { // After school hours
          content.push({
            id: 'after-school-reading',
            type: 'reading',
            subject: 'Reading Adventures',
            title: 'After School Reading Time! 📚',
            description: 'Perfect stories and articles to wind down after a busy school day!',
            difficulty: 'easy',
            estimatedTime: 20,
            adaptationReason: 'Perfect timing for relaxed learning',
            priority: 8,
            tags: ['relaxing', 'after-school', 'flexible'],
            emoji: '📚'
          });
        }

        // Consistency-based recommendations
        if (consistency.currentStreak === 0) {
          content.push({
            id: 'streak-starter',
            type: 'lesson',
            subject: 'Getting Started',
            title: 'Let\'s Start Your Learning Streak! 🚀',
            description: 'A quick and fun activity to get you back into the learning groove!',
            difficulty: 'easy',
            estimatedTime: 10,
            adaptationReason: 'Perfect for getting back into your learning routine',
            priority: 9,
            tags: ['motivational', 'quick-start', 'streak-building'],
            emoji: '🚀'
          });
        } else if (consistency.currentStreak >= 7) {
          content.push({
            id: 'streak-celebration',
            type: 'video',
            subject: 'Achievement',
            title: 'Celebrate Your Amazing Streak! 🎉',
            description: 'You\'ve been learning consistently! Here are some advanced topics you might enjoy.',
            difficulty: 'medium',
            estimatedTime: 25,
            adaptationReason: `Celebrating your ${consistency.currentStreak}-day streak!`,
            priority: 8,
            tags: ['celebration', 'advanced', 'achievement'],
            emoji: '🎉'
          });
        }

        // Learning type preferences
        if (learningPrefs.preferredContentTypes.includes('interactive')) {
          content.push({
            id: 'interactive-science',
            type: 'game',
            subject: 'Science Explorers',
            title: 'Interactive Science Lab! 🔬',
            description: 'Hands-on experiments and discoveries you can do from home!',
            difficulty: 'medium',
            estimatedTime: 30,
            adaptationReason: 'You love interactive learning!',
            priority: 7,
            tags: ['interactive', 'hands-on', 'discovery'],
            emoji: '🔬'
          });
        }

        // Default recommendations for variety
        const defaultContent = [
          {
            id: 'daily-math-fun',
            type: 'lesson' as const,
            subject: 'Fun with Numbers',
            title: 'Daily Math Adventures! 🔢',
            description: 'Fun math problems that feel like games!',
            difficulty: learningPrefs.preferredDifficulty as any,
            estimatedTime: 20,
            adaptationReason: 'Great for building math confidence',
            priority: 6,
            tags: ['daily', 'foundational', 'engaging'],
            emoji: '🔢'
          },
          {
            id: 'creative-writing',
            type: 'lesson' as const,
            subject: 'Writing Workshop',
            title: 'Creative Writing Time! ✍️',
            description: 'Express yourself through fun writing activities!',
            difficulty: 'easy' as const,
            estimatedTime: 25,
            adaptationReason: 'Perfect for creative expression',
            priority: 5,
            tags: ['creative', 'expression', 'fun'],
            emoji: '✍️'
          }
        ];

        content.push(...defaultContent);

        // Sort by priority and limit results
        const sortedContent = content
          .sort((a, b) => b.priority - a.priority)
          .slice(0, maxContent);

        setAdaptiveContent(sortedContent);
      } catch (error) {
        console.error('Failed to generate adaptive content:', error);
      } finally {
        setLoading(false);
      }
    };

    generateAdaptiveContent();
  }, [user?.id, maxContent]);

  const getCurrentTimePreference = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const getDifficultyPreference = (patterns: any, sentiment: any) => {
    if (sentiment && sentiment.overallSentiment === 'negative') return 'easy';
    if (patterns && patterns.averageSessionLength > 30) return 'medium';
    return 'easy';
  };

  const getStrongSubjects = (patterns: any) => {
    // Mock analysis - in real app, would analyze completion rates and engagement
    return ['Fun with Numbers', 'Reading Adventures'];
  };

  const getStrugglingSubjects = (patterns: any, sentiment: any) => {
    // Mock analysis - in real app, would analyze low completion rates
    if (sentiment && sentiment.concernAreas.length > 0) {
      return ['Science Explorers'];
    }
    return [];
  };

  const getPreferredContentTypes = (patterns: any) => {
    // Mock analysis - would analyze engagement with different content types
    return ['interactive', 'visual'];
  };

  const getOptimalSessionLength = (patterns: any) => {
    // Mock analysis - would calculate from actual session data
    return 20;
  };

  const handleContentClick = (content: AdaptiveContent) => {
    // Track engagement with adaptive content
    if (user?.id) {
      behavioralTrackingService.trackEvent({
        userId: user.id,
        eventType: 'click',
        metadata: {
          contentType: 'adaptive',
          contentId: content.id,
          subject: content.subject,
          difficulty: content.difficulty,
          adaptationReason: content.adaptationReason
        }
      });
    }

    // Navigate to appropriate page based on content type
    const routes: Record<string, string> = {
      lesson: '/sessions',
      quiz: '/sessions?type=quiz',
      reading: '/sessions?type=reading',
      game: '/gamification',
      video: '/sessions?type=video'
    };

    window.location.href = routes[content.type] || '/sessions';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-purple-900">Recommended Just for You! ✨</h3>
          <p className="text-amber-600">Based on how you learn best</p>
        </div>
        {preferences && (
          <div className="text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            Optimized for {preferences.optimalSessionLength}min sessions
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {adaptiveContent.map((content) => (
          <div
            key={content.id}
            onClick={() => handleContentClick(content)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 hover:border-purple-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{content.emoji}</span>
                <div>
                  <h4 className="font-bold text-purple-900 text-sm">{content.title}</h4>
                  <p className="text-xs text-amber-600">{content.subject}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(content.difficulty)}`}>
                  {content.difficulty}
                </span>
                <span className="text-xs text-gray-500">
                  {content.estimatedTime}min
                </span>
              </div>
            </div>

            <p className="text-sm text-purple-800 leading-relaxed mb-3">
              {content.description}
            </p>

            <div className="mb-3">
              <div className="flex items-center text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                <span className="mr-1">💡</span>
                {content.adaptationReason}
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {content.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {preferences && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-bold text-purple-900 mb-2">🧠 Your Learning Profile</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-purple-700">Best time to learn:</span>
              <span className="ml-2 text-purple-900 capitalize">{preferences.preferredTime}</span>
            </div>
            <div>
              <span className="font-medium text-purple-700">Optimal session:</span>
              <span className="ml-2 text-purple-900">{preferences.optimalSessionLength} minutes</span>
            </div>
            <div>
              <span className="font-medium text-purple-700">Strong subjects:</span>
              <span className="ml-2 text-purple-900">{preferences.strongSubjects.join(', ') || 'Building strengths!'}</span>
            </div>
            <div>
              <span className="font-medium text-purple-700">Preferred style:</span>
              <span className="ml-2 text-purple-900 capitalize">{preferences.preferredContentTypes.join(', ')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};