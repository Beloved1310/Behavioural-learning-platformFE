import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
  label?: string;
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  size?: 'small' | 'medium' | 'large';
  showPercentage?: boolean;
  showValues?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  max,
  label,
  color = 'blue',
  size = 'medium',
  showPercentage = false,
  showValues = false,
  animated = true,
  className = ''
}) => {
  const percentage = Math.min((current / max) * 100, 100);

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-600';
      case 'purple':
        return 'bg-purple-600';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'h-2';
      case 'large':
        return 'h-4';
      default:
        return 'h-3';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage || showValues) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            {showValues && (
              <span>{current.toLocaleString()} / {max.toLocaleString()}</span>
            )}
            {showPercentage && (
              <span>{Math.round(percentage)}%</span>
            )}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${getSizeClasses()}`}>
        <div
          className={`${getSizeClasses()} ${getColorClasses()} rounded-full ${
            animated ? 'transition-all duration-500 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface LevelProgressProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  currentXP,
  nextLevelXP,
  level,
  className = ''
}) => {
  const percentage = (currentXP / nextLevelXP) * 100;

  return (
    <div className={`bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {level}
          </div>
          <span className="font-semibold text-gray-900">Level {level}</span>
        </div>
        <div className="text-sm text-gray-600">
          {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </div>
      </div>
      
      <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="h-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>Level {level}</span>
        <span>{Math.round(percentage)}%</span>
        <span>Level {level + 1}</span>
      </div>
    </div>
  );
};

interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  backgroundColor = '#E5E7EB',
  showPercentage = true,
  children
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <span className="text-lg font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
};

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  className?: string;
}

export const StreakDisplay: React.FC<StreakDisplayProps> = ({
  currentStreak,
  longestStreak,
  isActive,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-r from-orange-100 to-red-100 p-4 rounded-lg ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">
            {isActive ? '🔥' : '💨'}
          </div>
          <div>
            <div className="font-bold text-2xl text-orange-600">
              {currentStreak}
            </div>
            <div className="text-sm text-gray-600">
              {isActive ? 'Day Streak' : 'Days Ago'}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="font-semibold text-lg text-orange-800">
            {longestStreak}
          </div>
          <div className="text-sm text-gray-600">
            Best Streak
          </div>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-3 text-xs text-orange-700 bg-orange-50 p-2 rounded">
          🔥 Keep it up! Study today to maintain your streak.
        </div>
      )}
    </div>
  );
};