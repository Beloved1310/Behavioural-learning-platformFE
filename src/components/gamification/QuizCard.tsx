import React from 'react';
import { Quiz } from '../../types';
import { Button } from '../ui/Button';

interface QuizCardProps {
  quiz: Quiz;
  onStartQuiz: (quizId: string) => void;
  isLoading?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onStartQuiz,
  isLoading = false
}) => {
  const getDifficultyColor = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: Quiz['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const formatCompletionCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {quiz.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {quiz.description}
          </p>
        </div>
        <div className="ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.difficulty)}`}>
            {getDifficultyIcon(quiz.difficulty)} {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </span>
        </div>
      </div>

      {/* Quiz Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-lg font-bold text-blue-600">{quiz.questions.length}</div>
          <div className="text-xs text-blue-800">Questions</div>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="text-lg font-bold text-purple-600">{quiz.pointsReward}</div>
          <div className="text-xs text-purple-800">Points</div>
        </div>
      </div>

      {/* Subject and Time */}
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          📚 {quiz.subject}
        </span>
        {quiz.timeLimit && (
          <span className="text-xs text-gray-500 flex items-center">
            ⏰ {quiz.timeLimit} min{quiz.timeLimit > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tags */}
      {quiz.tags && quiz.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {quiz.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            >
              #{tag}
            </span>
          ))}
          {quiz.tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{quiz.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Community Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
        <span className="flex items-center">
          👥 {formatCompletionCount(quiz.completionCount)} completed
        </span>
        <span className="flex items-center">
          📊 {quiz.averageScore}% avg score
        </span>
      </div>

      {/* Badge Reward */}
      {quiz.badgeReward && (
        <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-800 font-medium flex items-center">
            🏆 Badge Reward: {quiz.badgeReward.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={() => onStartQuiz(quiz.id)}
        disabled={!quiz.isActive || isLoading}
        size="lg"
        className="w-full"
        isLoading={isLoading}
      >
        {!quiz.isActive ? 'Coming Soon' : 'Start Quiz'}
      </Button>

      {/* Additional Info */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-400">
          Created {new Date(quiz.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};