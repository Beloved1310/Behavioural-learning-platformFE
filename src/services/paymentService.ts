import { apiService } from './api';
import {
  PaymentMethod,
  GuardianPaymentMethod,
  Transaction,
  Receipt,
  SubscriptionPlan,
  UserSubscription,
  RefundRequest,
  PaymentNotification,
  ApiResponse,
  SubscriptionTier
} from '../types';

// Dummy data for development
const createMockPaymentMethods = (): PaymentMethod[] => [
  {
    id: '1',
    type: 'credit_card',
    cardLast4: '4242',
    cardBrand: 'visa',
    holderName: 'John Doe',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true,
    createdAt: '2024-01-15T10:30:00Z',
    isActive: true
  },
  {
    id: '2',
    type: 'debit_card',
    cardLast4: '5555',
    cardBrand: 'mastercard',
    holderName: 'John Doe',
    expiryMonth: 8,
    expiryYear: 2026,
    isDefault: false,
    createdAt: '2024-02-10T14:20:00Z',
    isActive: true
  }
];

const createMockGuardianPaymentMethods = (): GuardianPaymentMethod[] => [
  {
    id: 'gpm1',
    type: 'credit_card',
    cardLast4: '1234',
    cardBrand: 'visa',
    holderName: 'Jane Parent',
    expiryMonth: 10,
    expiryYear: 2025,
    isDefault: true,
    createdAt: '2024-01-20T09:15:00Z',
    isActive: true,
    guardianId: 'parent1',
    studentIds: ['student1', 'student2'],
    spendingLimit: 200,
    monthlySpendingLimit: 500,
    currentMonthSpending: 150
  }
];

const createMockTransactions = (): Transaction[] => [
  {
    id: 'txn1',
    userId: 'user1',
    amount: 29.99,
    currency: 'USD',
    type: 'session_payment',
    status: 'completed',
    paymentMethodId: '1',
    description: 'Math Tutoring Session',
    createdAt: '2024-01-25T16:00:00Z',
    processedAt: '2024-01-25T16:01:00Z',
    receiptUrl: 'https://example.com/receipt/txn1',
    metadata: {
      sessionTitle: 'Algebra Basics',
      tutorName: 'Dr. Smith',
      duration: 60,
      subject: 'Mathematics'
    }
  },
  {
    id: 'txn2',
    userId: 'user1',
    amount: 19.99,
    currency: 'USD',
    type: 'subscription',
    status: 'completed',
    paymentMethodId: '1',
    description: 'Premium Subscription - Monthly',
    createdAt: '2024-01-01T08:00:00Z',
    processedAt: '2024-01-01T08:01:00Z',
    receiptUrl: 'https://example.com/receipt/txn2'
  },
  {
    id: 'txn3',
    userId: 'user1',
    amount: 45.00,
    currency: 'USD',
    type: 'session_payment',
    status: 'pending',
    paymentMethodId: '2',
    description: 'Science Lab Session',
    createdAt: '2024-01-28T14:30:00Z',
    metadata: {
      sessionTitle: 'Chemistry Lab Work',
      tutorName: 'Prof. Johnson',
      duration: 90,
      subject: 'Chemistry'
    }
  }
];

const createMockSubscriptionPlans = (): SubscriptionPlan[] => [
  {
    id: 'basic-monthly',
    tier: SubscriptionTier.BASIC,
    name: 'Basic Plan',
    description: 'Essential features for individual learning',
    price: 19.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      '1-on-1 tutoring sessions',
      'Basic progress tracking',
      'Email support',
      'Mobile app access'
    ],
    sessionCredits: 4,
    tutorAccessLevel: 'basic',
    supportLevel: 'email',
    isActive: true,
    trialDays: 7
  },
  {
    id: 'premium-monthly',
    tier: SubscriptionTier.PREMIUM,
    name: 'Premium Plan',
    description: 'Advanced features for accelerated learning',
    price: 39.99,
    currency: 'USD',
    billingPeriod: 'monthly',
    features: [
      'Unlimited tutoring sessions',
      'Advanced AI analytics',
      'Priority tutor access',
      'Custom learning paths',
      '24/7 priority support',
      'Parent dashboard'
    ],
    sessionCredits: -1,
    tutorAccessLevel: 'premium',
    supportLevel: 'priority',
    isActive: true,
    trialDays: 14
  },
  {
    id: 'basic-yearly',
    tier: SubscriptionTier.BASIC,
    name: 'Basic Plan',
    description: 'Essential features for individual learning (Annual)',
    price: 199.99,
    currency: 'USD',
    billingPeriod: 'yearly',
    features: [
      '1-on-1 tutoring sessions',
      'Basic progress tracking',
      'Email support',
      'Mobile app access'
    ],
    sessionCredits: 48,
    tutorAccessLevel: 'basic',
    supportLevel: 'email',
    isActive: true,
    trialDays: 7
  },
  {
    id: 'premium-yearly',
    tier: SubscriptionTier.PREMIUM,
    name: 'Premium Plan',
    description: 'Advanced features for accelerated learning (Annual)',
    price: 399.99,
    currency: 'USD',
    billingPeriod: 'yearly',
    features: [
      'Unlimited tutoring sessions',
      'Advanced AI analytics',
      'Priority tutor access',
      'Custom learning paths',
      '24/7 priority support',
      'Parent dashboard'
    ],
    sessionCredits: -1,
    tutorAccessLevel: 'premium',
    supportLevel: 'priority',
    isActive: true,
    trialDays: 14
  }
];

const createMockUserSubscription = (): UserSubscription => ({
  id: 'sub1',
  userId: 'user1',
  planId: 'premium-monthly',
  plan: createMockSubscriptionPlans().find(p => p.id === 'premium-monthly')!,
  status: 'active',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  renewalDate: '2024-02-01T00:00:00Z',
  autoRenew: true,
  sessionCreditsRemaining: -1,
  lastPaymentDate: '2024-01-01T08:01:00Z',
  nextPaymentDate: '2024-02-01T08:00:00Z'
});

const createMockReceipts = (): Receipt[] => [
  {
    id: 'receipt1',
    transactionId: 'txn1',
    receiptNumber: 'BLP-2024-001',
    issueDate: '2024-01-25T16:01:00Z',
    amount: 29.99,
    currency: 'USD',
    description: 'Math Tutoring Session',
    itemizedCharges: [
      {
        id: 'item1',
        description: 'Algebra Basics - 1 Hour Session',
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99,
        type: 'session'
      }
    ],
    subtotal: 29.99,
    tax: 0,
    totalAmount: 29.99,
    paymentMethod: 'VISA •••• 4242',
    downloadUrl: 'https://example.com/receipts/receipt1.pdf',
    emailSent: true
  }
];

const createMockPaymentNotifications = (): PaymentNotification[] => [
  {
    id: 'notif1',
    recipientId: 'user1',
    recipientType: 'student',
    type: 'payment_success',
    title: 'Payment Successful',
    message: 'Your payment of $29.99 for Math Tutoring Session has been processed successfully.',
    relatedTransactionId: 'txn1',
    amount: 29.99,
    currency: 'USD',
    isRead: false,
    sentAt: '2024-01-25T16:01:30Z'
  },
  {
    id: 'notif2',
    recipientId: 'parent1',
    recipientType: 'parent',
    type: 'spending_limit_reached',
    title: 'Spending Limit Alert',
    message: 'Your monthly spending limit is 75% reached. Current spending: $375 of $500 limit.',
    isRead: true,
    sentAt: '2024-01-20T12:00:00Z',
    readAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 'notif3',
    recipientId: 'user1',
    recipientType: 'student',
    type: 'subscription_renewed',
    title: 'Subscription Renewed',
    message: 'Your Premium subscription has been renewed for another month.',
    amount: 39.99,
    currency: 'USD',
    isRead: false,
    sentAt: '2024-02-01T08:01:00Z'
  }
];

const createMockRefundRequests = (): RefundRequest[] => [
  {
    id: 'refund1',
    transactionId: 'txn1',
    sessionId: 'session1',
    userId: 'user1',
    amount: 29.99,
    reason: 'session_cancelled',
    description: 'Tutor had to cancel due to emergency',
    status: 'approved',
    requestedAt: '2024-01-26T10:00:00Z',
    processedAt: '2024-01-26T11:30:00Z',
    processedBy: 'Admin',
    refundMethod: 'original_payment'
  },
  {
    id: 'refund2',
    transactionId: 'txn3',
    sessionId: 'session2',
    userId: 'user1',
    amount: 45.00,
    reason: 'technical_issues',
    description: 'Video call failed multiple times during session',
    status: 'pending',
    requestedAt: '2024-01-28T15:00:00Z',
    refundMethod: 'original_payment'
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to create mock API response
const createMockResponse = <T>(data: T, success = true): ApiResponse<T> => ({
  success,
  data,
  message: success ? 'Operation successful' : 'Operation failed'
});

export const paymentService = {
  // Payment Methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    await delay(500);
    return createMockResponse(createMockPaymentMethods());
  },

  async addPaymentMethod(data: {
    type: string;
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvc?: string;
    holderName: string;
    billingAddress?: any;
  }): Promise<ApiResponse<PaymentMethod>> {
    await delay(800);
    const newMethod: PaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type as any,
      cardLast4: data.cardNumber?.slice(-4) || '0000',
      cardBrand: 'visa', // Mock brand detection
      holderName: data.holderName,
      expiryMonth: data.expiryMonth || 12,
      expiryYear: data.expiryYear || 2025,
      isDefault: false,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    return createMockResponse(newMethod);
  },

  async updatePaymentMethod(methodId: string, data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> {
    await delay(600);
    const methods = createMockPaymentMethods();
    const method = methods.find(m => m.id === methodId);
    if (!method) throw new Error('Payment method not found');
    const updatedMethod = { ...method, ...data };
    return createMockResponse(updatedMethod);
  },

  async deletePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    await delay(400);
    return createMockResponse(undefined);
  },

  async setDefaultPaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    await delay(300);
    return createMockResponse(undefined);
  },

  // Guardian Payment Methods
  async getGuardianPaymentMethods(): Promise<ApiResponse<GuardianPaymentMethod[]>> {
    await delay(600);
    return createMockResponse(createMockGuardianPaymentMethods());
  },

  async addGuardianPaymentMethod(data: {
    type: string;
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvc?: string;
    holderName: string;
    studentIds: string[];
    spendingLimit?: number;
    monthlySpendingLimit?: number;
    billingAddress?: any;
  }): Promise<ApiResponse<GuardianPaymentMethod>> {
    await delay(1000);
    const newMethod: GuardianPaymentMethod = {
      id: Math.random().toString(36).substr(2, 9),
      type: data.type as any,
      cardLast4: data.cardNumber?.slice(-4) || '0000',
      cardBrand: 'visa',
      holderName: data.holderName,
      expiryMonth: data.expiryMonth || 12,
      expiryYear: data.expiryYear || 2025,
      isDefault: false,
      createdAt: new Date().toISOString(),
      isActive: true,
      guardianId: 'current-guardian',
      studentIds: data.studentIds,
      spendingLimit: data.spendingLimit,
      monthlySpendingLimit: data.monthlySpendingLimit,
      currentMonthSpending: 0
    };
    return createMockResponse(newMethod);
  },

  async linkStudentToGuardianPayment(methodId: string, studentId: string): Promise<ApiResponse<void>> {
    await delay(400);
    return createMockResponse(undefined);
  },

  async unlinkStudentFromGuardianPayment(methodId: string, studentId: string): Promise<ApiResponse<void>> {
    await delay(400);
    return createMockResponse(undefined);
  },

  async updateSpendingLimits(methodId: string, data: {
    spendingLimit?: number;
    monthlySpendingLimit?: number;
  }): Promise<ApiResponse<GuardianPaymentMethod>> {
    await delay(500);
    const methods = createMockGuardianPaymentMethods();
    const method = methods.find(m => m.id === methodId);
    if (!method) throw new Error('Guardian payment method not found');
    const updatedMethod = { ...method, ...data };
    return createMockResponse(updatedMethod);
  },

  // Transactions
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{ transactions: Transaction[]; total: number; page: number; totalPages: number }>> {
    await delay(700);
    const transactions = createMockTransactions();
    return createMockResponse({
      transactions,
      total: transactions.length,
      page: params?.page || 1,
      totalPages: 1
    });
  },

  async getTransaction(transactionId: string): Promise<ApiResponse<Transaction>> {
    await delay(400);
    const transactions = createMockTransactions();
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    return createMockResponse(transaction);
  },

  async processSessionPayment(data: {
    sessionId: string;
    paymentMethodId: string;
    amount: number;
    currency: string;
  }): Promise<ApiResponse<Transaction>> {
    await delay(1200);
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      sessionId: data.sessionId,
      amount: data.amount,
      currency: data.currency,
      type: 'session_payment',
      status: 'completed',
      paymentMethodId: data.paymentMethodId,
      description: 'Tutoring Session Payment',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
    return createMockResponse(newTransaction);
  },

  async processSubscriptionPayment(data: {
    planId: string;
    paymentMethodId: string;
  }): Promise<ApiResponse<{ transaction: Transaction; subscription: UserSubscription }>> {
    await delay(1500);
    const plans = createMockSubscriptionPlans();
    const plan = plans.find(p => p.id === data.planId);
    if (!plan) throw new Error('Plan not found');

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      amount: plan.price,
      currency: plan.currency,
      type: 'subscription',
      status: 'completed',
      paymentMethodId: data.paymentMethodId,
      description: `${plan.name} - ${plan.billingPeriod}`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };

    const subscription: UserSubscription = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      planId: plan.id,
      plan,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (plan.billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      sessionCreditsRemaining: plan.sessionCredits
    };

    return createMockResponse({ transaction, subscription });
  },

  // Receipts
  async getReceipts(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<{ receipts: Receipt[]; total: number; page: number; totalPages: number }>> {
    await delay(600);
    const receipts = createMockReceipts();
    return createMockResponse({
      receipts,
      total: receipts.length,
      page: params?.page || 1,
      totalPages: 1
    });
  },

  async getReceipt(receiptId: string): Promise<ApiResponse<Receipt>> {
    await delay(400);
    const receipts = createMockReceipts();
    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) throw new Error('Receipt not found');
    return createMockResponse(receipt);
  },

  async downloadReceipt(receiptId: string): Promise<Blob> {
    await delay(800);
    // Create a mock PDF blob
    const pdfContent = `Mock PDF Receipt for ${receiptId}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  },

  async emailReceipt(receiptId: string, email?: string): Promise<ApiResponse<void>> {
    await delay(600);
    return createMockResponse(undefined);
  },

  // Subscriptions
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    await delay(500);
    return createMockResponse(createMockSubscriptionPlans());
  },

  async getUserSubscription(): Promise<ApiResponse<UserSubscription | null>> {
    await delay(600);
    return createMockResponse(createMockUserSubscription());
  },

  async subscribeToplan(data: {
    planId: string;
    paymentMethodId: string;
  }): Promise<ApiResponse<{ subscription: UserSubscription; transaction: Transaction }>> {
    await delay(1500);
    const plans = createMockSubscriptionPlans();
    const plan = plans.find(p => p.id === data.planId);
    if (!plan) throw new Error('Plan not found');

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      amount: plan.price,
      currency: plan.currency,
      type: 'subscription',
      status: 'completed',
      paymentMethodId: data.paymentMethodId,
      description: `${plan.name} Subscription`,
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };

    const subscription: UserSubscription = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      planId: plan.id,
      plan,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + (plan.billingPeriod === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
      autoRenew: true,
      sessionCreditsRemaining: plan.sessionCredits
    };

    return createMockResponse({ subscription, transaction });
  },

  async updateSubscription(data: {
    planId?: string;
    autoRenew?: boolean;
  }): Promise<ApiResponse<UserSubscription>> {
    await delay(800);
    const subscription = createMockUserSubscription();
    const updatedSubscription = { ...subscription, ...data };
    return createMockResponse(updatedSubscription);
  },

  async cancelSubscription(reason?: string): Promise<ApiResponse<UserSubscription>> {
    await delay(900);
    const subscription = createMockUserSubscription();
    const cancelledSubscription = {
      ...subscription,
      status: 'cancelled' as const,
      cancelledAt: new Date().toISOString(),
      autoRenew: false
    };
    return createMockResponse(cancelledSubscription);
  },

  async reactivateSubscription(): Promise<ApiResponse<UserSubscription>> {
    await delay(800);
    const subscription = createMockUserSubscription();
    const reactivatedSubscription = {
      ...subscription,
      status: 'active' as const,
      cancelledAt: undefined,
      autoRenew: true
    };
    return createMockResponse(reactivatedSubscription);
  },

  // Refunds
  async getRefundRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{ refunds: RefundRequest[]; total: number; page: number; totalPages: number }>> {
    await delay(600);
    const refunds = createMockRefundRequests();
    return createMockResponse({
      refunds,
      total: refunds.length,
      page: params?.page || 1,
      totalPages: 1
    });
  },

  async requestRefund(data: {
    transactionId: string;
    sessionId?: string;
    amount: number;
    reason: string;
    description: string;
    refundMethod: 'original_payment' | 'store_credit';
  }): Promise<ApiResponse<RefundRequest>> {
    await delay(800);
    const newRefund: RefundRequest = {
      id: Math.random().toString(36).substr(2, 9),
      transactionId: data.transactionId,
      sessionId: data.sessionId,
      userId: 'current-user',
      amount: data.amount,
      reason: data.reason as any,
      description: data.description,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      refundMethod: data.refundMethod
    };
    return createMockResponse(newRefund);
  },

  async cancelRefundRequest(refundId: string): Promise<ApiResponse<void>> {
    await delay(400);
    return createMockResponse(undefined);
  },

  // Payment Notifications
  async getPaymentNotifications(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<ApiResponse<{ notifications: PaymentNotification[]; total: number; unreadCount: number }>> {
    await delay(500);
    const notifications = createMockPaymentNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;
    return createMockResponse({
      notifications,
      total: notifications.length,
      unreadCount
    });
  },

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    await delay(300);
    return createMockResponse(undefined);
  },

  async markAllNotificationsAsRead(): Promise<ApiResponse<void>> {
    await delay(500);
    return createMockResponse(undefined);
  },

  // Payment Processing Utilities
  async validatePaymentMethod(data: {
    type: string;
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvc?: string;
  }): Promise<ApiResponse<{ isValid: boolean; errors?: string[] }>> {
    await delay(400);
    // Mock validation - always return valid for demo
    return createMockResponse({ isValid: true });
  },

  async getPaymentIntent(data: {
    amount: number;
    currency: string;
    paymentMethodId: string;
  }): Promise<ApiResponse<{ clientSecret: string; intentId: string }>> {
    await delay(600);
    return createMockResponse({
      clientSecret: 'mock_client_secret_' + Math.random().toString(36).substr(2, 9),
      intentId: 'mock_intent_' + Math.random().toString(36).substr(2, 9)
    });
  },

  async confirmPaymentIntent(intentId: string): Promise<ApiResponse<Transaction>> {
    await delay(800);
    const mockTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'current-user',
      amount: 29.99,
      currency: 'USD',
      type: 'session_payment',
      status: 'completed',
      paymentMethodId: '1',
      description: 'Session Payment',
      createdAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };
    return createMockResponse(mockTransaction);
  },
};