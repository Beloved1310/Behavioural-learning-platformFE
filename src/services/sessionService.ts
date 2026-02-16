import { apiService } from './api';
import { logger } from '../utils/logger';

export interface Session {
  id: string;
  userId: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  duration: number;
  tutorId?: string;
  tutor?: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'confirmed' | 'pending';
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderEnabled?: boolean;
  reminderTime?: number; // minutes before session
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionFilters {
  status?: Session['status'];
  type?: Session['type'];
  subject?: string;
  tutorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SessionStats {
  totalSessions?: number;
  upcomingSessions?: number;
  completedSessions: number;
  missedSessions?: number;
  cancelledSessions?: number;
  totalStudyHours: number;
  averageSessionDuration?: number;
  mostFrequentSubject?: string;
  currentStreak?: number;
  total?: number;
  scheduled?: number;
  completed?: number;
  missed?: number;
  cancelled?: number;
  upcoming?: number;
  today?: number;
  averageRating?: number;
}

export interface CreateSessionRequest {
  title: string;
  subject: string;
  type: Session['type'];
  startTime: string;
  endTime?: string;
  duration?: number;
  tutorId?: string;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  reminderEnabled?: boolean;
  reminderTime?: number;
  description?: string;
  notes?: string;
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: string;
}

export interface UpdateSessionStatusRequest {
  status: Session['status'];
}

export interface Tutor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage?: string;
  bio?: string;
  subjects: string[];
  rating?: number;
  totalSessions?: number;
  hourlyRate?: number;
  availability?: TutorAvailability[];
}

export interface TutorAvailability {
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface SearchTutorsRequest {
  subject?: string;
  query?: string; // Search query for name, bio, subjects
  availability?: string; // ISO date string
  minRating?: number;
  maxRate?: number;
  page?: number;
  limit?: number;
}

export interface SearchTutorsResponse {
  tutors: Tutor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BookTutorRequest {
  tutorId: string;
  title: string; // Required by backend
  subject: string;
  startTime: string;
  duration: number;
  description?: string;
  reminderEnabled?: boolean;
  reminderTime?: number;
}

class SessionService {
  private readonly BASE_PATH = '/v1/api/sessions';
  private readonly TUTOR_PATH = '/v1/api/tutors';

  /**
   * Get all sessions with optional filters and pagination
   */
  async getSessions(filters?: SessionFilters): Promise<{ sessions: Session[]; pagination?: any }> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.tutorId) params.append('tutorId', filters.tutorId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${this.BASE_PATH}${queryString ? `?${queryString}` : ''}`;

    const response = await apiService.get<any>(url);

    // Handle paginated response
    const responseData = response as any;
    
    // Backend returns: { success: true, data: { sessions: [...], pagination: {...} } }
    if (responseData.success && responseData.data) {
      if (responseData.data.sessions && responseData.data.pagination) {
        return {
          sessions: responseData.data.sessions,
          pagination: responseData.data.pagination,
        };
      }
      // If data.sessions exists but no pagination
      if (responseData.data.sessions && Array.isArray(responseData.data.sessions)) {
        return {
          sessions: responseData.data.sessions,
          pagination: responseData.data.pagination,
        };
      }
    }

    // Fallback: check for sessions at top level (backward compatibility)
    if (responseData.success && responseData.sessions && responseData.pagination) {
      return {
        sessions: responseData.sessions,
        pagination: responseData.pagination,
      };
    }

    // Fallback for non-paginated responses (backward compatibility)
    if (responseData.sessions && Array.isArray(responseData.sessions)) {
      return {
        sessions: responseData.sessions,
      };
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return {
        sessions: responseData.data,
      };
    }

    return { sessions: [] };
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<SessionStats> {
    try {
      const response = await apiService.get<{ stats: SessionStats }>(`${this.BASE_PATH}/stats`);

      logger.debug('Session stats raw response', { response });

      // Handle both wrapped (ApiResponse) and direct response formats
      let statsData: any;

      if (response.success && response.data) {
        // Wrapped format: { success: true, data: { stats: {...} } }
        statsData = response.data.stats || response.data;
        logger.debug('Using wrapped format', { statsData });
      } else if ((response as any).stats) {
        // Direct format: { stats: {...} }
        statsData = (response as any).stats;
        logger.debug('Using direct stats format', { statsData });
      } else if (
        (response as any).total !== undefined ||
        (response as any).totalSessions !== undefined
      ) {
        // Direct stats object: { total: ..., completed: ..., ... }
        statsData = response as any;
        logger.debug('Using direct stats object', { statsData });
      } else {
        logger.error('Failed to parse stats response', undefined, { 
          response,
          responseKeys: Object.keys(response || {}),
          hasSuccess: 'success' in (response || {}),
          hasData: 'data' in (response || {}),
        });
        throw new Error('Failed to load session statistics: Invalid response format');
      }

      // Map backend response to frontend interface
      const mappedStats = {
        totalSessions: statsData.total || statsData.totalSessions || 0,
        upcomingSessions: statsData.upcoming || statsData.upcomingSessions || 0,
        completedSessions: statsData.completed || statsData.completedSessions || 0,
        missedSessions: statsData.missed || statsData.missedSessions || 0,
        cancelledSessions: statsData.cancelled || statsData.cancelledSessions || 0,
        totalStudyHours: statsData.totalStudyHours || 0,
        averageSessionDuration: statsData.averageSessionDuration || 0,
        currentStreak: statsData.currentStreak || 0,
      };

      logger.debug('Mapped session stats', { mappedStats, originalStatsData: statsData });
      return mappedStats;
    } catch (error) {
      logger.error('Error fetching session stats', error);
      // Return default values instead of throwing to prevent UI crashes
      return {
        totalSessions: 0,
        upcomingSessions: 0,
        completedSessions: 0,
        missedSessions: 0,
        cancelledSessions: 0,
        totalStudyHours: 0,
        averageSessionDuration: 0,
        currentStreak: 0,
      };
    }
  }

  /**
   * Get session details by ID
   */
  async getSessionById(sessionId: string): Promise<Session> {
    const response = await apiService.get<Session>(`${this.BASE_PATH}/${sessionId}`);

    logger.debug('Get session by ID response', { sessionId });

    // Backend returns { session: {...} } format
    const responseData = response as any;
    if (responseData.session && typeof responseData.session === 'object') {
      console.log('Session found in response.session:', responseData.session);
      return responseData.session as Session;
    }

    // Check if response indicates success (wrapped in ApiResponse format)
    if (response.success && response.data) {
      // Check if data contains session field
      if ((response.data as any).session) {
        return (response.data as any).session as Session;
      }
      // Or if data is the session itself
      if ((response.data as any).id && (response.data as any).title) {
        return response.data as Session;
      }
    }

    // If response doesn't have success field, check if it's the session directly
    if (responseData.id && responseData.title) {
      return responseData as Session;
    }

    throw new Error(response.error || response.message || 'Session not found');
  }

  /**
   * Create a new session
   */
  async createSession(data: CreateSessionRequest): Promise<Session> {
    const response = await apiService.post<Session>(this.BASE_PATH, data);

    logger.debug('Create session response', { data: response });

    const responseData = response as any;

    // Backend returns { session: {...} } format (line 258 in sessionsController.ts)
    if (responseData.session && typeof responseData.session === 'object') {
      console.log('Session found in response.session:', responseData.session);
      return responseData.session as Session;
    }

    // Check if response indicates success (wrapped in ApiResponse format)
    if (response.success) {
      // First check if data exists in the response
      if (response.data) {
        // Check if data contains session field
        if ((response.data as any).session) {
          return (response.data as any).session as Session;
        }
        // Or if data is the session itself
        if ((response.data as any).id && (response.data as any).title) {
          return response.data as Session;
        }
      }

      // Check if backend returns session wrapped in a sessions array
      if (
        responseData.sessions &&
        Array.isArray(responseData.sessions) &&
        responseData.sessions.length > 0
      ) {
        console.log('Session found in sessions array:', responseData.sessions[0]);
        return responseData.sessions[0] as Session;
      }

      // If no data but success is true, the API might return session data at root level
      // This handles different backend response formats
      if (responseData.id && responseData.title) {
        return responseData as Session;
      }

      // If success is true but we can't find session data, throw a more specific error
      logger.warn('Session created but response format unexpected', { response });
      throw new Error(
        'Session created but could not parse response. Please refresh to see your session.'
      );
    }

    // If response doesn't have success field, check if it's the session directly
    if (responseData.id && responseData.title) {
      return responseData as Session;
    }

    throw new Error(response.error || response.message || 'Failed to create session');
  }

  /**
   * Update an existing session
   */
  async updateSession(sessionId: string, data: Partial<CreateSessionRequest>): Promise<Session> {
    const response = await apiService.put<Session>(`${this.BASE_PATH}/${sessionId}`, data);

    logger.debug('Update session response', { sessionId });

    const responseData = response as any;

    // Backend returns { session: {...} } format (similar to create)
    if (responseData.session && typeof responseData.session === 'object') {
      console.log('Session found in response.session:', responseData.session);
      return responseData.session as Session;
    }

    // Check if response indicates success (wrapped in ApiResponse format)
    if (response.success) {
      // First check if data exists in the response
      if (response.data) {
        // Check if data contains session field
        if ((response.data as any).session) {
          return (response.data as any).session as Session;
        }
        // Or if data is the session itself
        if ((response.data as any).id && (response.data as any).title) {
          return response.data as Session;
        }
      }

      // Check if backend returns session wrapped in a sessions array
      if (
        responseData.sessions &&
        Array.isArray(responseData.sessions) &&
        responseData.sessions.length > 0
      ) {
        console.log('Session found in sessions array:', responseData.sessions[0]);
        return responseData.sessions[0] as Session;
      }

      // If no data but success is true, the API might return session data at root level
      // This handles different backend response formats
      if (responseData.id && responseData.title) {
        return responseData as Session;
      }

      // If success is true but we can't find session data, throw a more specific error
      logger.warn('Session updated but response format unexpected', { response });
      throw new Error(
        'Session updated but could not parse response. Please refresh to see your changes.'
      );
    }

    // If response doesn't have success field, check if it's the session directly
    if (responseData.id && responseData.title) {
      return responseData as Session;
    }

    throw new Error(response.error || response.message || 'Failed to update session');
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await apiService.delete(`${this.BASE_PATH}/${sessionId}`);
  }

  /**
   * Update session status
   */
  async updateSessionStatus(sessionId: string, status: Session['status']): Promise<Session> {
    const response = await apiService.patch<Session>(`${this.BASE_PATH}/${sessionId}/status`, {
      status,
    });

    if (response.success) {
      // First check if data exists in the response
      if (response.data) {
        return response.data;
      }

      // Check if backend returns session wrapped in a sessions array
      const responseData = response as any;
      if (
        responseData.sessions &&
        Array.isArray(responseData.sessions) &&
        responseData.sessions.length > 0
      ) {
        return responseData.sessions[0] as Session;
      }

      // Handle different backend response formats
      if (responseData.id && responseData.title) {
        return responseData as Session;
      }

      // If success is true but we can't find session data, throw a more specific error
      logger.warn('Session status updated but response format unexpected', { response });
      throw new Error(
        'Session status updated but could not parse response. Please refresh to see your changes.'
      );
    }

    throw new Error(response.error || response.message || 'Failed to update session status');
  }

  /**
   * Search for tutors
   */
  async searchTutors(filters?: SearchTutorsRequest): Promise<SearchTutorsResponse> {
    const params = new URLSearchParams();

    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.query) params.append('query', filters.query);
    if (filters?.availability) params.append('availability', filters.availability);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRate) params.append('maxRate', filters.maxRate.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    // The tutor search route is under sessions routes: /v1/api/sessions/tutors/search
    const url = `${this.BASE_PATH}/tutors/search${queryString ? `?${queryString}` : ''}`;

    logger.debug('Searching tutors', {
      url,
      filters,
      queryString,
      fullUrl: url,
    });

    const response = await apiService.get<SearchTutorsResponse>(url);

    logger.debug('Raw API response for tutor search', {
      success: response.success,
      hasData: !!response.data,
      hasTutors: !!(response as any).tutors,
      responseKeys: Object.keys(response),
      dataKeys: response.data ? Object.keys(response.data) : [],
      fullResponse: response,
    });

    // The backend returns { tutors: [...], pagination: {...} } directly
    // apiService.get may or may not wrap it in ApiResponse structure
    let tutorsData: SearchTutorsResponse;

    // Check if response has tutors directly (backend returns directly)
    if ((response as any).tutors && Array.isArray((response as any).tutors)) {
      // Backend returned data directly: { tutors: [...], pagination: {...} }
      tutorsData = response as any as SearchTutorsResponse;
      logger.debug('Found tutors directly in response', { count: tutorsData.tutors.length });
    }
    // Check if response.data has tutors (wrapped in ApiResponse)
    else if (
      response.data &&
      (response.data as any).tutors &&
      Array.isArray((response.data as any).tutors)
    ) {
      // Response is wrapped in ApiResponse structure: { success: true, data: { tutors: [...], pagination: {...} } }
      tutorsData = response.data as SearchTutorsResponse;
      logger.debug('Found tutors in response.data', { count: tutorsData.tutors.length });
    }
    // Check if response.data is an array (old format)
    else if (Array.isArray(response.data)) {
      // Old format: array of tutors
      tutorsData = {
        tutors: response.data as any[],
        pagination: {
          page: 1,
          limit: response.data.length,
          total: response.data.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
      logger.debug('Found tutors as array in response.data', { count: tutors.length });
    } else {
      // Fallback: empty result
      logger.warn('Unexpected response format for tutor search', { response });
      tutorsData = {
        tutors: [],
        pagination: {
          page: 1,
          limit: 7,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    logger.debug('Processed tutors data', {
      tutorsCount: tutorsData.tutors?.length || 0,
      hasPagination: !!tutorsData.pagination,
      tutors: tutorsData.tutors?.slice(0, 2), // Log first 2 tutors
    });

    return tutorsData;
  }

  /**
   * Get tutor availability
   */
  async getTutorAvailability(
    tutorId: string,
    date?: string,
    duration?: number
  ): Promise<{
    tutorId: string;
    date: string;
    availableSlots: Array<{ startTime: string; endTime: string; isAvailable: boolean }>;
    bookedSlots: Array<{ start: string; end: string }>;
    tutor: { id: string; name: string; hourlyRate: number; rating: number };
  }> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (duration) params.append('duration', duration.toString());

    // Use BASE_PATH since the route is /v1/api/sessions/tutors/:tutorId/availability
    const url = `${this.BASE_PATH}/tutors/${tutorId}/availability${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await apiService.get<{
      tutorId: string;
      date: string;
      availableSlots: Array<{ startTime: string; endTime: string; isAvailable: boolean }>;
      bookedSlots: Array<{ start: string; end: string }>;
      tutor: { id: string; name: string; hourlyRate: number; rating: number };
    }>(url);

    // Handle both wrapped (ApiResponse) and direct response formats
    // Backend returns data directly, not wrapped in { success: true, data: ... }
    let availabilityData;

    if (response.success && response.data) {
      // Wrapped format: { success: true, data: {...} }
      availabilityData = response.data;
    } else if ((response as any).tutorId || (response as any).availableSlots) {
      // Direct format: { tutorId, availableSlots, ... }
      availabilityData = response as any;
    } else {
      logger.error('Failed to parse availability response', undefined, { response });
      throw new Error('Failed to load tutor availability: Invalid response format');
    }

    return availabilityData;
  }

  /**
   * Book a session with a tutor
   */
  async bookTutorSession(data: BookTutorRequest): Promise<Session> {
    // Use BASE_PATH since the route is /v1/api/sessions/tutors/book
    const response = await apiService.post<{ session: Session }>(
      `${this.BASE_PATH}/tutors/book`,
      data
    );

    // Handle both wrapped (ApiResponse) and direct response formats
    let sessionData: Session;

    if (response.success && response.data) {
      // Wrapped format: { success: true, data: { session: {...} } }
      sessionData = (response.data as any).session || response.data;
    } else if ((response as any).session) {
      // Direct format: { session: {...} }
      sessionData = (response as any).session;
    } else if ((response as any).id || (response as any).title) {
      // Direct session object
      sessionData = response as any;
    } else {
      logger.error('Failed to parse booking response', undefined, { response });
      throw new Error('Failed to book tutor session: Invalid response format');
    }

    return sessionData;
  }
}

export const sessionService = new SessionService();
export default sessionService;
