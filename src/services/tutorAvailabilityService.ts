import { apiService } from './api';
import { logger } from '../utils/logger';

export interface TutorAvailabilitySlot {
  id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: "HH:mm" (e.g., "09:00")
  endTime: string; // Format: "HH:mm" (e.g., "17:00")
  isRecurring?: boolean; // Default true
  specificDate?: string; // ISO date string if not recurring
  isActive?: boolean;
}

export interface AvailableTimeSlot {
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  isAvailable: boolean;
}

class TutorAvailabilityService {
  private readonly BASE_PATH = '/v1/api/tutor';

  /**
   * Get tutor's availability settings
   */
  async getAvailability(): Promise<TutorAvailabilitySlot[]> {
    try {
      console.log(
        '[TutorAvailabilityService] Fetching availability from:',
        `${this.BASE_PATH}/availability`
      );
      const response = await apiService.get<{
        success: boolean;
        availabilities: TutorAvailabilitySlot[];
      }>(`${this.BASE_PATH}/availability`);

      // Backend returns: { success: true, availabilities: [...] }
      // apiService.get returns response.data from axios, which is the response body
      // So response is already { success: true, availabilities: [...] }
      if ((response as any).availabilities && Array.isArray((response as any).availabilities)) {
        logger.debug(
          '[TutorAvailabilityService] Found availabilities in response.availabilities:',
          (response as any).availabilities.length
        );
        return (response as any).availabilities;
      }

      // Fallback: check if wrapped in data
      if ((response as any).data && ((response as any).data as any).availabilities) {
        logger.debug(
          '[TutorAvailabilityService] Found availabilities in response.data.availabilities:',
          ((response as any).data as any).availabilities.length
        );
        return ((response as any).data as any).availabilities || [];
      }

      console.warn('[TutorAvailabilityService] Unexpected response structure:', response);
      return [];
    } catch (error) {
      logger.error('Failed to get availability', error);
      throw error;
    }
  }

  /**
   * Set tutor's availability (replaces all existing)
   */
  async setAvailability(availabilities: TutorAvailabilitySlot[]): Promise<TutorAvailabilitySlot[]> {
    try {
      const response = await apiService.post<{
        success: boolean;
        availabilities: TutorAvailabilitySlot[];
      }>(`${this.BASE_PATH}/availability`, { availabilities });

      // Backend returns: { success: true, availabilities: [...] }
      // apiService.post returns response.data from axios, which is the response body
      // So response is already { success: true, availabilities: [...] }
      if ((response as any).availabilities && Array.isArray((response as any).availabilities)) {
        return (response as any).availabilities;
      }

      // Fallback: check if wrapped in data
      if (response.data && (response.data as any).availabilities) {
        return (response.data as any).availabilities || [];
      }

      console.warn('[TutorAvailabilityService] Unexpected response structure:', response);
      return [];
    } catch (error) {
      logger.error('Failed to set availability', error);
      throw error;
    }
  }

  /**
   * Add a single availability slot
   */
  async addAvailability(
    availability: Omit<TutorAvailabilitySlot, 'id'>
  ): Promise<TutorAvailabilitySlot> {
    const response = await apiService.post<{
      success: boolean;
      availability: TutorAvailabilitySlot;
    }>(`${this.BASE_PATH}/availability/add`, availability);
    return response.availability;
  }

  /**
   * Delete an availability slot
   */
  async deleteAvailability(availabilityId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/availability/${availabilityId}`);
  }
}

export const tutorAvailabilityService = new TutorAvailabilityService();
