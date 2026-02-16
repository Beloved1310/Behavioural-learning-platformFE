import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';

export const TutorVerification: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // Redirect if not a tutor or already verified
    if (user?.role !== 'TUTOR') {
      navigate('/dashboard');
      return;
    }

    if (user?.isVerified) {
      navigate('/tutor/onboarding');
      return;
    }
  }, [user, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await userService.resendVerificationEmail();
      setResendSuccess(true);
      setCanResend(false);
      setTimeLeft(60);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify Your Email"
      subtitle="Welcome to the Behavioral Learning Platform Tutor Program"
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Main Verification Message */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-xl">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                  />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <span className="text-sm sm:text-lg">📧</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-purple-900 mb-2 sm:mb-3">
            Check Your Email
          </h3>

          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-purple-800 font-medium">
              We've sent a verification link to:
            </p>
            <div className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-lg sm:rounded-xl shadow-md border border-purple-200 max-w-full">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
              <span className="text-sm sm:text-lg font-bold text-purple-900 truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-purple-700 leading-relaxed px-2">
            Please click the verification link in your email to activate your tutor account. Check
            your spam folder if you don't see it.
          </p>
        </div>

        {/* Success Message */}
        {resendSuccess && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-fadeIn">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900">
                Verification email sent successfully!
              </p>
              <p className="text-xs text-green-700">Please check your inbox and spam folder.</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-sm font-semibold text-red-900">{error}</p>
          </div>
        )}

        {/* Resend Email Button */}
        <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-700">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-medium">Didn't receive the email?</span>
            </div>

            <Button
              type="button"
              onClick={handleResendEmail}
              disabled={!canResend || isResending}
              className="w-full"
              isLoading={isResending}
            >
              {canResend ? 'Resend Verification Email' : `Resend available in ${timeLeft}s`}
            </Button>

            {!canResend && (
              <p className="text-xs text-gray-500">
                You can request a new email in {timeLeft} seconds
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <h4 className="text-xs sm:text-sm font-bold text-blue-900 mb-3 sm:mb-4 flex items-center">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            What happens next?
          </h4>
          <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-900 text-xs">
                1
              </span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-900 text-xs">
                2
              </span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-900 text-xs">
                3
              </span>
              <span>Complete your tutor profile and submit documents</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-900 text-xs">
                4
              </span>
              <span>Wait for admin approval to start tutoring</span>
            </li>
          </ol>
        </div>

        {/* Additional Help */}
        <div className="text-center space-y-3">
          <div className="text-sm text-gray-600">
            <span>Need help? </span>
            <a
              href="mailto:support@behaviorallearning.com"
              className="font-medium text-purple-600 hover:text-pink-600 transition-colors"
            >
              Contact Support
            </a>
          </div>

          <div className="text-sm text-gray-600">
            <span>Wrong email address? </span>
            <Link
              to="/profile"
              className="font-medium text-purple-600 hover:text-pink-600 transition-colors"
            >
              Update Email
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Link to="/login">
              <Button type="button" variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
