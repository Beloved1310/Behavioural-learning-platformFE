import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { UserSubscription } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  subscription: UserSubscription;
  isLoading: boolean;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  isLoading
}) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const reasonOptions = [
    { value: '', label: 'Select a reason' },
    { value: 'too_expensive', label: 'Too expensive' },
    { value: 'not_using_enough', label: 'Not using the service enough' },
    { value: 'missing_features', label: 'Missing features I need' },
    { value: 'poor_experience', label: 'Poor user experience' },
    { value: 'found_alternative', label: 'Found a better alternative' },
    { value: 'temporary_break', label: 'Taking a temporary break' },
    { value: 'other', label: 'Other' }
  ];

  const handleConfirm = async () => {
    const finalReason = reason === 'other' ? customReason : reason;
    if (!finalReason) return;

    try {
      await onConfirm(finalReason);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Cancel Subscription
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-red-800 mb-2">
                Are you sure you want to cancel?
              </h4>
              <div className="text-sm text-red-700 space-y-1">
                <p>• You'll lose access to all premium features</p>
                <p>• Your learning progress will be limited</p>
                <p>• You can reactivate anytime before {formatDate(subscription.endDate)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Plan Details</h4>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{subscription.plan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">
                    {formatCurrency(subscription.plan.price)} / {subscription.plan.billingPeriod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Access until:</span>
                  <span className="font-medium">{formatDate(subscription.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Please tell us why you're cancelling (optional)
            </label>
            <Select
              value={reason}
              onChange={setReason}
              options={reasonOptions}
            />
          </div>

          {reason === 'other' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please specify
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tell us more about your reason for cancelling..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Before you go...</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Contact our support team if you're having issues</p>
              <p>• Consider downgrading to our Basic plan instead</p>
              <p>• You can pause your subscription for up to 3 months</p>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('/support', '_blank')}
                className="text-blue-600 border-blue-300 hover:border-blue-400"
              >
                Contact Support
              </Button>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Keep Subscription
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              You'll continue to have access until {formatDate(subscription.endDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};