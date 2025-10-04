import React, { useState, useMemo, Suspense, lazy, useEffect } from 'react';
import { DashboardLayout, MainLayout } from '../components/layout/MainLayout';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { EnhancedComponentLoader } from '../components/common/SkeletonLoaders';
import { initializeSecurity, SecurityAudit } from '../utils/security';
import {
  CreditCard,
  Receipt,
  Users,
  RefreshCw,
  Crown,
  Bell,
  DollarSign
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

// Lazy-loaded Payment Components for better performance
const PaymentMethodCard = lazy(() => import('../components/payment/PaymentMethodCard').then(module => ({ default: module.PaymentMethodCard })));
const AddPaymentMethodForm = lazy(() => import('../components/payment/AddPaymentMethodForm').then(module => ({ default: module.AddPaymentMethodForm })));
const GuardianPaymentManager = lazy(() => import('../components/payment/GuardianPaymentManager').then(module => ({ default: module.GuardianPaymentManager })));
const TransactionHistory = lazy(() => import('../components/payment/TransactionHistory').then(module => ({ default: module.TransactionHistory })));
const ReceiptViewer = lazy(() => import('../components/payment/ReceiptViewer').then(module => ({ default: module.ReceiptViewer })));
const SubscriptionPlans = lazy(() => import('../components/payment/SubscriptionPlans').then(module => ({ default: module.SubscriptionPlans })));
const SubscriptionManagement = lazy(() => import('../components/payment/SubscriptionManagement').then(module => ({ default: module.SubscriptionManagement })));
const PaymentNotifications = lazy(() => import('../components/payment/PaymentNotifications').then(module => ({ default: module.PaymentNotifications })));
const RefundRequests = lazy(() => import('../components/payment/RefundRequests').then(module => ({ default: module.RefundRequests })));

// Get loading message based on active tab
const getLoadingMessage = (tabId: string): string => {
  const messages: Record<string, string> = {
    'overview': 'Loading payment overview...',
    'methods': 'Loading payment methods...',
    'guardian': 'Loading guardian payments...',
    'transactions': 'Loading transaction history...',
    'subscription': 'Loading subscription details...',
    'plans': 'Loading subscription plans...',
    'notifications': 'Loading notifications...',
    'refunds': 'Loading refund requests...'
  };
  return messages[tabId] || 'Loading...';
};

type PaymentTab = 'overview' | 'methods' | 'guardian' | 'transactions' | 'subscription' | 'plans' | 'notifications' | 'refunds';

export const Payment: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<PaymentTab>('overview');
  const [receiptViewerId, setReceiptViewerId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  // Initialize security measures
  useEffect(() => {
    initializeSecurity();
    SecurityAudit.log('payment_page_accessed', {
      activeTab,
      userRole: user?.role,
      timestamp: new Date().toISOString()
    });

    return () => {
      SecurityAudit.log('payment_page_exited', {
        timeSpent: Date.now() - performance.now(),
        activeTab
      });
    };
  }, [activeTab, user?.role]);

  const tabs = [
    {
      id: 'overview' as PaymentTab,
      name: 'Overview',
      icon: DollarSign,
      available: true
    },
    {
      id: 'methods' as PaymentTab,
      name: 'Payment Methods',
      icon: CreditCard,
      available: true
    },
    {
      id: 'guardian' as PaymentTab,
      name: 'Guardian Payments',
      icon: Users,
      available: user?.role === UserRole.PARENT
    },
    {
      id: 'transactions' as PaymentTab,
      name: 'Transactions',
      icon: Receipt,
      available: true
    },
    {
      id: 'subscription' as PaymentTab,
      name: 'Subscription',
      icon: Crown,
      available: true
    },
    {
      id: 'plans' as PaymentTab,
      name: 'Plans',
      icon: Crown,
      available: true
    },
    {
      id: 'notifications' as PaymentTab,
      name: 'Notifications',
      icon: Bell,
      available: true
    },
    {
      id: 'refunds' as PaymentTab,
      name: 'Refunds',
      icon: RefreshCw,
      available: true
    }
  ].filter(tab => tab.available);

  const handleViewReceipt = (receiptId: string) => {
    setReceiptViewerId(receiptId);
  };

  // Touch gesture handlers for tab navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX || !touchStartY) return;

    const touch = e.changedTouches[0];
    const touchEndX = touch.clientX;
    const touchEndY = touch.clientY;

    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;

    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

      if (deltaX > 0 && currentIndex < tabs.length - 1) {
        // Swipe left - next tab
        setActiveTab(tabs[currentIndex + 1].id);
      } else if (deltaX < 0 && currentIndex > 0) {
        // Swipe right - previous tab
        setActiveTab(tabs[currentIndex - 1].id);
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleTouchCancel = () => {
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PaymentOverview onViewReceipt={handleViewReceipt} />;
      case 'methods':
        return <PaymentMethodsManager />;
      case 'guardian':
        return <GuardianPaymentManager />;
      case 'transactions':
        return <TransactionHistory />;
      case 'subscription':
        return <SubscriptionManagement />;
      case 'plans':
        return <SubscriptionPlans />;
      case 'notifications':
        return <PaymentNotifications />;
      case 'refunds':
        return <RefundRequests />;
      default:
        return <PaymentOverview onViewReceipt={handleViewReceipt} />;
    }
  };

  return (
    <DashboardLayout>
      <ErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Payment Center</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
              Manage your payments, subscriptions, and billing information
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6 sm:mb-8">
            <nav
              className="-mb-px flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide"
              role="tablist"
              aria-label="Payment Center Navigation"
            >
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const nextIndex = e.key === 'ArrowRight'
                          ? (index + 1) % tabs.length
                          : (index - 1 + tabs.length) % tabs.length;
                        setActiveTab(tabs[nextIndex].id);
                        // Focus the next tab
                        setTimeout(() => {
                          const nextTab = document.querySelector(`button[data-tab="${tabs[nextIndex].id}"]`) as HTMLButtonElement;
                          nextTab?.focus();
                        }, 0);
                      }
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-center sm:space-x-2 py-3 sm:py-4 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap min-w-0 flex-shrink-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white active:scale-95 touch-manipulation ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50 sm:bg-transparent'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:hover:bg-transparent active:bg-gray-100'
                    }`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`tabpanel-${tab.id}`}
                    aria-label={`${tab.name} tab`}
                    data-tab={tab.id}
                    role="tab"
                    tabIndex={activeTab === tab.id ? 0 : -1}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-0 flex-shrink-0" aria-hidden="true" />
                    <span className="text-xs sm:text-sm truncate max-w-20 sm:max-w-none">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div
            className="bg-white rounded-lg shadow-sm overflow-hidden touch-pan-y"
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            tabIndex={0}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchCancel}
          >
            <div className="p-4 sm:p-6 lg:p-8">
              <Suspense fallback={
                <EnhancedComponentLoader
                  message={getLoadingMessage(activeTab)}
                  size="md"
                />
              }>
                {renderTabContent()}
              </Suspense>
            </div>
          </div>

          {/* Receipt Viewer Modal */}
          {receiptViewerId && (
            <ReceiptViewer
              receiptId={receiptViewerId}
              isOpen={!!receiptViewerId}
              onClose={() => setReceiptViewerId(null)}
            />
          )}
          </div>
        </div>
      </ErrorBoundary>
    </DashboardLayout>
  );
};

// Payment Overview Component
const PaymentOverview: React.FC<{ onViewReceipt: (id: string) => void }> = ({ onViewReceipt }) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Payment Overview</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Quick overview of your payment activity and account status
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-blue-600 text-xs sm:text-sm font-medium">Active Subscription</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900 truncate">Premium</p>
            </div>
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-3" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 transition-transform hover:scale-105">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-green-600 text-xs sm:text-sm font-medium">This Month Spent</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900 truncate">$124.99</p>
            </div>
            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-3" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 transition-transform hover:scale-105 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-purple-600 text-xs sm:text-sm font-medium">Payment Methods</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900 truncate">2</p>
            </div>
            <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-3" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payment Methods</h3>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
            Manage your credit cards and payment options for secure transactions.
          </p>
          <button
            onClick={() => setActiveTab('methods')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('methods');
              }
            }}
            className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 active:scale-95 touch-manipulation select-none"
            aria-label="Navigate to payment methods management"
          >
            Manage Payment Methods
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:border-gray-300">
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
              <Receipt className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Transaction History</h3>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
            View your payment history, download receipts, and track spending.
          </p>
          <button
            onClick={() => setActiveTab('transactions')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveTab('transactions');
              }
            }}
            className="inline-flex items-center text-sm sm:text-base text-green-600 hover:text-green-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-md p-1 active:scale-95 touch-manipulation select-none"
            aria-label="Navigate to transaction history"
          >
            View Transactions
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Methods Manager Component
const PaymentMethodsManager: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">Payment Methods</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Add and manage your payment methods for secure transactions
        </p>
      </div>

      {/* Payment methods management would go here */}
      <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
        <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Payment Methods</h3>
        <p className="text-sm sm:text-base text-gray-600 px-4">
          Payment method management interface would be implemented here
        </p>
      </div>
    </div>
  );
};