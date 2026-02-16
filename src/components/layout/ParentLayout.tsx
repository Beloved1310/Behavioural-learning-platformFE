import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { CreditCard, BarChart3, BookOpen, Users, Shield } from 'lucide-react';

export const ParentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActivePage = (href: string) => {
    if (href.includes('?')) {
      const [path] = href.split('?');
      return location.pathname === path || location.pathname.startsWith(path);
    }
    return location.pathname === href || location.pathname.startsWith(href);
  };

  const parentNavigationItems = [
    {
      name: 'Family Dashboard',
      href: '/parent/dashboard',
      icon: <Users className="w-5 h-5" />,
      description: 'Overview of children',
    },
    {
      name: 'Progress Reports',
      href: '/analytics?tab=parental-dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Student progress',
    },
    {
      name: 'Quiz Results',
      href: '/parent/quiz-results',
      icon: <BookOpen className="w-5 h-5" />,
      description: "Children's quizzes",
    },
    {
      name: 'Payment',
      href: '/payment',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Manage payments',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header - Guardian Styling */}
      <header className="bg-white border-b-2 border-indigo-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Guardian Portal</h1>
                  <p className="text-xs text-indigo-600">Family Learning Management</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {parentNavigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActivePage(item.href)
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-indigo-600">Guardian</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {user.firstName?.[0]}
                    {user.lastName?.[0]}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="flex overflow-x-auto px-4 py-2 space-x-2">
            {parentNavigationItems.map((item) => (
              <button
                key={item.name}
                onClick={() => navigate(item.href)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActivePage(item.href)
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-700 bg-gray-100 hover:bg-indigo-50'
                }`}
              >
                <div className="flex flex-col items-center space-y-1">
                  {item.icon}
                  <span className="text-[10px]">{item.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-indigo-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="w-5 h-5 text-indigo-600" />
              <p className="text-sm text-gray-600">
                Guardian Portal - Secure Family Learning Management
              </p>
            </div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Learning Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
