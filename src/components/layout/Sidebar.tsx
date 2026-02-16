import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useGamificationStore } from '../../store/gamificationStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { conversations } = useChatStore();
  const { userProfile } = useGamificationStore();

  // Calculate unread messages count
  const unreadCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z"
          />
        </svg>
      ),
      description: 'Overview and quick actions',
    },
    {
      name: 'Learning Games',
      href: '/gamification',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
      description: 'Quizzes, badges, and leaderboards',
      badge: userProfile?.level ? `Level ${userProfile.level}` : undefined,
    },
    {
      name: 'Learning Journey',
      href: '/behavioral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm0 0V5a2 2 0 012-2h6l2 2h6a2 2 0 012 2v2M7 13h10"
          />
        </svg>
      ),
      description: 'Track your learning progress',
    },
    {
      name: 'Study Sessions',
      href: '/sessions',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      description: 'Scheduled study time',
    },
    {
      name: 'Messages',
      href: '/chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      description: 'Chat with tutors and parents',
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
    },
  ];

  const bottomNavigationItems = [
    {
      name: 'Settings',
      href: '/settings',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      description: 'App preferences',
    },
  ];

  const isActivePage = (href: string) => {
    return location.pathname === href;
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-white via-purple-50/30 to-pink-50/30 shadow-2xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col border-r-4 border-yellow-300 ${
          isCollapsed ? 'w-20' : 'w-80'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        {!isCollapsed && (
          <div className="flex items-center justify-between p-6 border-b-4 border-yellow-300 bg-gradient-to-r from-purple-100 to-pink-100">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LearnQuest
              </h1>
            </div>

            <button
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-purple-200 transition-all min-h-[48px] min-w-[48px] lg:hidden"
            >
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Collapsed Header - Just Logo */}
        {isCollapsed && (
          <div className="flex items-center justify-center p-4 border-b-4 border-yellow-300 bg-gradient-to-r from-purple-100 to-pink-100">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              LQ
            </h1>
          </div>
        )}

        {/* User Profile Summary */}
        {user && !isCollapsed && (
          <div className="p-6 bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 border-b-4 border-yellow-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-purple-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm font-semibold text-purple-600">
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase()}
                </p>
                {userProfile && (
                  <div className="flex items-center space-x-2 mt-3">
                    <div className="flex items-center space-x-1 text-sm font-bold bg-white/80 px-3 py-1.5 rounded-full shadow-md border-2 border-yellow-200">
                      <span className="text-lg">🔥</span>
                      <span>{userProfile.streak?.currentStreak || 0} day streak</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm font-bold bg-white/80 px-3 py-1.5 rounded-full shadow-md border-2 border-purple-200">
                      <span className="text-lg">⭐</span>
                      <span>Level {userProfile.level || 1}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Collapsed User Avatar */}
        {user && isCollapsed && (
          <div className="p-4 border-b-4 border-yellow-300 bg-gradient-to-r from-purple-100 to-pink-100 flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className={`flex-1 py-4 space-y-3 overflow-y-auto`}>
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center rounded-2xl transition-all duration-200 relative group min-h-[56px] ${
                isCollapsed ? 'justify-center p-4' : 'space-x-4 px-5 py-4'
              } ${
                isActivePage(item.href)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl transform scale-105'
                  : 'text-purple-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-pink-100 hover:text-purple-900 hover:shadow-md'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div
                className={`flex items-center justify-center ${isActivePage(item.href) ? 'text-white' : 'text-purple-600'}`}
              >
                <div className="w-7 h-7 flex items-center justify-center">{item.icon}</div>
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 text-left">
                    <div className="font-bold text-base">{item.name}</div>
                    <div
                      className={`text-sm ${
                        isActivePage(item.href) ? 'text-purple-100' : 'text-purple-500'
                      }`}
                    >
                      {item.description}
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-bold leading-none rounded-full shadow-lg ${
                        isActivePage(item.href)
                          ? 'bg-gradient-to-r from-pink-400 to-red-400 text-white border-2 border-white'
                          : 'bg-gradient-to-r from-pink-400 to-red-400 text-white border-2 border-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[28px] min-h-[28px] text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg border-2 border-white">
                  {item.badge.length > 2 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div
          className={`py-4 border-t-4 border-yellow-300 space-y-3 ${isCollapsed ? 'px-2' : 'px-6'}`}
        >
          {!isCollapsed && (
            <div className="text-sm font-bold text-purple-600 mb-4 px-2">⚙️ Support</div>
          )}

          {bottomNavigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center rounded-2xl transition-all duration-200 min-h-[56px] ${
                isCollapsed ? 'justify-center p-4' : 'space-x-4 px-5 py-4'
              } ${
                isActivePage(item.href)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl transform scale-105'
                  : 'text-purple-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-pink-100 hover:text-purple-900 hover:shadow-md'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <div
                className={`flex items-center justify-center ${isActivePage(item.href) ? 'text-white' : 'text-purple-600'}`}
              >
                <div className="w-7 h-7 flex items-center justify-center">{item.icon}</div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-bold text-base">{item.name}</div>
                  <div
                    className={`text-sm ${
                      isActivePage(item.href) ? 'text-purple-100' : 'text-purple-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="px-6 py-4 border-t-4 border-yellow-300 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="text-sm font-semibold text-purple-600 text-center">
              © 2024 LearnQuest
              <br />
              <span className="text-xs">Version 1.0.0 🎉</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
