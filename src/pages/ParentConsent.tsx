import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { AuthService } from '../services/authService';

interface ConsentData {
  studentName: string;
  studentEmail: string;
  studentAge: number;
  registrationDate: string;
}

export const ParentConsent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentRejected, setConsentRejected] = useState(false);

  useEffect(() => {
    // In a real implementation, fetch student details from the backend using the token
    if (token) {
      // Mock data for now
      setConsentData({
        studentName: 'Student Name',
        studentEmail: 'student@example.com',
        studentAge: 15,
        registrationDate: new Date().toLocaleDateString(),
      });
    }
  }, [token]);

  const handleApprove = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Call backend API to approve consent
      // await AuthService.approveParentalConsent(token);

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConsentGiven(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve consent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Call backend API to reject consent
      // await AuthService.rejectParentalConsent(token);

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConsentRejected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject consent');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid consent link" subtitle="This parental consent link is invalid">
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-pink-900 mb-2">Invalid Consent Link</h3>
          <p className="text-sm text-pink-700">
            This parental consent link is invalid or has expired. Please contact support for assistance.
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (consentGiven) {
    return (
      <AuthLayout
        title="Consent approved!"
        subtitle="Thank you for approving your child's registration"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Parental Consent Approved
            </h3>
            <p className="text-sm text-green-700 mb-4">
              You have successfully approved your child's account. They can now access the platform and start their learning journey!
            </p>
            <p className="text-sm text-green-700">
              You will receive regular updates about their progress and activities.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (consentRejected) {
    return (
      <AuthLayout
        title="Consent not approved"
        subtitle="The registration request has been declined"
      >
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              Registration Declined
            </h3>
            <p className="text-sm text-amber-700">
              You have declined the registration request. The account will not be activated. If this was a mistake, please contact support.
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Parental Consent Required"
      subtitle="Please review and approve your child's registration"
    >
      <div className="space-y-6">
        {error && (
          <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">
            Account Registration Request
          </h3>

          {consentData && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700 font-medium">Student Name:</span>
                <span className="text-purple-900">{consentData.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700 font-medium">Email:</span>
                <span className="text-purple-900">{consentData.studentEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700 font-medium">Age:</span>
                <span className="text-purple-900">{consentData.studentAge} years old</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700 font-medium">Registration Date:</span>
                <span className="text-purple-900">{consentData.registrationDate}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Important Information
          </h4>
          <ul className="text-sm text-amber-800 space-y-2 ml-7">
            <li>• By approving, you give consent for your child to use this learning platform</li>
            <li>• You will have access to their progress reports and activities</li>
            <li>• You can revoke access at any time through the parent dashboard</li>
            <li>• We comply with COPPA regulations for users under 13</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleApprove}
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Approve Registration
          </Button>

          <Button
            type="button"
            onClick={handleReject}
            variant="outline"
            size="lg"
            className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
            isLoading={isLoading}
          >
            Decline Registration
          </Button>
        </div>

        <div className="text-center text-xs text-amber-600">
          By clicking "Approve Registration", you confirm that you are the parent or legal guardian
          of the student named above.
        </div>
      </div>
    </AuthLayout>
  );
};
