import React, { useState, useEffect } from 'react';
import { Check, Crown, Star, Zap } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { useAuthStore } from '../../store/authStore';
import { SubscriptionPlan, SubscriptionTier } from '../../types';
import { Button } from '../ui/Button';
import { SubscriptionConfirmModal } from './SubscriptionConfirmModal';

export const SubscriptionPlans: React.FC = () => {
  const { user } = useAuthStore();
  const {
    subscriptionPlans,
    subscription,
    paymentMethods,
    isLoading,
    error,
    fetchSubscriptionPlans,
    fetchUserSubscription,
    fetchPaymentMethods
  } = usePaymentStore();

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    fetchSubscriptionPlans();
    fetchUserSubscription();
    fetchPaymentMethods();
  }, []);

  const formatPrice = (price: number, period: string) => {
    const monthlyPrice = period === 'yearly' ? price / 12 : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(monthlyPrice);
  };

  const getDiscountPercentage = (monthlyPrice: number, yearlyPrice: number) => {
    const monthlyTotal = monthlyPrice * 12;
    return Math.round(((monthlyTotal - yearlyPrice) / monthlyTotal) * 100);
  };

  const getPlanIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.BASIC:
        return <Star className="h-6 w-6" />;
      case SubscriptionTier.PREMIUM:
        return <Crown className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const getPlanColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.BASIC:
        return 'border-blue-300 bg-blue-50';
      case SubscriptionTier.PREMIUM:
        return 'border-purple-300 bg-purple-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getPlanButtonColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case SubscriptionTier.BASIC:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case SubscriptionTier.PREMIUM:
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (paymentMethods.length === 0) {
      alert('Please add a payment method before subscribing');
      return;
    }
    setSelectedPlan(plan);
    setShowConfirmModal(true);
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.planId === planId && subscription?.status === 'active';
  };

  const canUpgrade = (plan: SubscriptionPlan) => {
    if (!subscription || subscription.status !== 'active') return true;
    return plan.tier === SubscriptionTier.PREMIUM && subscription.plan.tier === SubscriptionTier.BASIC;
  };

  const canDowngrade = (plan: SubscriptionPlan) => {
    if (!subscription || subscription.status !== 'active') return false;
    return plan.tier === SubscriptionTier.BASIC && subscription.plan.tier === SubscriptionTier.PREMIUM;
  };

  const filteredPlans = subscriptionPlans.filter(plan =>
    plan.isActive && plan.billingPeriod === billingPeriod
  );

  if (isLoading && subscriptionPlans.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
        <p className="text-lg text-gray-600 mb-8">
          Unlock the full potential of your learning journey with our subscription plans
        </p>

        {/* Billing Period Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-blue-600' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              billingPeriod === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-blue-600' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-1 text-green-600 font-semibold">Save up to 20%</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Current Subscription Status */}
      {subscription && subscription.status === 'active' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              Currently subscribed to {subscription.plan.name}
            </span>
          </div>
          <div className="text-sm text-green-700 mt-1">
            {subscription.autoRenew
              ? `Next billing on ${new Date(subscription.nextPaymentDate || '').toLocaleDateString()}`
              : `Expires on ${new Date(subscription.endDate).toLocaleDateString()}`
            }
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredPlans.map((plan) => {
          const yearlyPlan = subscriptionPlans.find(p =>
            p.tier === plan.tier && p.billingPeriod === 'yearly' && p.isActive
          );
          const discountPercentage = yearlyPlan ? getDiscountPercentage(plan.price, yearlyPlan.price) : 0;

          return (
            <div
              key={plan.id}
              className={`relative rounded-lg border-2 p-8 ${getPlanColor(plan.tier)} ${
                plan.tier === SubscriptionTier.PREMIUM ? 'ring-2 ring-purple-200' : ''
              }`}
            >
              {plan.tier === SubscriptionTier.PREMIUM && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  plan.tier === SubscriptionTier.BASIC ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {getPlanIcon(plan.tier)}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price, plan.billingPeriod)}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{billingPeriod === 'yearly' ? 'mo' : 'month'}
                    </span>
                  </div>
                  {billingPeriod === 'yearly' && discountPercentage > 0 && (
                    <div className="text-green-600 text-sm font-medium mt-1">
                      Save {discountPercentage}% annually
                    </div>
                  )}
                  {plan.billingPeriod === 'yearly' && (
                    <div className="text-gray-500 text-sm mt-1">
                      Billed annually: {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      }).format(plan.price)}
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {plan.sessionCredits && (
                  <div className="mb-4 p-3 bg-white rounded-lg border">
                    <div className="text-sm text-gray-600">Session Credits</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {plan.sessionCredits === -1 ? 'Unlimited' : `${plan.sessionCredits} credits`}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan(plan.id) || isLoading}
                  className={`w-full ${getPlanButtonColor(plan.tier)} ${
                    isCurrentPlan(plan.id) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isCurrentPlan(plan.id)
                    ? 'Current Plan'
                    : canUpgrade(plan)
                    ? 'Upgrade Now'
                    : canDowngrade(plan)
                    ? 'Downgrade'
                    : plan.trialDays
                    ? `Start ${plan.trialDays}-Day Free Trial`
                    : 'Subscribe Now'
                  }
                </Button>

                {plan.trialDays && !isCurrentPlan(plan.id) && (
                  <p className="text-xs text-gray-500 mt-2">
                    No credit card required for trial
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
          Plan Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">Features</th>
                <th className="text-center py-3 px-4">Basic</th>
                <th className="text-center py-3 px-4">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">1-on-1 Tutoring Sessions</td>
                <td className="text-center py-3 px-4">
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">AI-Powered Learning Analytics</td>
                <td className="text-center py-3 px-4">
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">Priority Tutor Access</td>
                <td className="text-center py-3 px-4">
                  <span className="text-gray-400">—</span>
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">Advanced Progress Reports</td>
                <td className="text-center py-3 px-4">
                  <span className="text-gray-400">—</span>
                </td>
                <td className="text-center py-3 px-4">
                  <Check className="h-4 w-4 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4">24/7 Support</td>
                <td className="text-center py-3 px-4">
                  <span className="text-gray-400">Email</span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="text-green-600 font-medium">Priority</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Subscription Confirm Modal */}
      {showConfirmModal && selectedPlan && (
        <SubscriptionConfirmModal
          isOpen={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          paymentMethods={paymentMethods}
        />
      )}
    </div>
  );
};