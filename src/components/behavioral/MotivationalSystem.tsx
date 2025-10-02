import React, { useEffect, useState } from 'react';
import { behavioralTrackingService } from '../../services/behavioralTrackingService';
import { notificationService } from '../../services/notificationService';
import { useAuthStore } from '../../store/authStore';

interface MotivationalPrompt {
  id: string;
  type: 'achievement' | 'encouragement' | 'streak' | 'reminder' | 'challenge';
  title: string;
  message: string;
  emoji: string;
  priority: 'low' | 'medium' | 'high';
  actionButton?: {
    text: string;
    action: () => void;
  };
  dismissible: boolean;
  expiresAt?: Date;
}

interface MotivationalSystemProps {
  className?: string;
  maxPrompts?: number;
}

export const MotivationalSystem: React.FC<MotivationalSystemProps> = ({
  className = '',
  maxPrompts = 5
}) => {
  const [prompts, setPrompts] = useState<MotivationalPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const generateMotivationalPrompts = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const insights = await behavioralTrackingService.generateInsights(user.id);
        const analysis = await behavioralTrackingService.analyzeStudyConsistency(user.id);

        const newPrompts: MotivationalPrompt[] = [];

        // Achievement-based prompts
        if (analysis.currentStreak >= 7) {
          newPrompts.push({
            id: 'streak-achievement',
            type: 'achievement',
            title: 'Amazing Streak! 🔥',
            message: `Wow! You've been learning for ${analysis.currentStreak} days straight! You're absolutely incredible!`,
            emoji: '🔥',
            priority: 'high',
            dismissible: true,
            actionButton: {
              text: 'Share My Success! 🎉',
              action: () => {
                notificationService.showStreakCelebration(analysis.currentStreak);
              }
            }
          });
        }

        // Consistency encouragement
        if (analysis.consistencyScore >= 80) {
          newPrompts.push({
            id: 'consistency-praise',
            type: 'achievement',
            title: 'Super Consistent Learner! ⭐',
            message: `Your consistency score is ${analysis.consistencyScore}%! You're building amazing learning habits!`,
            emoji: '⭐',
            priority: 'medium',
            dismissible: true
          });
        } else if (analysis.consistencyScore < 50) {
          newPrompts.push({
            id: 'consistency-encouragement',
            type: 'encouragement',
            title: 'You\'ve Got This! 💪',
            message: 'Every small step counts! Try setting aside just 15 minutes today for learning. You can do it!',
            emoji: '💪',
            priority: 'high',
            dismissible: true,
            actionButton: {
              text: 'Start Learning Now! 🚀',
              action: () => {
                window.location.href = '/sessions';
              }
            }
          });
        }

        // Daily learning reminder
        const lastActivity = localStorage.getItem(`lastActivity_${user.id}`);
        const today = new Date().toDateString();
        if (!lastActivity || new Date(lastActivity).toDateString() !== today) {
          newPrompts.push({
            id: 'daily-reminder',
            type: 'reminder',
            title: 'Ready for Today\'s Adventure? 🌟',
            message: 'A new day means new opportunities to learn amazing things! What will you discover today?',
            emoji: '🌟',
            priority: 'medium',
            dismissible: true,
            actionButton: {
              text: 'Let\'s Learn! 📚',
              action: () => {
                localStorage.setItem(`lastActivity_${user.id}`, new Date().toISOString());
                window.location.href = '/dashboard';
              }
            }
          });
        }

        // Weekly challenge
        if (analysis.averageSessionsPerWeek < 5) {
          newPrompts.push({
            id: 'weekly-challenge',
            type: 'challenge',
            title: 'Weekly Challenge! 🎯',
            message: 'Can you complete 5 learning sessions this week? I believe in you!',
            emoji: '🎯',
            priority: 'medium',
            dismissible: true,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
            actionButton: {
              text: 'Accept Challenge! 💪',
              action: () => {
                localStorage.setItem(`weeklyChallenge_${user.id}`, JSON.stringify({
                  accepted: true,
                  startDate: new Date(),
                  target: 5
                }));
                setPrompts(prev => prev.filter(p => p.id !== 'weekly-challenge'));
                notificationService.showNotification({
                  title: '🎯 Challenge Accepted!',
                  body: 'You\'ve got this! Let\'s aim for 5 learning sessions this week!'
                });
              }
            }
          });
        }

        // Mood-based encouragement
        const recentMoods = JSON.parse(localStorage.getItem(`moods_${user.id}`) || '[]');
        const recentSadMoods = recentMoods.filter((mood: any) =>
          ['sad', 'frustrated', 'tired'].includes(mood.mood) &&
          new Date(mood.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
        );

        if (recentSadMoods.length > 0) {
          newPrompts.push({
            id: 'mood-support',
            type: 'encouragement',
            title: 'Sending You Hugs! 🤗',
            message: 'It\'s okay to have tough days. Remember, you\'re amazing and learning makes you even more awesome!',
            emoji: '🤗',
            priority: 'high',
            dismissible: true,
            actionButton: {
              text: 'Feel Better Activity 🌈',
              action: () => {
                window.location.href = '/sessions?filter=reading';
              }
            }
          });
        }

        // Random motivational messages
        const motivationalMessages = [
          {
            title: 'You\'re a Learning Star! ⭐',
            message: 'Every question you ask and every problem you solve makes you smarter!',
            emoji: '⭐'
          },
          {
            title: 'Brain Power Growing! 🧠',
            message: 'Did you know your brain gets stronger every time you learn something new? How cool is that?',
            emoji: '🧠'
          },
          {
            title: 'Future Genius Alert! 🚀',
            message: 'You\'re building skills today that will help you do amazing things in the future!',
            emoji: '🚀'
          },
          {
            title: 'Learning is Your Superpower! 💪',
            message: 'While others see challenges, you see opportunities to grow. That\'s your superpower!',
            emoji: '💪'
          }
        ];

        if (newPrompts.length < maxPrompts) {
          const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
          newPrompts.push({
            id: 'random-motivation',
            type: 'encouragement',
            title: randomMessage.title,
            message: randomMessage.message,
            emoji: randomMessage.emoji,
            priority: 'low',
            dismissible: true
          });
        }

        setPrompts(newPrompts.slice(0, maxPrompts));
      } catch (error) {
        console.error('Failed to generate motivational prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    generateMotivationalPrompts();
  }, [user?.id, maxPrompts]);

  const dismissPrompt = (promptId: string) => {
    setPrompts(prev => prev.filter(p => p.id !== promptId));
  };

  const getPromptStyle = (type: string, priority: string) => {
    const baseStyle = "rounded-xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md";

    switch (type) {
      case 'achievement':
        return `${baseStyle} bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200`;
      case 'streak':
        return `${baseStyle} bg-gradient-to-r from-orange-50 to-red-50 border-orange-200`;
      case 'challenge':
        return `${baseStyle} bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200`;
      case 'reminder':
        return `${baseStyle} bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200`;
      case 'encouragement':
      default:
        return `${baseStyle} bg-gradient-to-r from-green-50 to-blue-50 border-green-200`;
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">💝</span>
        <h3 className="text-xl font-bold text-purple-900">Just for You!</h3>
      </div>

      {prompts.map((prompt) => (
        <div key={prompt.id} className={getPromptStyle(prompt.type, prompt.priority)}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{prompt.emoji}</span>
                <h4 className="font-bold text-purple-900">{prompt.title}</h4>
              </div>
              <p className="text-purple-800 text-sm leading-relaxed mb-3">{prompt.message}</p>

              {prompt.actionButton && (
                <button
                  onClick={prompt.actionButton.action}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 hover:scale-105"
                >
                  {prompt.actionButton.text}
                </button>
              )}
            </div>

            {prompt.dismissible && (
              <button
                onClick={() => dismissPrompt(prompt.id)}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};