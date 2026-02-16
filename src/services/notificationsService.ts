import { apiService } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination?: any;
}

class NotificationsService {
  private readonly BASE_PATH = '/v1/api/notifications';

  async getNotifications(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    type?: string;
  }): Promise<NotificationsResponse> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.unreadOnly) params.append('unreadOnly', 'true');
    if (options?.type) params.append('type', options.type);

    const queryString = params.toString();
    const url = queryString ? `${this.BASE_PATH}?${queryString}` : this.BASE_PATH;

    const response = await apiService.get<NotificationsResponse>(url);
    return response;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ unreadCount: number }>(
      `${this.BASE_PATH}/unread-count`
    );
    return response.unreadCount || 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiService.patch<{ message: string }>(`${this.BASE_PATH}/${notificationId}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    await apiService.patch<{ message: string; updatedCount: number }>(
      `${this.BASE_PATH}/read-all`,
      {}
    );
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete<{ message: string }>(`${this.BASE_PATH}/${notificationId}`);
  }
}

export const notificationsService = new NotificationsService();
