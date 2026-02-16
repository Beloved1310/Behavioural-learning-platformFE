import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';

export const EmailSent: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    email?: string;
    parentEmail?: string;
    isStudentUnder18?: boolean;
  } | null;
  const email = state?.email || '';
  const parentEmail = state?.parentEmail;
  const isStudentUnder18 = state?.isStudentUnder18 || false;

  return (
    <AuthLayout title="Check your email" subtitle="We've sent you verification instructions">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">📧</div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Verification Email Sent!</h3>
          <p className="text-sm text-blue-700 mb-4">
            We've sent a verification link to your email address. Please check your inbox and click
            the link to verify your account.
          </p>

          {email && (
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white rounded-xl shadow-md border border-blue-200 mb-4">
              <svg
                className="w-5 h-5 text-blue-600"
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
              <span className="text-lg font-bold text-blue-900">{email}</span>
            </div>
          )}

          {isStudentUnder18 && parentEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
                <span className="text-xl mr-2">👨‍👩‍👧‍👦</span>
                Parent Notification Sent
              </h4>
              <p className="text-sm text-amber-700 mb-2">
                We've also sent a notification email to your parent/guardian at:
              </p>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-amber-200">
                <svg
                  className="w-4 h-4 text-amber-600"
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
                <span className="text-sm font-medium text-amber-900">{parentEmail}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-purple-800 space-y-2">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">1.</span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">2.</span>
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">3.</span>
              <span>Once verified, you can log in to your account</span>
            </li>
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Didn't receive the email?
          </h4>
          <p className="text-sm text-green-700 mb-3">
            Check your spam folder. The email was sent from our platform and contains a secure
            verification link.
          </p>
          <p className="text-sm text-green-700">
            If you still haven't received it after 10 minutes, please contact our support team.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link to="/login">
            <Button type="button" variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>

          <p className="text-center text-xs text-amber-600">
            Questions? Contact us at support@example.com
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
