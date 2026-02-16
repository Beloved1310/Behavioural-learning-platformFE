import { apiService } from './api';


export interface Notification {
  id: string;
  userId: string;
  type:
    | 'study_reminder'
    | 'session_reminder'
    | 'quiz_available'
    | 'badge_earned'
    | 'message_received'
    | 'payment_success'
    | 'progress_report'
    | 'system_announcement';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  // Legacy fields for backward compatibility
  total?: number;
  page?: number;
  limit?: number;
}

class ApiNotificationService {
  private readonly BASE_PATH = '/v1/api/notifications';

  /**
   * Get user notifications
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly !== undefined)
      queryParams.append('unreadOnly', params.unreadOnly.toString());
    if (params?.type) queryParams.append('type', params.type);

    const queryString = queryParams.toString();
    const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<any>(url);

    // Handle paginated response format
    if (response.success && response.notifications && response.pagination) {
      return {
        notifications: response.notifications,
        unreadCount: response.unreadCount || 0,
        pagination: response.pagination,
      };
    }

    // Handle wrapped response
    if (response.success && response.data) {
      const data = response.data;
      if (data.notifications && data.pagination) {
        return {
          notifications: data.notifications,
          unreadCount: data.unreadCount || 0,
          pagination: data.pagination,
        };
      }
      return data;
    }

    // Handle direct response (backward compatibility)
    if ((response as any).notifications) {
      return response as NotificationResponse;
    }

    throw new Error('Failed to fetch notifications');
  }

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ unreadCount: number }>(
      `${this.BASE_PATH}/unread-count`
    );

    if (response.success && response.data) {
      return response.data.unreadCount;
    }

    if ((response as any).unreadCount !== undefined) {
      return (response as any).unreadCount;
    }

    return 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiService.patch<{ notification: Notification }>(
      `${this.BASE_PATH}/${notificationId}/read`
    );

    if (response.success && response.data) {
      // Check if notification is nested
      if ((response.data as any).notification) {
        return (response.data as any).notification;
      }
      return response.data as Notification;
    }

    // Handle direct response
    if ((response as any).notification) {
      return (response as any).notification;
    }

    throw new Error('Failed to mark notification as read');
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const response = await apiService.patch<{ updatedCount: number }>(`${this.BASE_PATH}/read-all`);

    if (response.success && response.data) {
      return response.data;
    }

    if ((response as any).updatedCount !== undefined) {
      return { updatedCount: (response as any).updatedCount };
    }

    throw new Error('Failed to mark all notifications as read');
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${notificationId}`);
  }
}

export const apiNotificationService = new ApiNotificationService();
