import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CreditCard,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Crown
} from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { useAuthStore } from '../../store/authStore';
import { UserSubscription, SubscriptionTier } from '../../types';
import { Button } from '../ui/Button';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';

export const SubscriptionManagement: React.FC = () => {
  const { user } = useAuthStore();
  const {
    subscription,
    paymentMethods,
    isLoading,
    error,
    fetchUserSubscription,
    fetchPaymentMethods,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription
  } = usePaymentStore();

  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetchUserSubscription();
    fetchPaymentMethods();
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'expired':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      case 'trial':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'cancelled':
        return 'text-red-700 bg-red-100';
      case 'expired':
        return 'text-gray-700 bg-gray-100';
      case 'trial':
        return 'text-blue-700 bg-blue-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!subscription) return;

    try {
      await updateSubscription({
        autoRenew: !subscription.autoRenew
      });
    } catch (error) {
      console.error('Error toggling auto-renew:', error);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;

    try {
      await reactivateSubscription();
    } catch (error) {
      console.error('Error reactivating subscription:', error);
    }
  };

  const handleCancelSubscription = async (reason: string) => {
    try {
      await cancelSubscription(reason);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
    }
  };

  const getTrialDaysRemaining = () => {
    if (!subscription?.trialEndsAt) return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const defaultPaymentMethod = paymentMethods.find(method => method.isDefault);

  if (isLoading && !subscription) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-4">
          Subscribe to unlock premium features and enhance your learning experience.
        </p>
        <Button onClick={() => window.location.href = '/subscription/plans'}>
          View Subscription Plans
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
        <p className="text-gray-600 mt-1">
          Manage your subscription plan and billing preferences
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Current Subscription Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              subscription.plan.tier === SubscriptionTier.PREMIUM ? 'bg-purple-100' : 'bg-blue-100'
            }`}>
              <Crown className={`h-6 w-6 ${
                subscription.plan.tier === SubscriptionTier.PREMIUM ? 'text-purple-600' : 'text-blue-600'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{subscription.plan.name}</h3>
              <p className="text-gray-600">{subscription.plan.description}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
            {getStatusIcon(subscription.status)}
            <span className="capitalize">{subscription.status}</span>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">Plan Price</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatCurrency(subscription.plan.price)} / {subscription.plan.billingPeriod}
              </div>
            </div>

            {subscription.sessionCreditsRemaining !== undefined && (
              <div>
                <div className="text-sm text-gray-600">Session Credits Remaining</div>
                <div className="text-lg font-semibold text-gray-900">
                  {subscription.plan.sessionCredits === -1
                    ? 'Unlimited'
                    : subscription.sessionCreditsRemaining
                  }
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">
                {subscription.status === 'trial' ? 'Trial Ends' :
                 subscription.status === 'cancelled' ? 'Expires' :
                 subscription.autoRenew ? 'Next Billing' : 'Expires'}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {subscription.status === 'trial' && subscription.trialEndsAt
                  ? formatDate(subscription.trialEndsAt)
                  : subscription.autoRenew && subscription.nextPaymentDate
                  ? formatDate(subscription.nextPaymentDate)
                  : formatDate(subscription.endDate)
                }
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Auto Renewal</div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-gray-900">
                  {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                </span>
                {subscription.status === 'active' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleAutoRenew}
                    disabled={isLoading}
                  >
                    {subscription.autoRenew ? 'Disable' : 'Enable'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trial Status */}
        {subscription.status === 'trial' && subscription.trialEndsAt && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-blue-800 font-medium">
                  Free Trial - {getTrialDaysRemaining()} days remaining
                </div>
                <div className="text-blue-700 text-sm">
                  Your trial ends on {formatDate(subscription.trialEndsAt)}.
                  Add a payment method to continue your subscription.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancelled Subscription Notice */}
        {subscription.status === 'cancelled' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-red-800 font-medium">Subscription Cancelled</div>
                  <div className="text-red-700 text-sm">
                    You'll have access until {formatDate(subscription.endDate)}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReactivate}
                disabled={isLoading}
              >
                Reactivate
              </Button>
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {subscription.plan.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {subscription.status === 'active' && (
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/subscription/plans'}
            >
              Change Plan
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              Cancel Subscription
            </Button>
          </div>
        )}
      </div>

      {/* Payment Method Card */}
      {defaultPaymentMethod && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = '/payment/methods'}
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {defaultPaymentMethod.cardBrand?.toUpperCase()} •••• {defaultPaymentMethod.cardLast4}
              </div>
              <div className="text-sm text-gray-600">
                {defaultPaymentMethod.holderName}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing History Link */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
            <p className="text-gray-600">View your past invoices and payments</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/payment/transactions'}
          >
            <Calendar className="h-4 w-4 mr-1" />
            View History
          </Button>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSubscription}
          subscription={subscription}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};