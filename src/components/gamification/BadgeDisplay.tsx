import React from 'react';
import { GameBadge, UserBadge } from '../../types';

interface BadgeDisplayProps {
  badges: UserBadge[];
  availableBadges?: GameBadge[];
  showProgress?: boolean;
  size?: 'small' | 'medium' | 'large';
  layout?: 'grid' | 'list';
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  availableBadges = [],
  showProgress = false,
  size = 'medium',
  layout = 'grid'
}) => {
  const getRarityColor = (rarity: GameBadge['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300 bg-gray-50';
      case 'rare':
        return 'border-blue-300 bg-blue-50';
      case 'epic':
        return 'border-purple-300 bg-purple-50';
      case 'legendary':
        return 'border-yellow-300 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getRarityGlow = (rarity: GameBadge['rarity']) => {
    switch (rarity) {
      case 'rare':
        return 'shadow-blue-200';
      case 'epic':
        return 'shadow-purple-200';
      case 'legendary':
        return 'shadow-yellow-200';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-16 h-16',
          icon: 'text-2xl',
          text: 'text-xs'
        };
      case 'large':
        return {
          container: 'w-24 h-24',
          icon: 'text-4xl',
          text: 'text-sm'
        };
      default:
        return {
          container: 'w-20 h-20',
          icon: 'text-3xl',
          text: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const earnedBadgeIds = badges.map(b => b.badgeId);
  const allBadgesToShow = showProgress 
    ? [...badges.map(ub => ({ ...ub.badge, isEarned: true, earnedAt: ub.earnedAt })), 
       ...availableBadges.filter(ab => !earnedBadgeIds.includes(ab.id))
         .map(ab => ({ ...ab, isEarned: false }))]
    : badges.map(ub => ({ ...ub.badge, isEarned: true, earnedAt: ub.earnedAt }));

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {allBadgesToShow.map((badge) => (
          <div
            key={badge.id}
            className={`flex items-center p-4 rounded-lg border-2 ${
              'isEarned' in badge && badge.isEarned
                ? `${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)}`
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <div className={`${sizeClasses.container} flex items-center justify-center rounded-full border-2 ${getRarityColor(badge.rarity)}`}>
              <span className={sizeClasses.icon}>
                {'isEarned' in badge && !badge.isEarned ? '🔒' : badge.icon}
              </span>
            </div>
            
            <div className="ml-4 flex-1">
              <h3 className="font-semibold text-gray-900">{badge.name}</h3>
              <p className="text-sm text-gray-600">{badge.description}</p>
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(badge.rarity)}`}>
                    {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                  </span>
                  <span className="text-xs text-purple-600 font-medium">
                    +{badge.pointsReward} XP
                  </span>
                </div>
                
                {'earnedAt' in badge && badge.earnedAt && (
                  <span className="text-xs text-gray-500">
                    Earned {formatDate(badge.earnedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {allBadgesToShow.map((badge) => (
        <div
          key={badge.id}
          className={`relative group cursor-pointer transition-transform hover:scale-105`}
          title={badge.description}
        >
          <div
            className={`${sizeClasses.container} flex items-center justify-center rounded-full border-2 mx-auto ${
              'isEarned' in badge && badge.isEarned
                ? `${getRarityColor(badge.rarity)} ${getRarityGlow(badge.rarity)} shadow-lg`
                : 'border-gray-200 bg-gray-100 opacity-50'
            }`}
          >
            <span className={sizeClasses.icon}>
              {'isEarned' in badge && !badge.isEarned ? '🔒' : badge.icon}
            </span>
          </div>
          
          <div className="text-center mt-2">
            <h4 className={`font-medium ${sizeClasses.text} text-gray-900 truncate`}>
              {badge.name}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
            </p>
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
            <div className="font-medium">{badge.name}</div>
            <div className="text-gray-300">{badge.description}</div>
            <div className="text-purple-300">+{badge.pointsReward} XP</div>
            {'earnedAt' in badge && badge.earnedAt && (
              <div className="text-gray-400 text-xs">
                Earned {formatDate(badge.earnedAt)}
              </div>
            )}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>

          {/* Rarity indicator */}
          {'isEarned' in badge && badge.isEarned && badge.rarity !== 'common' && (
            <div className="absolute -top-1 -right-1">
              {badge.rarity === 'legendary' && <span className="text-xs">✨</span>}
              {badge.rarity === 'epic' && <span className="text-xs">💜</span>}
              {badge.rarity === 'rare' && <span className="text-xs">💎</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const BadgeShowcase: React.FC<{ userBadge: UserBadge; onClose: () => void }> = ({
  userBadge,
  onClose
}) => {
  const { badge, earnedAt } = userBadge;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Badge Earned!</h2>
        </div>

        <div className="mb-6">
          <div className={`w-24 h-24 flex items-center justify-center rounded-full border-4 mx-auto mb-4 ${getRarityColor(badge.rarity)}`}>
            <span className="text-4xl">{badge.icon}</span>
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{badge.name}</h3>
          <p className="text-gray-600 mb-4">{badge.description}</p>
          
          <div className="flex items-center justify-center space-x-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm ${getRarityColor(badge.rarity)}`}>
              {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
            </span>
            <span className="text-purple-600 font-medium">
              +{badge.pointsReward} XP
            </span>
          </div>
          
          <p className="text-xs text-gray-500">
            Earned on {new Date(earnedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn-primary px-6 py-3 rounded-lg"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
};