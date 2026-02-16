import { apiService } from './api';

// ============ MVP Request Types ============
export interface TrackEngagementRequest {
  eventType: 'login' | 'session_start' | 'session_end' | 'quiz_start' | 'quiz_complete';
  sessionId?: string;
  duration?: number; // in seconds
  metadata?: Record<string, any>;
}

export interface RecordBehavioralDataRequest {
  sessionDuration: number; // in seconds
  actionsPerformed: number;
  mood?: 'happy' | 'neutral' | 'frustrated' | 'confused';
  engagementScore: number; // 0-100
  pageViews?: any;
}

export interface WeeklyProgressSummary {
  weekStart: string;
  weekEnd: string;
  sessions: {
    completed: number;
    totalDuration: number; // in minutes
  };
  quizzes: {
    completed: number;
    averageScore: number;
  };
  engagement: {
    totalTime: number; // in minutes
    averageScore: number;
  };
}

// ============ Response Types ============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class BehavioralService {
  private readonly BASE_PATH = '/v1/api/behavioral';

  // ============ MVP: Engagement Tracking ============

  /**
   * Track engagement event (login, session start, etc.)
   */
  async trackEngagement(
    data: TrackEngagementRequest
  ): Promise<{ id: string; eventType: string; timestamp: string }> {
    try {
      const response = await apiService.post<
        ApiResponse<{ id: string; eventType: string; timestamp: string }>
      >(`${this.BASE_PATH}/engagement/track`, data);

      // apiService.post returns response.data from axios, which is the response body
      // Backend returns: { success: true, data: { id, eventType, timestamp } }
      if (response.success && response.data) {
        return response.data;
      }

      // Check for backward compatibility (if data is directly in response)
      if ((response as any).id && (response as any).eventType) {
        return response as any;
      }

      console.error('[BehavioralService] trackEngagement failed:', response);
      throw new Error(response.message || 'Failed to track engagement');
    } catch (error: any) {
      console.error('[BehavioralService] trackEngagement error:', error);
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to track engagement'
      );
    }
  }

  /**
   * Record behavioral data (session duration, engagement score)
   */
  async recordBehavioralData(
    data: RecordBehavioralDataRequest
  ): Promise<{ id: string; timestamp: string }> {
    try {
      const response = await apiService.post<ApiResponse<{ id: string; timestamp: string }>>(
        `${this.BASE_PATH}/engagement/data`,
        data
      );

      // apiService.post returns response.data from axios, which is the response body
      // Backend returns: { success: true, data: { id, timestamp } }
      if (response.success && response.data) {
        return response.data;
      }

      // Check for backward compatibility (if data is directly in response)
      if ((response as any).id && (response as any).timestamp) {
        return response as any;
      }

      console.error('[BehavioralService] recordBehavioralData failed:', response);
      throw new Error(response.message || 'Failed to record behavioral data');
    } catch (error: any) {
      console.error('[BehavioralService] recordBehavioralData error:', error);
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to record behavioral data'
      );
    }
  }

  // ============ MVP: Basic Progress Summary ============

  /**
   * Get weekly progress summary
   */
  async getWeeklyProgressSummary(): Promise<WeeklyProgressSummary> {
    const response = await apiService.get<ApiResponse<WeeklyProgressSummary>>(
      `${this.BASE_PATH}/progress/weekly`
    );

    // apiService.get returns response.data from axios, which is the response body
    // Backend returns: { success: true, summary: {...} }
    if (response.success) {
      // Check if summary is directly in response (most likely)
      if ((response as any).summary) {
        return (response as any).summary;
      }

      // Check if summary is in response.data
      if (
        response.data &&
        typeof response.data === 'object' &&
        'sessions' in (response.data as any)
      ) {
        return response.data as WeeklyProgressSummary;
      }
    }

    console.error(
      '[BehavioralService] getWeeklyProgressSummary: Unexpected response format',
      response
    );
    throw new Error('Failed to fetch progress summary');
  }

  // ============ MVP: Motivational Nudges ============

  /**
   * Get motivational nudges (AI-generated or template-based)
   */
  async getMotivationalNudges(max?: number): Promise<string[]> {
    const queryParams = max ? `?max=${max}` : '';
    const response = await apiService.get<ApiResponse<string[]>>(
      `${this.BASE_PATH}/nudges${queryParams}`
    );

    // apiService.get returns response.data from axios, which is the response body
    // Backend returns: { success: true, nudges: [...] }
    if (response.success) {
      // Check if nudges are directly in response (most likely)
      if ((response as any).nudges && Array.isArray((response as any).nudges)) {
        return (response as any).nudges;
      }

      // Check if nudges are in response.data
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Check if nudges are in response.data.nudges
      if ((response.data as any)?.nudges && Array.isArray((response.data as any).nudges)) {
        return (response.data as any).nudges;
      }
    }

    console.warn('[BehavioralService] getMotivationalNudges: Unexpected response format', response);
    return [];
  }

  // ============ MVP: Reflection Prompts ============

  /**
   * Get reflection prompts for post-session
   */
  async getReflectionPrompts(context?: {
    subject?: string;
    duration?: number;
    quizCompleted?: boolean;
    score?: number;
  }): Promise<string[]> {
    const params = new URLSearchParams();
    if (context?.subject) params.append('subject', context.subject);
    if (context?.duration) params.append('duration', context.duration.toString());
    if (context?.quizCompleted !== undefined)
      params.append('quizCompleted', context.quizCompleted.toString());
    if (context?.score) params.append('score', context.score.toString());

    const queryString = params.toString();
    const response = await apiService.get<ApiResponse<string[]>>(
      `${this.BASE_PATH}/reflection-prompts${queryString ? `?${queryString}` : ''}`
    );

    // apiService.get returns response.data from axios, which is the response body
    // Backend returns: { success: true, prompts: [...] }
    // The response is already the body, so we check response.prompts directly
    if (response.success) {
      // Check if prompts are directly in response (most likely)
      if ((response as any).prompts && Array.isArray((response as any).prompts)) {
        return (response as any).prompts;
      }

      // Check if prompts are in response.data
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      // Check if prompts are in response.data.prompts
      if ((response.data as any)?.prompts && Array.isArray((response.data as any).prompts)) {
        return (response.data as any).prompts;
      }
    }

    console.warn('[BehavioralService] getReflectionPrompts: Unexpected response format', response);
    return [];
  }

  // ============ Legacy Methods (kept for backward compatibility) ============

  async trackEvent(data: any): Promise<any> {
    // Map old event types to new engagement tracking
    const eventTypeMap: Record<
      string,
      'login' | 'session_start' | 'session_end' | 'quiz_start' | 'quiz_complete'
    > = {
      page_view: 'login',
      session_join: 'session_start',
      session_leave: 'session_end',
      quiz_start: 'quiz_start',
      quiz_complete: 'quiz_complete',
    };

    const mappedType = eventTypeMap[data.eventType] || 'login';

    return this.trackEngagement({
      eventType: mappedType,
      sessionId: data.sessionId,
      duration: data.duration,
      metadata: data.metadata || {},
    });
  }

  async getMotivationalPrompts(
    maxPrompts?: number
  ): Promise<Array<{ message: string; icon: string; priority: number }>> {
    const nudges = await this.getMotivationalNudges(maxPrompts);
    return nudges.map((nudge, index) => ({
      message: nudge,
      icon: ['🔥', '💪', '🎯', '🌟', '🚀'][index] || '✨',
      priority: 3,
    }));
  }

  /**
   * Get consistency score for dashboard
   */
  async getConsistencyScore(
    days: number = 30
  ): Promise<{ consistencyScore: number; streak: number }> {
    try {
      const response = await apiService.get<{
        success: boolean;
        consistencyScore: number;
        streak: number;
        period: string;
      }>(`${this.BASE_PATH}/insights/consistency-score?days=${days}`);

      console.log('[BehavioralService] getConsistencyScore response', { response });

      // Handle both wrapped and direct response formats
      let consistencyScore = 0;
      let streak = 0;

      if (response.success) {
        // Check if data is at root level
        if ('consistencyScore' in response) {
          consistencyScore = response.consistencyScore || 0;
          streak = response.streak || 0;
        }
        // Check if data is in response.data
        else if (response.data && typeof response.data === 'object') {
          consistencyScore = (response.data as any).consistencyScore || 0;
          streak = (response.data as any).streak || 0;
        }
      } else if ('consistencyScore' in response) {
        // Direct format without success field
        consistencyScore = (response as any).consistencyScore || 0;
        streak = (response as any).streak || 0;
      }

      console.log('[BehavioralService] getConsistencyScore result', { consistencyScore, streak });
      return { consistencyScore, streak };
    } catch (error) {
      console.error('[BehavioralService] getConsistencyScore error', error);
      return { consistencyScore: 0, streak: 0 };
    }
  }
}

export const behavioralService = new BehavioralService();
export default behavioralService;
