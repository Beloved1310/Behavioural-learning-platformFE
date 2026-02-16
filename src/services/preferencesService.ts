import { apiService } from './api';
import { UserPreferences } from '../types';

// Request/Response Types
export interface PreferencesResponse {
  preferences: UserPreferences;
  message?: string;
}

export interface UpdatePreferencesRequest {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  sessionReminders?: boolean;
  weeklyReport?: boolean;
  language?: string;
  timezone?: string;
}

export interface ResetPreferencesResponse {
  preferences: UserPreferences;
  message: string;
}

class PreferencesService {
  private readonly BASE_PATH = '/v1/api/preferences';

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await apiService.get<PreferencesResponse>(`${this.BASE_PATH}`);

    if (!response.data?.preferences) {
      throw new Error('Failed to fetch preferences');
    }

    return response.data.preferences;
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    const response = await apiService.put<PreferencesResponse>(`${this.BASE_PATH}`, data);

    if (!response.data?.preferences) {
      throw new Error('Failed to update preferences');
    }

    return response.data.preferences;
  }

  /**
   * Reset preferences to defaults
   */
  async resetPreferences(): Promise<UserPreferences> {
    const response = await apiService.post<ResetPreferencesResponse>(`${this.BASE_PATH}/reset`);

    if (!response.data?.preferences) {
      throw new Error('Failed to reset preferences');
    }

    return response.data.preferences;
  }

  /**
   * Update specific preference setting
   */
  async updateSinglePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ): Promise<UserPreferences> {
    return this.updatePreferences({ [key]: value } as UpdatePreferencesRequest);
  }

  /**
   * Get default preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      emailNotifications: true,
      pushNotifications: true,
      sessionReminders: true,
      weeklyReport: true,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  /**
   * Validate preferences data
   */
  validatePreferences(preferences: Partial<UserPreferences>): boolean {
    // Validate boolean fields
    const booleanFields: (keyof UserPreferences)[] = [
      'emailNotifications',
      'pushNotifications',
      'sessionReminders',
      'weeklyReport',
    ];

    for (const field of booleanFields) {
      if (preferences[field] !== undefined && typeof preferences[field] !== 'boolean') {
        throw new Error(`Invalid ${field} value - must be boolean`);
      }
    }

    return true;
  }
}

export const preferencesService = new PreferencesService();
export default preferencesService;
