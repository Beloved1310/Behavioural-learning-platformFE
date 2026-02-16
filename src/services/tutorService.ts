import { apiService } from './api';

export interface Tutor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatar?: string;
  profileImage?: string;
  subjects: string[];
  rating: number;
  totalReviews: number;
  experience: string;
  specialties: string[];
  availability: TutorAvailability[];
  hourlyRate: number;
  currency: string;
  description: string;
  bio: string;
  isOnline: boolean;
  isVerified: boolean;
  totalSessions: number;
  languages: string[];
  education?: string[];
  certifications?: string[];
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TutorAvailability {
  id: string;
  tutorId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeSlots: TimeSlot[];
  isAvailable: boolean;
}

export interface TimeSlot {
  startTime: string; // Format: "HH:mm" (24-hour)
  endTime: string;
  isBooked: boolean;
}

export interface TutorSearchFilters {
  subject?: string;
  minRating?: number;
  maxHourlyRate?: number;
  languages?: string[];
  isOnline?: boolean;
  availability?: {
    day: string;
    time: string;
  };
  search?: string; // Search by name or specialties
  page?: number;
  limit?: number;
}

export interface TutorAvailabilityQuery {
  date: string; // ISO date string
  duration?: number; // in minutes
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface BookSessionRequest {
  tutorId: string;
  title: string;
  subject: string;
  startTime: string; // ISO datetime string
  endTime?: string;
  duration?: number; // in minutes
  description?: string;
  notes?: string;
}

export interface BookSessionResponse {
  sessionId: string;
  tutorId: string;
  tutorName: string;
  status: 'pending' | 'confirmed';
  startTime: string;
  endTime: string;
  amount: number;
  currency: string;
}

class TutorService {
  private readonly BASE_PATH = '/v1/api/tutors';

  /**
   * Search for available tutors with filters
   */
  async searchTutors(filters?: TutorSearchFilters): Promise<Tutor[]> {
    const params = new URLSearchParams();

    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxHourlyRate) params.append('maxHourlyRate', filters.maxHourlyRate.toString());
    if (filters?.languages) params.append('languages', filters.languages.join(','));
    if (filters?.isOnline !== undefined) params.append('isOnline', filters.isOnline.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    if (filters?.availability) {
      params.append('availabilityDay', filters.availability.day);
      params.append('availabilityTime', filters.availability.time);
    }

    const queryString = params.toString();
    const url = `${this.BASE_PATH}/search${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<Tutor[]>(url);
    return response.data || [];
  }

  /**
   * Get tutor availability for a specific date
   */
  async getTutorAvailability(
    tutorId: string,
    query: TutorAvailabilityQuery
  ): Promise<AvailableSlot[]> {
    const params = new URLSearchParams();
    params.append('date', query.date);
    if (query.duration) params.append('duration', query.duration.toString());

    const url = `${this.BASE_PATH}/${tutorId}/availability?${params.toString()}`;

    const response = await apiService.get<AvailableSlot[]>(url);
    return response.data || [];
  }

  /**
   * Get tutor details by ID
   */
  async getTutorById(tutorId: string): Promise<Tutor> {
    const response = await apiService.get<Tutor>(`${this.BASE_PATH}/${tutorId}`);

    if (!response.data) {
      throw new Error('Tutor not found');
    }

    return response.data;
  }

  /**
   * Book a session with a tutor
   */
  async bookSession(data: BookSessionRequest): Promise<BookSessionResponse> {
    const response = await apiService.post<BookSessionResponse>(`${this.BASE_PATH}/book`, data);

    if (!response.data) {
      throw new Error('Failed to book session');
    }

    return response.data;
  }

  /**
   * Get tutor reviews
   */
  async getTutorReviews(tutorId: string, page = 1, limit = 10) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `${this.BASE_PATH}/${tutorId}/reviews?${params.toString()}`;

    const response = await apiService.get(url);
    return response.data || [];
  }

  /**
   * Submit a review for a tutor
   */
  async submitReview(tutorId: string, sessionId: string, rating: number, comment: string) {
    const response = await apiService.post(`${this.BASE_PATH}/${tutorId}/reviews`, {
      sessionId,
      rating,
      comment,
    });

    return response.data;
  }
}

export const tutorService = new TutorService();
export default tutorService;
