import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useGamificationStore } from '../../store/gamificationStore';

interface MainLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
  footerVariant?: 'default' | 'minimal';
  containerClass?: string;
  fullHeight?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showSidebar = false,
  showFooter = true,
  footerVariant = 'minimal',
  containerClass = '',
  fullHeight = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${fullHeight ? 'h-screen' : ''}`}>
      {/* Header */}
      <Header onMobileMenuToggle={toggleSidebar} showMobileMenuButton={showSidebar} />

      <div className={`flex flex-1 ${fullHeight ? 'overflow-hidden' : ''}`}>
        {/* Sidebar */}
        {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col ${fullHeight ? 'overflow-auto' : ''} ${showSidebar ? 'lg:ml-80' : ''}`}
        >
          <main className={`flex-1 ${containerClass} ${fullHeight ? 'h-full' : ''}`}>
            {children}
          </main>

          {/* Footer - Fixed at bottom */}
          {showFooter && <Footer variant={footerVariant} />}
        </div>
      </div>

      {/* Sidebar overlay for mobile */}
      {showSidebar && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

// Collapsible Sidebar Component
const CollapsibleSidebar: React.FC<{ isCollapsed: boolean; onToggle: () => void }> = ({
  isCollapsed,
  onToggle,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { conversations } = useChatStore();
  const { userProfile } = useGamificationStore();

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
      name: 'Messages',
      href: '/chat',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      description: 'Chat with tutors and parents',
      badge: unreadCount > 0 ? unreadCount.toString() : undefined,
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
      name: 'Learning Journey',
      href: '/behavioral',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      ),
      description: 'Track your learning progress',
    },
  ];

  const isActivePage = (href: string) => location.pathname === href;

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      {!isCollapsed && (
        <div className="p-6 border-b border-gray-200">
          <div>
            <p className="text-sm text-purple-600 font-medium leading-relaxed">
              Your personalized learning journey with gamification, AI-powered insights, and
              real-time tutoring
            </p>
          </div>
        </div>
      )}

      {/* User Profile Summary */}
      {user && !isCollapsed && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-purple-900 truncate text-sm">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-xs text-amber-600 truncate">
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1).toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed user avatar */}
      {user && isCollapsed && (
        <div className="p-2 border-b border-gray-200 flex justify-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user.firstName?.[0]}
            {user.lastName?.[0]}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigation(item.href)}
            className={`w-full flex items-center space-x-3 p-3 text-left rounded-xl transition-all duration-200 relative group ${
              isActivePage(item.href)
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-amber-700 hover:bg-purple-50 hover:text-purple-900'
            }`}
            title={isCollapsed ? item.name : undefined}
          >
            <div className={`text-xl ${isActivePage(item.href) ? 'text-white' : ''}`}>
              {item.icon}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.name}</div>
                  <div
                    className={`text-xs truncate ${
                      isActivePage(item.href) ? 'text-purple-100' : 'text-amber-600'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {item.badge && (
                  <span
                    className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                      isActivePage(item.href)
                        ? 'bg-purple-100 bg-opacity-20 text-purple-600'
                        : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {isCollapsed && item.badge && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                {item.badge.length > 2 ? '9+' : item.badge}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-2 border-t border-gray-200">
        <button
          onClick={() => navigate('/settings')}
          className={`w-full flex items-center space-x-3 p-3 text-left rounded-xl transition-all duration-200 ${
            isActivePage('/settings')
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'text-amber-700 hover:bg-purple-50 hover:text-purple-900'
          }`}
          title={isCollapsed ? 'Settings' : undefined}
        >
          <div className={`text-xl ${isActivePage('/settings') ? 'text-white' : ''}`}>⚙️</div>
          {!isCollapsed && (
            <div className="flex-1">
              <div className="font-medium">Settings</div>
              <div
                className={`text-xs ${
                  isActivePage('/settings') ? 'text-purple-100' : 'text-amber-600'
                }`}
              >
                App preferences
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

// Mobile Sidebar Component
const MobileSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onClose} />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BL</span>
            </div>
            <span className="text-lg font-bold text-purple-900">Dashboard</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-purple-50 text-purple-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <Sidebar isOpen={true} onClose={onClose} />
      </div>
    </>
  );
};

// Specialized layout components for different page types
export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Remember sidebar state in localStorage
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Enhanced Header with sidebar controls */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left section with sidebar toggle */}
          <div className="flex items-center space-x-4">
            {/* Sidebar Toggle Button */}
            <div className="relative group">
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center p-2 rounded-md text-purple-500 hover:text-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
                title={`${sidebarCollapsed ? 'Open' : 'Close'} sidebar (Ctrl+B)`}
              >
                {/* Modern sidebar open/close icon */}
                {sidebarCollapsed ? (
                  // "Menu" (hamburger) icon for closed sidebar
                  <svg
                    className="h-6 w-6 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <rect x="4" y="6" width="16" height="2" rx="1" fill="currentColor" />
                    <rect x="4" y="11" width="16" height="2" rx="1" fill="currentColor" />
                    <rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor" />
                  </svg>
                ) : (
                  // "Chevron left" icon for open sidebar
                  <svg
                    className="h-6 w-6 transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.75 19.25L9.25 12.75C8.83579 12.3358 8.83579 11.6642 9.25 11.25L15.75 4.75"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                LearnQuest
              </h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            <Header onMobileMenuToggle={() => {}} showMobileMenuButton={false} />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Collapsible Sidebar */}
        <div
          className={`${sidebarCollapsed ? 'w-16' : 'w-80'} transition-all duration-300 ease-in-out hidden lg:block`}
        >
          <CollapsibleSidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={!sidebarCollapsed} onClose={() => setSidebarCollapsed(true)} />

        {/* Main Content */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out`}>
          <main
            className={`flex-1 transition-sidebar ${
              sidebarCollapsed
                ? 'max-w-full mx-auto px-4 sm:px-6 lg:px-12 pt-6 pb-6'
                : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6'
            }`}
          >
            {children}
          </main>

          <Footer variant="minimal" />
        </div>
      </div>

      {/* Floating toggle for mobile */}
      <button
        onClick={toggleSidebar}
        className="fixed bottom-6 left-6 z-50 lg:hidden p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        title="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </div>
  );
};

export const ChatLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MainLayout showSidebar={false} showFooter={false} fullHeight={true} containerClass="h-full">
      {children}
    </MainLayout>
  );
};

interface GameLayoutProps {
  children: React.ReactNode;
  enableSidebarToggle?: boolean;
}

export const GameLayout: React.FC<GameLayoutProps> = ({
  children,
  enableSidebarToggle = false,
}) => {
  const [showSidebar, setShowSidebar] = useState(enableSidebarToggle);
  const [sidebarToggleVisible, setSidebarToggleVisible] = useState(true);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const toggleSidebarButton = () => {
    setSidebarToggleVisible(!sidebarToggleVisible);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Custom Header for Game Layout with sidebar toggle */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Sidebar Toggle Button - Always visible on desktop when enabled */}
              {enableSidebarToggle && (
                <button
                  onClick={toggleSidebar}
                  className={`inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors ${
                    showSidebar ? 'bg-gray-100' : ''
                  }`}
                  title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showSidebar ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              )}

              {/* Logo */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BL</span>
                </div>
                <div className="hidden sm:block ml-3">
                  <span className="text-xl font-bold text-gray-900">Learning Games</span>
                  <div className="text-xs text-gray-500">Behavioral Learning Platform</div>
                </div>
              </div>
            </div>

            {/* Right section - minimal for game layout */}
            <div className="flex items-center space-x-2">
              {/* Sidebar visibility toggle */}
              {enableSidebarToggle && (
                <button
                  onClick={toggleSidebarButton}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors"
                  title="Toggle sidebar controls"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Conditional Sidebar */}
        {enableSidebarToggle && showSidebar && (
          <>
            {/* Sidebar for larger screens */}
            <div className="hidden lg:flex lg:flex-shrink-0">
              <div className="flex flex-col w-80 bg-white border-r border-gray-200">
                <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Game Controls</h3>
                    <p className="text-sm text-gray-600">
                      Navigate and manage your learning experience
                    </p>
                  </div>
                  <div className="flex-1 p-4">
                    {/* Sidebar content can be customized */}
                    <nav className="space-y-2">
                      <a
                        href="/dashboard"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Dashboard
                      </a>
                      <a
                        href="/gamification"
                        className="block px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-md"
                      >
                        Learning Games
                      </a>
                      <a
                        href="/chat"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Messages
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile sidebar overlay */}
            <div className="lg:hidden">
              <div className="fixed inset-0 flex z-40">
                <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      onClick={toggleSidebar}
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    >
                      <svg
                        className="h-6 w-6 text-white"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                    <div className="px-4 bg-gray-50 pb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Game Controls</h3>
                      <p className="text-sm text-gray-600">
                        Navigate and manage your learning experience
                      </p>
                    </div>
                    <nav className="mt-5 px-2 space-y-1">
                      <a
                        href="/dashboard"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Dashboard
                      </a>
                      <a
                        href="/gamification"
                        className="block px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-md"
                      >
                        Learning Games
                      </a>
                      <a
                        href="/chat"
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Messages
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${enableSidebarToggle && showSidebar ? 'lg:ml-0' : ''}`}
        >
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6 pb-6">
              <div
                className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 ${enableSidebarToggle && showSidebar ? 'lg:px-4' : 'lg:px-8'}`}
              >
                {children}
              </div>
            </div>
          </main>

          {/* Footer */}
          <Footer variant="minimal" />
        </div>
      </div>

      {/* Floating toggle button - visible on mobile and when sidebar controls are hidden */}
      {enableSidebarToggle && !sidebarToggleVisible && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 left-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors lg:hidden"
          title="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export const ContentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MainLayout
      showSidebar={true}
      showFooter={true}
      footerVariant="default"
      containerClass="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {children}
    </MainLayout>
  );
};
