import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiNotificationService, Notification } from '../services/apiNotificationService';
import { logger } from '../utils/logger';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;

  // Actions
  fetchNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      pagination: null,

      // Fetch notifications
      fetchNotifications: async (params) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiNotificationService.getNotifications(params);
          set({
            notifications: response.notifications,
            unreadCount: response.unreadCount,
            pagination: response.pagination || null,
            isLoading: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch notifications',
          });
        }
      },

      // Fetch unread count
      fetchUnreadCount: async () => {
        try {
          const count = await apiNotificationService.getUnreadCount();
          set({ unreadCount: count });
        } catch (error) {
          logger.error('Failed to fetch unread count', error);
        }
      },

      // Mark notification as read
      markAsRead: async (notificationId: string) => {
        try {
          await apiNotificationService.markAsRead(notificationId);
          set((state) => ({
            notifications: state.notifications.map((notif) =>
              notif.id === notificationId ? { ...notif, isRead: true } : notif
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to mark notification as read',
          });
        }
      },

      // Mark all as read
      markAllAsRead: async () => {
        try {
          await apiNotificationService.markAllAsRead();
          set((state) => ({
            notifications: state.notifications.map((notif) => ({
              ...notif,
              isRead: true,
            })),
            unreadCount: 0,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : 'Failed to mark all notifications as read',
          });
        }
      },

      // Delete notification
      deleteNotification: async (notificationId: string) => {
        try {
          await apiNotificationService.deleteNotification(notificationId);
          const notification = get().notifications.find((n) => n.id === notificationId);
          set((state) => ({
            notifications: state.notifications.filter((notif) => notif.id !== notificationId),
            unreadCount:
              notification && !notification.isRead
                ? Math.max(0, state.unreadCount - 1)
                : state.unreadCount,
          }));
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to delete notification',
          });
        }
      },

      // Add notification (for real-time updates via socket)
      addNotification: (notification: Notification) => {
        set((state) => ({
          notifications: [notification, ...state.notifications],
          unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
        }));
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'NotificationStore' }
  )
);
