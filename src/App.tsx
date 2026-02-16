import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { socketService } from './services/socketService';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { EmailSent } from './pages/EmailSent';
import { ParentConsent } from './pages/ParentConsent';
import { RegistrationPending } from './pages/RegistrationPending';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Gamification } from './pages/Gamification';
import { Sessions } from './pages/Sessions';
import { BehavioralDashboard } from './pages/BehavioralDashboard';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { TutorVerification } from './pages/TutorVerification';
import { TutorDashboard } from './pages/TutorDashboard';
import { QuizCreation } from './pages/QuizCreation';
import { TutorSessions } from './pages/TutorSessions';
import { TutorSessionDetails } from './pages/TutorSessionDetails';
import { TutorChat } from './pages/TutorChat';
import { TutorProfile } from './pages/TutorProfile';
import { TutorSettings } from './pages/TutorSettings';
import { TutorStudents } from './pages/TutorStudents';
import { TutorStudentDetail } from './pages/TutorStudentDetail';
import { TutorStudentOnboard } from './pages/TutorStudentOnboard';
import { TutorHistory } from './pages/TutorHistory';
import { TutorAtRiskStudents } from './pages/TutorAtRiskStudents';
import { TutorApproveSessions } from './pages/TutorApproveSessions';
// import { Lessons } from './pages/Lessons'; // Removed from MVP - keeping for future use
// import { Payment } from './pages/Payment'; // Removed from MVP - payment not needed
// import { ParentDashboard } from './pages/ParentDashboard'; // Removed from MVP - parents receive emails only
// import { ParentQuizResults } from './pages/ParentQuizResults'; // Removed from MVP - parents receive emails only
import { Milestones } from './pages/Milestones';
import { Reflections } from './pages/Reflections';
import { CommitmentsHistory } from './pages/CommitmentsHistory';
import { AdminDashboard } from './pages/AdminDashboard';

// Simple parent info page (MVP - parents receive emails only)
const ParentInfoPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.firstName}!</h1>
          <p className="text-gray-600">You're all set to receive weekly progress reports</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border-l-4 border-purple-500">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <span className="mr-2">📊</span>
              Weekly Progress Reports
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Every Monday, you'll receive a detailed email report about your child's learning
              progress, including:
            </p>
            <ul className="mt-4 space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">🔥</span>
                <span>Current learning streak</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">🎯</span>
                <span>Goal progress and achievements</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✅</span>
                <span>Weekly commitments completion</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">📈</span>
                <span>Consistency and engagement metrics</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">⚠️</span>
                <span>Alerts if your child needs additional support</span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              How It Works
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Your child's tutor actively monitors their progress and will reach out if additional
              support is needed. The weekly email keeps you informed without requiring you to log
              in. This allows you to stay connected while your child focuses on learning with their
              tutor's guidance.
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">✉️</span>
              Email Preferences
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Reports are sent to: <strong>{user?.email}</strong>
            </p>
            <p className="text-gray-600 text-xs mt-2">
              If you need to update your email address or adjust preferences, please contact
              support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Redirect admins to admin dashboard if they try to access regular routes
  if (user?.role === 'ADMIN' && !window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect tutors to tutor dashboard if they try to access regular routes
  if (
    user?.role === 'TUTOR' &&
    !window.location.pathname.startsWith('/tutor') &&
    !window.location.pathname.startsWith('/tutor/verification') &&
    !window.location.pathname.startsWith('/admin')
  ) {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  // Block parents from accessing student routes
  // MVP: Parents receive email reports only, no dashboard access
  if (user?.role === 'PARENT') {
    // Redirect parents to a simple message page explaining they receive emails
    if (!window.location.pathname.startsWith('/parent/info')) {
      return <Navigate to="/parent/info" replace />;
    }
  }

  // Redirect non-admins away from admin routes
  if (user?.role !== 'ADMIN' && window.location.pathname.startsWith('/admin')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect non-tutors away from tutor routes (except verification)
  if (
    user?.role !== 'TUTOR' &&
    window.location.pathname.startsWith('/tutor') &&
    !window.location.pathname.startsWith('/tutor/verification')
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect non-parents away from parent routes
  if (user?.role !== 'PARENT' && window.location.pathname.startsWith('/parent')) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

// Component to redirect to appropriate dashboard based on role
const NavigateToDashboard: React.FC = () => {
  const { user } = useAuthStore();

  // Redirect admins to admin dashboard
  if (user?.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Redirect parents to info page (MVP - email-only)
  if (user?.role === 'PARENT') {
    return <Navigate to="/parent/info" replace />;
  }

  // Redirect tutors to tutor dashboard
  if (user?.role === 'TUTOR') {
    return <Navigate to="/tutor/dashboard" replace />;
  }

  // Default to student dashboard
  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { getProfile, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Check if user is authenticated on app load
    if (localStorage.getItem('accessToken') && !isAuthenticated) {
      getProfile();
    }
  }, [getProfile, isAuthenticated]);

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socketService.connect(token);
      }
    } else {
      // Disconnect socket when user logs out
      socketService.disconnect();
    }

    return () => {
      // Cleanup on unmount
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [user, isAuthenticated]);

  return (
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <VerifyEmail />
                  </PublicRoute>
                }
              />
              <Route
                path="/email-sent"
                element={
                  <PublicRoute>
                    <EmailSent />
                  </PublicRoute>
                }
              />
              <Route path="/parent-consent" element={<ParentConsent />} />
              <Route path="/registration-pending" element={<RegistrationPending />} />

              {/* Private Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <PrivateRoute>
                    <Chat />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gamification"
                element={
                  <PrivateRoute>
                    <Gamification />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sessions"
                element={
                  <PrivateRoute>
                    <Sessions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/behavioral"
                element={
                  <PrivateRoute>
                    <BehavioralDashboard />
                  </PrivateRoute>
                }
              />
              {/* Payment route removed from MVP */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/milestones"
                element={
                  <PrivateRoute>
                    <Milestones />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reflections"
                element={
                  <PrivateRoute>
                    <Reflections />
                  </PrivateRoute>
                }
              />
              <Route
                path="/commitments/history"
                element={
                  <PrivateRoute>
                    <CommitmentsHistory />
                  </PrivateRoute>
                }
              />

              {/* Tutor Routes */}
              <Route
                path="/tutor/verification"
                element={
                  <PrivateRoute>
                    <TutorVerification />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/dashboard"
                element={
                  <PrivateRoute>
                    <TutorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/quiz/create"
                element={
                  <PrivateRoute>
                    <QuizCreation />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/sessions"
                element={
                  <PrivateRoute>
                    <TutorSessions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/sessions/:sessionId"
                element={
                  <PrivateRoute>
                    <TutorSessionDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/chat"
                element={
                  <PrivateRoute>
                    <TutorChat />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/profile"
                element={
                  <PrivateRoute>
                    <TutorProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/settings"
                element={
                  <PrivateRoute>
                    <TutorSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/students"
                element={
                  <PrivateRoute>
                    <TutorStudents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/students/:studentId"
                element={
                  <PrivateRoute>
                    <TutorStudentDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/students/onboard"
                element={
                  <PrivateRoute>
                    <TutorStudentOnboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/history"
                element={
                  <PrivateRoute>
                    <TutorHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/students/at-risk"
                element={
                  <PrivateRoute>
                    <TutorAtRiskStudents />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tutor/sessions/approve"
                element={
                  <PrivateRoute>
                    <TutorApproveSessions />
                  </PrivateRoute>
                }
              />

              {/* Parent Routes - MVP: Parents receive email reports only */}
              <Route
                path="/parent/info"
                element={
                  <PrivateRoute>
                    <ParentInfoPage />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />

              {/* Default redirect - based on user role */}
              <Route path="/" element={<NavigateToDashboard />} />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900">404</h1>
                      <p className="text-gray-600">Page not found</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </ToastProvider>
  );
}

export default App;
