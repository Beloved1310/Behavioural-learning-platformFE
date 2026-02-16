import { apiService } from './api';
import { User, UserPreferences, UserProfileResponse } from '../types';
import { logger } from '../utils/logger';

// Request/Response Types
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gradeLevel?: string;
  academicGoals?: string[];
  subjects?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  profileImage?: string;
  bio?: string;
  preferences?: Partial<UserPreferences>;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

export interface ProfileUpdateResponse {
  user: User;
  message: string;
}

export interface PasswordUpdateResponse {
  message: string;
  requiresReauth?: boolean;
}

export interface DeleteAccountResponse {
  message: string;
  deletionScheduledFor?: string;
}

class UserService {
  private readonly BASE_PATH = '/v1/api/users';

  /**
   * Get current user's profile (includes preferences and optional statistics)
   */
  async getProfile(): Promise<UserProfileResponse> {
    try {
      const response = await apiService.get<any>(`${this.BASE_PATH}/profile`);

      // Backend returns { user: {...} } directly (not wrapped in ApiResponse.data)
      // The apiService.get() returns response.data from axios, which is the JSON body
      // Handle both wrapped and direct response formats
      let userData: any;
      let preferences: UserPreferences;

      // Check if response has data field (wrapped format)
      if (response.data && typeof response.data === 'object') {
        // Check if it's wrapped in ApiResponse format
        if ('user' in response.data) {
          userData = response.data.user;
        } else if ('data' in response.data && response.data.data) {
          // Double wrapped
          userData = response.data.data.user || response.data.data;
        } else {
          userData = response.data;
        }
      } else if ('user' in response) {
        // Direct format: { user: {...} }
        userData = response.user;
      } else {
        // Fallback: assume response is the user data directly
        userData = response;
      }

      if (!userData) {
        throw new Error('Failed to fetch user profile: No user data in response');
      }

      // Extract preferences from user object (backend nests preferences in user)
      if (userData.preferences) {
        // Map backend preferences to frontend format
        const backendPrefs = userData.preferences;
        preferences = {
          emailNotifications: backendPrefs.emailNotifications ?? true,
          pushNotifications: backendPrefs.pushNotifications ?? true,
          sessionReminders: backendPrefs.sessionReminders ?? true,
          weeklyReport: backendPrefs.weeklyReport ?? false,
          theme: backendPrefs.theme || 'light',
          language: backendPrefs.language,
          timezone: backendPrefs.timezone,
        };
      } else {
        // Fallback: create default preferences if not provided
        preferences = {
          emailNotifications: true,
          pushNotifications: true,
          sessionReminders: true,
          weeklyReport: false,
        };
      }

      // Return in the expected UserProfileResponse format
      return {
        user: userData,
        preferences: preferences,
      };
    } catch (error: any) {
      logger.error('Get profile error', error);
      // Provide more detailed error message
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch user profile';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get current user's basic profile (legacy method for backward compatibility)
   */
  async getBasicProfile(): Promise<User> {
    const profileResponse = await this.getProfile();
    return profileResponse.user;
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiService.put<User>(`${this.BASE_PATH}/profile`, data);

    if (!response.data) {
      throw new Error('Failed to update profile');
    }

    return response.data;
  }

  /**
   * Update user password
   */
  async updatePassword(data: UpdatePasswordRequest): Promise<PasswordUpdateResponse> {
    // Validate passwords match
    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    // Validate password strength (basic validation)
    if (data.newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    const response = await apiService.put<PasswordUpdateResponse>(`${this.BASE_PATH}/password`, {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (!response.data) {
      throw new Error('Failed to update password');
    }

    return response.data;
  }

  /**
   * Delete user account
   */
  async deleteAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    const response = await apiService.delete<DeleteAccountResponse>(`${this.BASE_PATH}/account`, {
      data: {
        password: data.password,
        reason: data.reason,
        feedback: data.feedback,
      },
    });

    if (!response.data) {
      throw new Error('Failed to delete account');
    }

    return response.data;
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiService.post<{ imageUrl: string }>(
      `${this.BASE_PATH}/profile/image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data) {
      throw new Error('Failed to upload profile image');
    }

    return response.data;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await apiService.put<{ message: string; preferences: UserPreferences }>(
      `${this.BASE_PATH}/profile/preferences`,
      preferences
    );

    // Handle both wrapped and direct response formats
    const result = (response as any).data || response;

    if (!result) {
      throw new Error('Failed to update preferences');
    }

    // Extract preferences from the response
    if (result.preferences) {
      return result.preferences;
    } else if (result.data?.preferences) {
      return result.data.preferences;
    } else if (result.data) {
      return result.data;
    }

    throw new Error('Failed to update preferences: Invalid response format');
  }

  /**
   * Get user activity log
   */
  async getActivityLog(params?: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    activities: Array<{
      id: string;
      type: string;
      description: string;
      timestamp: string;
      metadata?: Record<string, any>;
    }>;
    total: number;
    page: number;
    totalPages: number;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);

    const queryString = queryParams.toString();
    const url = `${this.BASE_PATH}/activity${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<{
      activities: Array<{
        id: string;
        type: string;
        description: string;
        timestamp: string;
        metadata?: Record<string, any>;
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(url);

    if (!response.data) {
      throw new Error('Failed to fetch activity log');
    }

    return response.data;
  }

  /**
   * Request account data export (GDPR compliance)
   */
  async requestDataExport(): Promise<{ message: string; exportId: string; data: any }> {
    try {
      const response = await apiService.post<{ exportId: string; data: any }>(
        `${this.BASE_PATH}/export-data`
      );

      // Backend returns: { success: true, message, data: { exportId, data } }
      if (!response.success || !response.data) {
        logger.warn('Invalid export response', { response });
        throw new Error('Invalid response format from server');
      }

      return {
        message: response.message || 'Export generated successfully',
        exportId: response.data.exportId,
        data: response.data.data,
      };
    } catch (error: any) {
      logger.error('Error requesting data export', error);
      throw new Error(error?.message || 'Failed to request data export');
    }
  }

  /**
   * Download account data export
   */
  async downloadDataExport(exportId: string): Promise<void> {
    // Use axios directly to get JSON response
    const axios = (await import('axios')).default;
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(
        `http://localhost:3001${this.BASE_PATH}/export-data/${exportId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          responseType: 'json',
          withCredentials: true,
        }
      );

      // Handle both wrapped and direct response formats
      const data = (response.data as any).data || response.data;

      // Create a blob and download it
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-data-export-${exportId || Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      if (error.response?.status === 403) {
        throw new Error(
          'You do not have permission to download this export. Please request a new export.'
        );
      }
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string; verified: boolean }> {
    const response = await apiService.post<{ message: string; verified: boolean }>(
      `${this.BASE_PATH}/verify-email`,
      { token }
    );

    if (!response.data) {
      throw new Error('Failed to verify email');
    }

    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(
      `${this.BASE_PATH}/resend-verification`
    );

    if (!response.data) {
      throw new Error('Failed to resend verification email');
    }

    return response.data;
  }

  /**
   * Update email address (requires verification)
   */
  async updateEmail(
    newEmail: string,
    password: string
  ): Promise<{ message: string; verificationRequired: boolean }> {
    const response = await apiService.put<{ message: string; verificationRequired: boolean }>(
      `${this.BASE_PATH}/email`,
      {
        newEmail,
        password,
      }
    );

    if (!response.data) {
      throw new Error('Failed to update email');
    }

    return response.data;
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalStudyHours: number;
    completedSessions: number;
    currentStreak: number;
    totalQuizzes: number;
    averageScore: number;
    badgesEarned: number;
    currentLevel: number;
    totalPoints: number;
  }> {
    const response = await apiService.get<{
      totalStudyHours: number;
      completedSessions: number;
      currentStreak: number;
      totalQuizzes: number;
      averageScore: number;
      badgesEarned: number;
      currentLevel: number;
      totalPoints: number;
    }>(`${this.BASE_PATH}/stats`);

    if (!response.data) {
      throw new Error('Failed to fetch user statistics');
    }

    return response.data;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    sessionReminders?: boolean;
    weeklyReport?: boolean;
    marketingEmails?: boolean;
  }): Promise<UserPreferences> {
    const response = await apiService.put<UserPreferences>(
      `${this.BASE_PATH}/notifications`,
      settings
    );

    if (!response.data) {
      throw new Error('Failed to update notification settings');
    }

    return response.data;
  }

  /**
   * Block/unblock another user
   */
  async blockUser(userId: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(
      `${this.BASE_PATH}/block/${userId}`
    );

    if (!response.data) {
      throw new Error('Failed to block user');
    }

    return response.data;
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(
      `${this.BASE_PATH}/block/${userId}`
    );

    if (!response.data) {
      throw new Error('Failed to unblock user');
    }

    return response.data;
  }

  /**
   * Get blocked users list
   */
  async getBlockedUsers(): Promise<
    Array<{ id: string; firstName: string; lastName: string; blockedAt: string }>
  > {
    const response = await apiService.get<
      Array<{ id: string; firstName: string; lastName: string; blockedAt: string }>
    >(`${this.BASE_PATH}/blocked`);

    return response.data || [];
  }

  /**
   * Enable two-factor authentication
   */
  async enable2FA(): Promise<{ qrCode: string; secret: string; backupCodes: string[] }> {
    const response = await apiService.post<{
      qrCode: string;
      secret: string;
      backupCodes: string[];
    }>(`${this.BASE_PATH}/2fa/enable`);

    if (!response.data) {
      throw new Error('Failed to enable 2FA');
    }

    return response.data;
  }

  /**
   * Verify and activate two-factor authentication
   */
  async verify2FA(token: string, secret: string): Promise<{ message: string; enabled: boolean }> {
    const response = await apiService.post<{ message: string; enabled: boolean }>(
      `${this.BASE_PATH}/2fa/verify`,
      { token, secret }
    );

    if (!response.data) {
      throw new Error('Failed to verify 2FA');
    }

    return response.data;
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(password: string): Promise<{ message: string }> {
    const response = await apiService.post<{ message: string }>(`${this.BASE_PATH}/2fa/disable`, {
      password,
    });

    if (!response.data) {
      throw new Error('Failed to disable 2FA');
    }

    return response.data;
  }

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<{
    twoFactorEnabled: boolean;
    lastPasswordChange: string;
    activeSessions: Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>;
  }> {
    const response = await apiService.get<{
      twoFactorEnabled: boolean;
      lastPasswordChange: string;
      activeSessions: Array<{
        id: string;
        device: string;
        location: string;
        lastActive: string;
        current: boolean;
      }>;
    }>(`${this.BASE_PATH}/security`);

    if (!response.data) {
      throw new Error('Failed to fetch security settings');
    }

    return response.data;
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<{ message: string }> {
    const response = await apiService.delete<{ message: string }>(
      `${this.BASE_PATH}/sessions/${sessionId}`
    );

    if (!response.data) {
      throw new Error('Failed to revoke session');
    }

    return response.data;
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllSessions(): Promise<{ message: string; revokedCount: number }> {
    const response = await apiService.post<{ message: string; revokedCount: number }>(
      `${this.BASE_PATH}/sessions/revoke-all`
    );

    if (!response.data) {
      throw new Error('Failed to revoke sessions');
    }

    return response.data;
  }
}

export const userService = new UserService();
export default userService;
