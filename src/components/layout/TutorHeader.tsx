import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useNotificationStore } from '../../store/notificationStore';
import { socketService } from '../../services/socketService';

interface TutorHeaderProps {
  onMobileMenuToggle?: () => void;
  showMobileMenuButton?: boolean;
}

export const TutorHeader: React.FC<TutorHeaderProps> = ({
  onMobileMenuToggle,
  showMobileMenuButton = true,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { conversations } = useChatStore();
  const {
    notifications,
    unreadCount: notificationUnreadCount,
    isLoading: notificationsLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  } = useNotificationStore();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Calculate unread messages count
  const unreadMessagesCount = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  // Total unread count (messages + notifications)
  const totalUnreadCount = unreadMessagesCount + notificationUnreadCount;

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications({ limit: 20 });
      fetchUnreadCount();
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  // Set up socket.io listener for real-time notifications
  useEffect(() => {
    if (!user) return;

    const handleNewNotification = (notification: any) => {
      const transformedNotification = {
        id: notification._id?.toString() || notification.id,
        userId: notification.userId?.toString() || notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || {},
        isRead: notification.isRead || false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };
      addNotification(transformedNotification);
    };

    socketService.on('new_notification', handleNewNotification);

    return () => {
      socketService.off('new_notification', handleNewNotification);
    };
  }, [user, addNotification]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    if (!showUserMenu && !showNotifications) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [showUserMenu, showNotifications]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/tutor/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      name: 'Students',
      href: '/tutor/students',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Sessions',
      href: '/tutor/sessions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      name: 'History',
      href: '/tutor/history',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      name: 'Messages',
      href: '/tutor/chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
  ];

  const isActivePage = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const formatUserRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  return (
    <header className="bg-white border-b-4 border-yellow-300 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left section */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Mobile menu button */}
            {showMobileMenuButton && (
              <button
                type="button"
                className="inline-flex items-center justify-center p-3 rounded-2xl text-purple-600 hover:text-purple-700 hover:bg-purple-200 focus:outline-none focus:ring-4 focus:ring-pink-300 lg:hidden transition-all min-h-[48px] min-w-[48px]"
                onClick={onMobileMenuToggle}
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Logo/Brand */}
            <button
              onClick={() => navigate('/tutor/dashboard')}
              className="flex items-center space-x-2 text-purple-700 hover:text-purple-800 transition-colors"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                👨‍🏫
              </div>
              <span className="hidden sm:block text-lg sm:text-xl font-bold">Tutor Portal</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:ml-10 lg:space-x-3">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`relative px-4 py-2 text-base font-bold rounded-2xl transition-all ${
                    isActivePage(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'text-purple-700 hover:text-purple-900 hover:bg-yellow-200'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg min-w-[24px] min-h-[24px]">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 text-purple-600 hover:text-purple-700 hover:bg-purple-200 rounded-2xl transition-all min-h-[48px] min-w-[48px] flex items-center justify-center"
                title="Notifications"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {totalUnreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-96 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-yellow-300 z-[100] max-h-[600px] overflow-y-auto">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-purple-900">🔔 Notifications</h3>
                      {notificationUnreadCount > 0 && (
                        <button
                          onClick={async () => {
                            await markAllAsRead();
                            fetchUnreadCount();
                          }}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notificationsLoading ? (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3 animate-spin">⏳</div>
                        <p className="text-purple-600 font-semibold text-sm">
                          Loading notifications...
                        </p>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((notification) => {
                          const getNotificationIcon = () => {
                            switch (notification.type) {
                              case 'badge_earned':
                                return '🏆';
                              case 'quiz_available':
                                return '📝';
                              case 'session_reminder':
                                return '⏰';
                              case 'study_reminder':
                                return '📚';
                              case 'message_received':
                                return '💬';
                              case 'payment_success':
                                return '💳';
                              case 'progress_report':
                                return '📊';
                              case 'system_announcement':
                                return '📢';
                              case 'session_request':
                                return '📅';
                              case 'session_cancelled':
                                return '❌';
                              case 'session_changed':
                                return '🔄';
                              default:
                                return '🔔';
                            }
                          };

                          const getNotificationColor = () => {
                            switch (notification.type) {
                              case 'badge_earned':
                                return 'border-yellow-200 bg-yellow-50';
                              case 'quiz_available':
                                return 'border-blue-200 bg-blue-50';
                              case 'session_reminder':
                                return 'border-purple-200 bg-purple-50';
                              case 'study_reminder':
                                return 'border-green-200 bg-green-50';
                              case 'message_received':
                                return 'border-pink-200 bg-pink-50';
                              case 'payment_success':
                                return 'border-green-200 bg-green-50';
                              case 'progress_report':
                                return 'border-indigo-200 bg-indigo-50';
                              case 'system_announcement':
                                return 'border-gray-200 bg-gray-50';
                              case 'session_request':
                                return 'border-blue-200 bg-blue-50';
                              case 'session_cancelled':
                                return 'border-red-200 bg-red-50';
                              case 'session_changed':
                                return 'border-orange-200 bg-orange-50';
                              default:
                                return 'border-gray-200 bg-gray-50';
                            }
                          };

                          return (
                            <div
                              key={notification.id}
                              className={`p-4 rounded-xl border-2 ${getNotificationColor()} ${
                                !notification.isRead ? 'ring-2 ring-purple-300' : ''
                              } cursor-pointer hover:shadow-md transition-all`}
                              onClick={async () => {
                                if (!notification.isRead) {
                                  await markAsRead(notification.id);
                                  fetchUnreadCount();
                                }

                                // Navigate based on notification type
                                if (notification.data?.sessionId) {
                                  navigate(`/tutor/sessions/${notification.data.sessionId}`);
                                  setShowNotifications(false);
                                } else if (notification.data?.chatId) {
                                  navigate(`/tutor/chat/${notification.data.chatId}`);
                                  setShowNotifications(false);
                                }
                              }}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl flex-shrink-0">
                                  {getNotificationIcon()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <p
                                      className={`text-sm font-bold ${!notification.isRead ? 'text-purple-900' : 'text-gray-700'}`}
                                    >
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1"></div>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await deleteNotification(notification.id);
                                    fetchUnreadCount();
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors"
                                  title="Delete notification"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-6xl mb-3">🔔</div>
                        <p className="text-purple-600 font-semibold text-base">No notifications</p>
                        <p className="text-gray-500 text-sm mt-2">You're all caught up!</p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowNotifications(false)}
                      className="w-full mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="flex items-center space-x-3 p-3 text-base rounded-2xl hover:bg-purple-200 transition-all min-h-[48px] border-2 border-transparent hover:border-purple-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-purple-900 font-bold text-base">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-purple-600">
                    {user?.role && formatUserRole(user.role)} • Tutor
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-[calc(100vw-2rem)] sm:max-w-none bg-white rounded-lg shadow-lg border border-gray-200 z-[100]">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-purple-900 truncate">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm text-amber-600 truncate">{user?.email}</div>
                        <div className="text-xs text-amber-500 truncate">
                          {user?.role && formatUserRole(user.role)} • Tutor
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/tutor/profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-purple-50 flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="truncate">Profile Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/tutor/settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-purple-50 flex items-center space-x-2"
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="truncate">Settings</span>
                    </button>
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 flex items-center space-x-2"
                      >
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span className="truncate">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t-4 border-yellow-300 bg-white">
        <nav className="px-4 py-2 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.href)}
              className={`relative w-full flex items-center space-x-4 px-4 py-2 text-base font-bold rounded-2xl transition-all ${
                isActivePage(item.href)
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'text-purple-700 hover:text-purple-900 hover:bg-yellow-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto inline-flex items-center justify-center px-3 py-1.5 text-sm font-bold leading-none text-white bg-gradient-to-r from-pink-500 to-red-500 rounded-full shadow-lg min-w-[28px] min-h-[28px]">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
