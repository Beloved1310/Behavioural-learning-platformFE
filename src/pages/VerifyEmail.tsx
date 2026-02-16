import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { AuthService } from '../services/authService';

type VerificationState = 'loading' | 'success' | 'error';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Use a single state to prevent race conditions
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState<string>('');
  const hasVerifiedRef = useRef(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Prevent multiple verification attempts
    if (hasVerifiedRef.current) {
      return;
    }

    const verifyEmail = async () => {
      // Check for token first
      if (!token) {
        setState('error');
        setMessage('Invalid or missing verification token');
        return;
      }

      try {
        // Mark as verifying to prevent duplicate calls
        hasVerifiedRef.current = true;

        const result = await AuthService.verifyEmail(token);

        // Set success state - this should persist
        setState('success');
        setMessage(result || 'Email verified successfully!');

        // Clear any existing timeout
        if (redirectTimeoutRef.current) {
          clearTimeout(redirectTimeoutRef.current);
        }

        // Redirect to login after 3 seconds
        redirectTimeoutRef.current = setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } catch (err) {
        // Only set error if verification hasn't already succeeded
        // Use functional update to check current state
        setState((currentState) => {
          if (currentState === 'success') {
            // Don't override success state
            return currentState;
          }
          setMessage(err instanceof Error ? err.message : 'Failed to verify email');
          return 'error';
        });
      }
    };

    verifyEmail();

    // Cleanup function
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [token, navigate]); // Removed state from dependencies to prevent re-triggering

  // Loading state
  if (state === 'loading') {
    return (
      <AuthLayout
        title="Verifying your email"
        subtitle="Please wait while we verify your email address"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Verifying your email...</h3>
            <p className="text-sm text-blue-700">This will only take a moment.</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Success state - check this FIRST to prevent error from overriding
  if (state === 'success') {
    return (
      <AuthLayout
        title="Email verified successfully!"
        subtitle="Your email has been verified. You can now login to your account."
      >
        <div className="space-y-6">
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 text-center shadow-sm">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Email Successfully Verified!
            </h3>
            <p className="text-sm text-green-700 mb-4">
              {message || 'Your email has been verified. You can now log in to your account.'}
            </p>
            <p className="text-xs text-green-600">Redirecting to login page in a few seconds...</p>
          </div>

          <Link to="/login">
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              Go to login now
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Error state - only show if we're not in success state
  if (state === 'error') {
    return (
      <AuthLayout title="Email verification failed" subtitle="Unable to verify your email address">
        <div className="space-y-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Verification Failed</h3>
            <p className="text-sm text-red-700 mb-4">
              {message ||
                'This verification link is invalid or has expired. Please request a new one.'}
            </p>
          </div>

          <Link to="/login">
            <Button type="button" className="w-full">
              Go to login
            </Button>
          </Link>

          <div className="text-center text-sm text-gray-600">
            Need help?{' '}
            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
              Try registering again
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Fallback (should not reach here)
  return null;
};
