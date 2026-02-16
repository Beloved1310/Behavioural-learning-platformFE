import { apiService } from './api';
import { logger } from '../utils/logger';

export interface PendingSessionRequest {
  id: string;
  studentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  title: string;
  subject: string;
  description?: string;
  scheduledAt: string;
  endTime: string;
  duration: number;
  price: number;
  requestedAt: string;
}

export interface CreateSessionRequest {
  studentId: string;
  title: string;
  subject: string;
  scheduledAt: string; // ISO datetime string
  duration: number; // minutes
  description?: string;
}

export interface RescheduleSessionRequest {
  scheduledAt?: string; // ISO datetime string
  duration?: number; // minutes
}

class TutorSessionService {
  private readonly BASE_PATH = '/v1/api/tutor';

  /**
   * Get all pending session requests with pagination
   */
  async getPendingRequests(
    page?: number,
    limit?: number
  ): Promise<{ requests: PendingSessionRequest[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());

      const url = `${this.BASE_PATH}/requests${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiService.get<any>(url);

      // Handle paginated response
      if (response && typeof response === 'object') {
        if (response.success && response.requests && response.pagination) {
          return {
            requests: response.requests,
            pagination: response.pagination,
          };
        }
        // Fallback for non-paginated responses
        if ('requests' in response && Array.isArray((response as any).requests)) {
          return { requests: (response as any).requests };
        }
        if ('data' in response && (response as any).data && 'requests' in (response as any).data) {
          return { requests: (response as any).data.requests };
        }
        if (Array.isArray(response)) {
          return { requests: response };
        }
      }

      logger.warn('Unexpected response structure', { response });
      return { requests: [] };
    } catch (error) {
      logger.error('Failed to get pending requests', error);
      return { requests: [] };
    }
  }

  /**
   * Approve a pending session request
   */
  async approveRequest(requestId: string): Promise<void> {
    logger.debug('Approve request called', { requestId });
    try {
      const response = await apiService.post<{ success: boolean; message?: string; session?: any }>(
        `${this.BASE_PATH}/requests/${requestId}/approve`,
        {}
      );

      // Handle both wrapped and direct response formats
      if (response.success || (response as any).session) {
        logger.debug('Approve request successful', { requestId });
        return; // Success
      }

      // If we get here, the response might not be in expected format but no error was thrown
      logger.warn('Approve request response format unexpected', { response, requestId });
    } catch (error: unknown) {
      logger.error('Failed to approve request', error, { requestId });

      // Re-throw with a more user-friendly message if it's a permission error
      if (error.response?.status === 403) {
        const errorMessage =
          error.response?.data?.error || error.response?.data?.message || error.message;
        if (errorMessage?.toLowerCase().includes('only tutors')) {
          throw new Error(
            'Only tutors can approve session requests. Please ensure you are logged in as a tutor.'
          );
        }
        if (errorMessage?.toLowerCase().includes('your own')) {
          throw new Error('You can only approve session requests that belong to you.');
        }
      }

      throw error;
    }
  }

  /**
   * Reject a pending session request
   */
  async rejectRequest(requestId: string, reason?: string): Promise<void> {
    try {
      await apiService.post(`${this.BASE_PATH}/requests/${requestId}/reject`, { reason });
    } catch (error) {
      logger.error('Failed to reject request', error);
      throw error;
    }
  }

  /**
   * Create a session for a student (tutor-initiated)
   */
  async createSession(data: CreateSessionRequest): Promise<any> {
    try {
      const response = await apiService.post<{ success: boolean; session: any }>(
        `${this.BASE_PATH}/sessions/create`,
        data
      );

      // Handle different response structures
      if (response && typeof response === 'object') {
        if ('session' in response) {
          return (response as any).session;
        }
        if ('data' in response && (response as any).data) {
          if ('session' in (response as any).data) {
            return (response as any).data.session;
          }
          return (response as any).data;
        }
      }

      return response;
    } catch (error) {
      logger.error('Failed to create session', error);
      throw error;
    }
  }

  /**
   * Reschedule a session
   */
  async rescheduleSession(sessionId: string, data: RescheduleSessionRequest): Promise<any> {
    try {
      const response = await apiService.post<{ success: boolean; session: any }>(
        `${this.BASE_PATH}/sessions/${sessionId}/reschedule`,
        data
      );

      // Handle different response structures
      if (response && typeof response === 'object') {
        if ('session' in response) {
          return (response as any).session;
        }
        if ('data' in response && (response as any).data) {
          if ('session' in (response as any).data) {
            return (response as any).data.session;
          }
          return (response as any).data;
        }
      }

      return response;
    } catch (error) {
      logger.error('Failed to reschedule session', error);
      throw error;
    }
  }

  /**
   * Cancel a session
   */
  async cancelSession(sessionId: string, reason?: string): Promise<void> {
    try {
      await apiService.post(`${this.BASE_PATH}/sessions/${sessionId}/cancel`, { reason });
    } catch (error) {
      logger.error('Failed to cancel session', error);
      throw error;
    }
  }
}

export const tutorSessionService = new TutorSessionService();
