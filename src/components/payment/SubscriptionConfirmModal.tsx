import React, { useState } from 'react';
import { CreditCard, X, AlertCircle } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { SubscriptionPlan, PaymentMethod } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface SubscriptionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan;
  paymentMethods: PaymentMethod[];
}

export const SubscriptionConfirmModal: React.FC<SubscriptionConfirmModalProps> = ({
  isOpen,
  onClose,
  plan,
  paymentMethods
}) => {
  const { subscribeToplan, isLoading } = usePaymentStore();
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleSubscribe = async () => {
    if (!selectedPaymentMethodId || !agreedToTerms) return;

    try {
      await subscribeToplan({
        planId: plan.id,
        paymentMethodId: selectedPaymentMethodId
      });
      onClose();
    } catch (error) {
      console.error('Error subscribing to plan:', error);
    }
  };

  const paymentMethodOptions = paymentMethods.map(method => ({
    value: method.id,
    label: `${method.type === 'credit_card' ? 'Credit' : 'Debit'} Card •••• ${method.cardLast4} (${method.cardBrand?.toUpperCase()})`
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Subscription
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Plan Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{plan.name}</h4>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {formatPrice(plan.price)}
                </div>
                <div className="text-sm text-gray-600">
                  per {plan.billingPeriod === 'monthly' ? 'month' : 'year'}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{plan.description}</p>

            {plan.trialDays && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Includes {plan.trialDays}-day free trial
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <Select
              value={selectedPaymentMethodId}
              onChange={setSelectedPaymentMethodId}
              options={paymentMethodOptions}
              placeholder="Select a payment method"
            />
            {paymentMethods.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                Please add a payment method before subscribing.
              </p>
            )}
          </div>

          {/* Billing Information */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Billing Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{plan.name} Plan</span>
                <span className="font-medium">{formatPrice(plan.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Billing Frequency</span>
                <span className="font-medium capitalize">{plan.billingPeriod}</span>
              </div>
              {plan.sessionCredits && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Session Credits</span>
                  <span className="font-medium">
                    {plan.sessionCredits === -1 ? 'Unlimited' : plan.sessionCredits}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(plan.price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mb-6">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                  Privacy Policy
                </a>
                . My subscription will automatically renew unless cancelled.
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubscribe}
              disabled={!selectedPaymentMethodId || !agreedToTerms || isLoading}
              className="flex-1"
            >
              {isLoading
                ? 'Processing...'
                : plan.trialDays
                ? 'Start Free Trial'
                : 'Subscribe Now'
              }
            </Button>
          </div>

          {/* Additional Information */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                {plan.trialDays ? (
                  <>
                    You won't be charged until your {plan.trialDays}-day trial ends.
                    Cancel anytime during the trial period at no cost.
                  </>
                ) : (
                  <>
                    You'll be charged immediately and then on the same date each{' '}
                    {plan.billingPeriod === 'monthly' ? 'month' : 'year'}.
                    Cancel anytime from your account settings.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};