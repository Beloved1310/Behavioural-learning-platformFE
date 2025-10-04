import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  PaymentState,
  PaymentMethod,
  GuardianPaymentMethod,
  Transaction,
  Receipt,
  SubscriptionPlan,
  UserSubscription,
  RefundRequest,
  PaymentNotification
} from '../types';
import { paymentService } from '../services/paymentService';

interface PaymentStore extends PaymentState {
  // Payment Methods
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (data: any) => Promise<PaymentMethod | null>;
  updatePaymentMethod: (methodId: string, data: any) => Promise<PaymentMethod | null>;
  deletePaymentMethod: (methodId: string) => Promise<boolean>;
  setDefaultPaymentMethod: (methodId: string) => Promise<boolean>;

  // Guardian Payment Methods
  fetchGuardianPaymentMethods: () => Promise<void>;
  addGuardianPaymentMethod: (data: any) => Promise<GuardianPaymentMethod | null>;
  linkStudentToGuardianPayment: (methodId: string, studentId: string) => Promise<boolean>;
  unlinkStudentFromGuardianPayment: (methodId: string, studentId: string) => Promise<boolean>;
  updateSpendingLimits: (methodId: string, data: any) => Promise<GuardianPaymentMethod | null>;

  // Transactions
  fetchTransactions: (params?: any) => Promise<void>;
  fetchTransaction: (transactionId: string) => Promise<Transaction | null>;
  processSessionPayment: (data: any) => Promise<Transaction | null>;
  processSubscriptionPayment: (data: any) => Promise<{ transaction: Transaction; subscription: UserSubscription } | null>;

  // Receipts
  fetchReceipts: (params?: any) => Promise<void>;
  fetchReceipt: (receiptId: string) => Promise<Receipt | null>;
  downloadReceipt: (receiptId: string) => Promise<Blob | null>;
  emailReceipt: (receiptId: string, email?: string) => Promise<boolean>;

  // Subscriptions
  fetchSubscriptionPlans: () => Promise<void>;
  fetchUserSubscription: () => Promise<void>;
  subscribeToplan: (data: any) => Promise<{ subscription: UserSubscription; transaction: Transaction } | null>;
  updateSubscription: (data: any) => Promise<UserSubscription | null>;
  cancelSubscription: (reason?: string) => Promise<UserSubscription | null>;
  reactivateSubscription: () => Promise<UserSubscription | null>;

  // Refunds
  fetchRefundRequests: (params?: any) => Promise<void>;
  requestRefund: (data: any) => Promise<RefundRequest | null>;
  cancelRefundRequest: (refundId: string) => Promise<boolean>;

  // Notifications
  fetchPaymentNotifications: (params?: any) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<boolean>;
  markAllNotificationsAsRead: () => Promise<boolean>;

  // Utilities
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const usePaymentStore = create<PaymentStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      paymentMethods: [],
      guardianPaymentMethods: [],
      transactions: [],
      receipts: [],
      subscription: null,
      subscriptionPlans: [],
      refundRequests: [],
      paymentNotifications: [],
      isLoading: false,
      error: null,

      // Payment Methods
      fetchPaymentMethods: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getPaymentMethods();
          if (response.success && response.data) {
            set({ paymentMethods: response.data });
          } else {
            set({ error: response.error || 'Failed to fetch payment methods' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch payment methods' });
        } finally {
          set({ isLoading: false });
        }
      },

      addPaymentMethod: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.addPaymentMethod(data);
          if (response.success && response.data) {
            const newMethod = response.data;
            set((state) => ({
              paymentMethods: [...state.paymentMethods, newMethod]
            }));
            return newMethod;
          } else {
            set({ error: response.error || 'Failed to add payment method' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to add payment method' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updatePaymentMethod: async (methodId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.updatePaymentMethod(methodId, data);
          if (response.success && response.data) {
            const updatedMethod = response.data;
            set((state) => ({
              paymentMethods: state.paymentMethods.map((method) =>
                method.id === methodId ? updatedMethod : method
              )
            }));
            return updatedMethod;
          } else {
            set({ error: response.error || 'Failed to update payment method' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to update payment method' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      deletePaymentMethod: async (methodId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.deletePaymentMethod(methodId);
          if (response.success) {
            set((state) => ({
              paymentMethods: state.paymentMethods.filter((method) => method.id !== methodId)
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to delete payment method' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to delete payment method' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      setDefaultPaymentMethod: async (methodId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.setDefaultPaymentMethod(methodId);
          if (response.success) {
            set((state) => ({
              paymentMethods: state.paymentMethods.map((method) => ({
                ...method,
                isDefault: method.id === methodId
              }))
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to set default payment method' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to set default payment method' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Guardian Payment Methods
      fetchGuardianPaymentMethods: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getGuardianPaymentMethods();
          if (response.success && response.data) {
            set({ guardianPaymentMethods: response.data });
          } else {
            set({ error: response.error || 'Failed to fetch guardian payment methods' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch guardian payment methods' });
        } finally {
          set({ isLoading: false });
        }
      },

      addGuardianPaymentMethod: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.addGuardianPaymentMethod(data);
          if (response.success && response.data) {
            const newMethod = response.data;
            set((state) => ({
              guardianPaymentMethods: [...state.guardianPaymentMethods, newMethod]
            }));
            return newMethod;
          } else {
            set({ error: response.error || 'Failed to add guardian payment method' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to add guardian payment method' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      linkStudentToGuardianPayment: async (methodId, studentId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.linkStudentToGuardianPayment(methodId, studentId);
          if (response.success) {
            set((state) => ({
              guardianPaymentMethods: state.guardianPaymentMethods.map((method) =>
                method.id === methodId
                  ? { ...method, studentIds: [...method.studentIds, studentId] }
                  : method
              )
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to link student to payment method' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to link student to payment method' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      unlinkStudentFromGuardianPayment: async (methodId, studentId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.unlinkStudentFromGuardianPayment(methodId, studentId);
          if (response.success) {
            set((state) => ({
              guardianPaymentMethods: state.guardianPaymentMethods.map((method) =>
                method.id === methodId
                  ? { ...method, studentIds: method.studentIds.filter(id => id !== studentId) }
                  : method
              )
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to unlink student from payment method' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to unlink student from payment method' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      updateSpendingLimits: async (methodId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.updateSpendingLimits(methodId, data);
          if (response.success && response.data) {
            const updatedMethod = response.data;
            set((state) => ({
              guardianPaymentMethods: state.guardianPaymentMethods.map((method) =>
                method.id === methodId ? updatedMethod : method
              )
            }));
            return updatedMethod;
          } else {
            set({ error: response.error || 'Failed to update spending limits' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to update spending limits' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Transactions
      fetchTransactions: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getTransactions(params);
          if (response.success && response.data) {
            set({ transactions: response.data.transactions });
          } else {
            set({ error: response.error || 'Failed to fetch transactions' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch transactions' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchTransaction: async (transactionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getTransaction(transactionId);
          if (response.success && response.data) {
            return response.data;
          } else {
            set({ error: response.error || 'Failed to fetch transaction' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to fetch transaction' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      processSessionPayment: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.processSessionPayment(data);
          if (response.success && response.data) {
            const newTransaction = response.data;
            set((state) => ({
              transactions: [newTransaction, ...state.transactions]
            }));
            return newTransaction;
          } else {
            set({ error: response.error || 'Failed to process payment' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to process payment' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      processSubscriptionPayment: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.processSubscriptionPayment(data);
          if (response.success && response.data) {
            const { transaction, subscription } = response.data;
            set((state) => ({
              transactions: [transaction, ...state.transactions],
              subscription
            }));
            return response.data;
          } else {
            set({ error: response.error || 'Failed to process subscription payment' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to process subscription payment' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Receipts
      fetchReceipts: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getReceipts(params);
          if (response.success && response.data) {
            set({ receipts: response.data.receipts });
          } else {
            set({ error: response.error || 'Failed to fetch receipts' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch receipts' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchReceipt: async (receiptId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getReceipt(receiptId);
          if (response.success && response.data) {
            return response.data;
          } else {
            set({ error: response.error || 'Failed to fetch receipt' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to fetch receipt' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      downloadReceipt: async (receiptId) => {
        set({ isLoading: true, error: null });
        try {
          const blob = await paymentService.downloadReceipt(receiptId);
          return blob;
        } catch (error) {
          set({ error: 'Failed to download receipt' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      emailReceipt: async (receiptId, email) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.emailReceipt(receiptId, email);
          if (response.success) {
            return true;
          } else {
            set({ error: response.error || 'Failed to email receipt' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to email receipt' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Subscriptions
      fetchSubscriptionPlans: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getSubscriptionPlans();
          if (response.success && response.data) {
            set({ subscriptionPlans: response.data });
          } else {
            set({ error: response.error || 'Failed to fetch subscription plans' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch subscription plans' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getUserSubscription();
          if (response.success) {
            set({ subscription: response.data || null });
          } else {
            set({ error: response.error || 'Failed to fetch subscription' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch subscription' });
        } finally {
          set({ isLoading: false });
        }
      },

      subscribeToplan: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.subscribeToplan(data);
          if (response.success && response.data) {
            const { subscription, transaction } = response.data;
            set((state) => ({
              subscription,
              transactions: [transaction, ...state.transactions]
            }));
            return response.data;
          } else {
            set({ error: response.error || 'Failed to subscribe to plan' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to subscribe to plan' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      updateSubscription: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.updateSubscription(data);
          if (response.success && response.data) {
            set({ subscription: response.data });
            return response.data;
          } else {
            set({ error: response.error || 'Failed to update subscription' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to update subscription' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      cancelSubscription: async (reason) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.cancelSubscription(reason);
          if (response.success && response.data) {
            set({ subscription: response.data });
            return response.data;
          } else {
            set({ error: response.error || 'Failed to cancel subscription' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to cancel subscription' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      reactivateSubscription: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.reactivateSubscription();
          if (response.success && response.data) {
            set({ subscription: response.data });
            return response.data;
          } else {
            set({ error: response.error || 'Failed to reactivate subscription' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to reactivate subscription' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Refunds
      fetchRefundRequests: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getRefundRequests(params);
          if (response.success && response.data) {
            set({ refundRequests: response.data.refunds });
          } else {
            set({ error: response.error || 'Failed to fetch refund requests' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch refund requests' });
        } finally {
          set({ isLoading: false });
        }
      },

      requestRefund: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.requestRefund(data);
          if (response.success && response.data) {
            const newRefund = response.data;
            set((state) => ({
              refundRequests: [newRefund, ...state.refundRequests]
            }));
            return newRefund;
          } else {
            set({ error: response.error || 'Failed to request refund' });
            return null;
          }
        } catch (error) {
          set({ error: 'Failed to request refund' });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      cancelRefundRequest: async (refundId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.cancelRefundRequest(refundId);
          if (response.success) {
            set((state) => ({
              refundRequests: state.refundRequests.filter((refund) => refund.id !== refundId)
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to cancel refund request' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to cancel refund request' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Notifications
      fetchPaymentNotifications: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.getPaymentNotifications(params);
          if (response.success && response.data) {
            set({ paymentNotifications: response.data.notifications });
          } else {
            set({ error: response.error || 'Failed to fetch notifications' });
          }
        } catch (error) {
          set({ error: 'Failed to fetch notifications' });
        } finally {
          set({ isLoading: false });
        }
      },

      markNotificationAsRead: async (notificationId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.markNotificationAsRead(notificationId);
          if (response.success) {
            set((state) => ({
              paymentNotifications: state.paymentNotifications.map((notification) =>
                notification.id === notificationId
                  ? { ...notification, isRead: true, readAt: new Date().toISOString() }
                  : notification
              )
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to mark notification as read' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to mark notification as read' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      markAllNotificationsAsRead: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await paymentService.markAllNotificationsAsRead();
          if (response.success) {
            const now = new Date().toISOString();
            set((state) => ({
              paymentNotifications: state.paymentNotifications.map((notification) => ({
                ...notification,
                isRead: true,
                readAt: notification.readAt || now
              }))
            }));
            return true;
          } else {
            set({ error: response.error || 'Failed to mark all notifications as read' });
            return false;
          }
        } catch (error) {
          set({ error: 'Failed to mark all notifications as read' });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      // Utilities
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'payment-store',
    }
  )
);