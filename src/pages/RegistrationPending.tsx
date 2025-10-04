import React from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';

export const RegistrationPending: React.FC = () => {
  return (
    <AuthLayout
      title="Registration Pending"
      subtitle="Waiting for parental consent"
    >
      <div className="space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Almost there!
          </h3>
          <p className="text-sm text-amber-700">
            Your registration is pending parental approval. We've sent an email to your parent or
            guardian asking them to approve your account.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-semibold text-purple-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-purple-800 space-y-2">
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">1.</span>
              <span>Your parent/guardian will receive an email with a consent form</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">2.</span>
              <span>They will need to review and approve your registration</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-500 mr-2">3.</span>
              <span>Once approved, you'll receive an email and can start learning!</span>
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
            Ask your parent/guardian to check their spam folder. The email was sent from our
            platform and contains a secure approval link.
          </p>
          <p className="text-sm text-green-700">
            If they still haven't received it after 10 minutes, please contact our support team.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Link to="/login">
            <Button type="button" variant="outline" className="w-full">
              Return to Login
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
