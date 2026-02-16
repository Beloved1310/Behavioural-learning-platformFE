import { apiService } from './api';
import { Quiz, QuizAttempt, QuizAnswer, GameBadge, LeaderboardEntry, UserProgress } from '../types';

interface UserProfile {
  totalPoints: number;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  badges: Array<{
    id: string;
    userId: string;
    badgeId: string;
    badge: GameBadge;
    earnedAt: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    pointsEarned: number;
    unlockedAt: string;
    category: 'milestone' | 'improvement' | 'consistency' | 'mastery';
  }>;
  streak: {
    id: string;
    userId: string;
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: string;
    streakStartDate: string;
    isActive: boolean;
  };
  rank: number;
}

interface QuizFilters {
  subject?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}

interface SubmitQuizAttemptRequest {
  quizId: string;
  answers: QuizAnswer[]; // Will be converted to Record<string, string> before sending
  timeSpent: number;
}

interface LeaderboardFilters {
  timeframe?: 'week' | 'month' | 'all';
  limit?: number;
}

class GamificationService {
  private readonly BASE_PATH = '/v1/api/gamification';

  /**
   * Map common subject abbreviations to full subject names expected by backend
   */
  private normalizeSubject(subject: string | undefined): string | undefined {
    if (!subject) return undefined;

    const subjectMap: Record<string, string> = {
      'Math': 'Mathematics',
      'math': 'Mathematics',
      'MATH': 'Mathematics',
      'English': 'English',
      'Science': 'Science',
      'Physics': 'Physics',
      'Chemistry': 'Chemistry',
      'Biology': 'Biology',
      'History': 'History',
      'Geography': 'Geography',
      'Computer Science': 'Computer Science',
      'CS': 'Computer Science',
      'cs': 'Computer Science',
      'Art': 'Art',
      'Music': 'Music',
      'Spanish': 'Spanish',
      'French': 'French',
      'German': 'German',
    };

    return subjectMap[subject] || subject;
  }

  /**
   * Create a new quiz
   * POST /v1/api/gamification/quizzes
   * Returns: { quiz: Quiz }
   */
  async createQuiz(data: {
    title: string;
    subject: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    timeLimit?: number;
    passingScore: number;
    points: number;
    isActive?: boolean;
    questions: Array<{
      type: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation?: string;
      points: number;
      order: number;
    }>;
  }): Promise<Quiz> {
    try {
      const response = await apiService.post<{ quiz: Quiz }>(`${this.BASE_PATH}/quizzes`, data);

      console.log('[GamificationService] createQuiz response:', JSON.stringify(response, null, 2));

      // Backend returns { quiz: {...} } directly
      // apiService.post returns response.data from axios, which is the response body
      // So if backend returns { quiz: {...} }, response will be { quiz: {...} }

      const responseData = response as any;
      let quiz: Quiz | null = null;

      // Check if quiz is directly in response (most common case - backend returns { quiz: {...} })
      if (responseData.quiz && typeof responseData.quiz === 'object') {
        quiz = responseData.quiz;
      }
      // Check if wrapped in ApiResponse.data structure
      else if (response.data && typeof response.data === 'object') {
        if ((response.data as any).quiz) {
          quiz = (response.data as any).quiz;
        }
        // Or if data is the quiz itself
        else if ((response.data as any).id && (response.data as any).title) {
          quiz = response.data as any;
        }
      }
      // Check if response itself is the quiz (fallback)
      else if (responseData.id && responseData.title && responseData.subject) {
        quiz = responseData;
      }

      if (!quiz) {
        console.error('[GamificationService] Quiz not found in response. Response structure:', {
          hasQuiz: 'quiz' in responseData,
          hasData: 'data' in response,
          responseKeys: Object.keys(responseData || {}),
          responseType: typeof response,
          response: response,
        });
        throw new Error('Failed to create quiz: No data in response');
      }

      return quiz;
    } catch (error: any) {
      console.error('[GamificationService] createQuiz error:', error);

      // Extract error message from various possible structures
      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create quiz. Please try again.';

      throw new Error(errorMessage);
    }
  }

  /**
   * Get all quizzes with optional filters
   * GET /v1/api/gamification/quizzes
   * Returns: { quizzes: Quiz[] }
   */
  async getQuizzes(filters?: QuizFilters): Promise<{ quizzes: Quiz[]; pagination?: any }> {
    console.log('[GamificationService] getQuizzes called', { filters });
    const params = new URLSearchParams();

    // Normalize subject name before sending to backend
    const normalizedSubject = this.normalizeSubject(filters?.subject);
    if (normalizedSubject) params.append('subject', normalizedSubject);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = `${this.BASE_PATH}/quizzes${queryString ? `?${queryString}` : ''}`;
    console.log('[GamificationService] Request URL:', url);

    try {
      const response = await apiService.get<{ quizzes: any[] }>(url);
      console.log(
        '[GamificationService] getQuizzes raw response:',
        JSON.stringify(response, null, 2)
      );
      console.log('[GamificationService] response type:', typeof response);
      console.log('[GamificationService] response keys:', Object.keys(response || {}));
      console.log('[GamificationService] response.data:', response.data);
      console.log('[GamificationService] response.data?.quizzes:', response.data?.quizzes);
      console.log('[GamificationService] response.quizzes:', (response as any).quizzes);

      // Backend returns { quizzes: [...] } directly via res.json({ quizzes })
      // apiService.get returns ApiResponse<T> which is response.data from axios
      // Since backend returns { quizzes: [...] }, response.data should be { quizzes: [...] }
      // But ApiResponse has structure { success, data?, error? }, so check both

      let rawQuizzes: any[] = [];

      // The response from apiService.get is already response.data from axios
      // So if backend returns { quizzes: [...] }, then response should be { quizzes: [...] }
      // But if wrapped in ApiResponse, it might be { success: true, data: { quizzes: [...] } }

      // Check direct structure first (backend returns { quizzes } directly)
      if ('quizzes' in response && Array.isArray((response as any).quizzes)) {
        rawQuizzes = (response as any).quizzes;
        console.log(
          '[GamificationService] Found quizzes in response.quizzes (direct):',
          rawQuizzes.length
        );
      }
      // Check if wrapped in data field
      else if (response.data && typeof response.data === 'object') {
        if ('quizzes' in response.data && Array.isArray((response.data as any).quizzes)) {
          rawQuizzes = (response.data as any).quizzes;
          console.log(
            '[GamificationService] Found quizzes in response.data.quizzes:',
            rawQuizzes.length
          );
        } else if (
          'data' in response.data &&
          typeof (response.data as any).data === 'object' &&
          'quizzes' in (response.data as any).data
        ) {
          rawQuizzes = (response.data as any).data.quizzes;
          console.log(
            '[GamificationService] Found quizzes in response.data.data.quizzes:',
            rawQuizzes.length
          );
        }
      }

      if (rawQuizzes.length === 0) {
        console.error('[GamificationService] Could not find quizzes in response!');
        console.error('[GamificationService] Response structure:', {
          hasQuizzes: 'quizzes' in response,
          hasData: 'data' in response,
          responseKeys: Object.keys(response || {}),
          responseType: typeof response,
          responseData: response.data,
          responseDataKeys: response.data ? Object.keys(response.data) : [],
        });
      }
      console.log('[GamificationService] rawQuizzes array:', rawQuizzes);
      console.log('[GamificationService] rawQuizzes length:', rawQuizzes.length);

      if (rawQuizzes.length === 0) {
        console.warn('[GamificationService] No quizzes in response!');
        return { quizzes: [] };
      }

      // Transform API response to match Quiz type
      const quizzes: Quiz[] = rawQuizzes.map((q: any, index: number) => {
        console.log(`[GamificationService] Transforming quiz ${index}:`, q);
        return {
          id: q.id,
          title: q.title || 'Untitled Quiz',
          description: q.description || '',
          subject: q.subject || 'Unknown',
          difficulty: q.difficulty || 'easy',
          questions: q.questions || [], // Will be loaded when quiz is started
          timeLimit: q.timeLimit,
          pointsReward: q.totalPoints || q.points || 0,
          badgeReward: q.badgeReward,
          completionCount: q.completionCount || 0,
          averageScore: q.averageScore || 0,
          createdAt: q.createdAt || new Date().toISOString(),
          createdBy: q.createdBy || '',
          isActive: q.isActive !== false,
          tags: q.tags || [],
        };
      });

      console.log('[GamificationService] Transformed quizzes count:', quizzes.length);
      console.log(
        '[GamificationService] First transformed quiz:',
        JSON.stringify(quizzes[0], null, 2)
      );
      console.log(
        '[GamificationService] All quiz subjects:',
        quizzes.map((q) => q.subject)
      );

      // Handle paginated response
      if (response && response.success && response.pagination) {
        return {
          quizzes,
          pagination: response.pagination,
        };
      }

      // Fallback for non-paginated responses
      return { quizzes };
    } catch (error) {
      console.error('[GamificationService] getQuizzes error:', error);
      throw error;
    }
  }

  /**
   * Get a specific quiz by ID for starting
   * GET /v1/api/gamification/quizzes/:id
   * Returns: { quiz: Quiz }
   */
  async getQuizById(quizId: string): Promise<Quiz> {
    console.log('[GamificationService] getQuizById called with quizId:', quizId);
    const response = await apiService.get<{ quiz: any }>(`${this.BASE_PATH}/quizzes/${quizId}`);
    console.log(
      '[GamificationService] getQuizById raw response:',
      JSON.stringify(response, null, 2)
    );

    // Backend returns { quiz: {...} } directly
    // Check multiple possible structures
    let rawQuiz: any = null;

    // Check direct structure first
    if ('quiz' in response && response.quiz) {
      rawQuiz = (response as any).quiz;
      console.log('[GamificationService] Found quiz in response.quiz');
    }
    // Check if wrapped in data field
    else if (response.data && typeof response.data === 'object') {
      if ('quiz' in response.data && response.data.quiz) {
        rawQuiz = (response.data as any).quiz;
        console.log('[GamificationService] Found quiz in response.data.quiz');
      } else if (
        'data' in response.data &&
        typeof (response.data as any).data === 'object' &&
        'quiz' in (response.data as any).data
      ) {
        rawQuiz = (response.data as any).data.quiz;
        console.log('[GamificationService] Found quiz in response.data.data.quiz');
      }
    }

    if (!rawQuiz) {
      console.error('[GamificationService] Quiz not found in response:', response);
      throw new Error('Quiz not found');
    }

    console.log('[GamificationService] Raw quiz data:', rawQuiz);

    // Transform to match Quiz type
    const quiz: Quiz = {
      id: rawQuiz.id || rawQuiz._id?.toString() || quizId,
      title: rawQuiz.title || 'Untitled Quiz',
      description: rawQuiz.description || '',
      subject: rawQuiz.subject || 'Unknown',
      difficulty: rawQuiz.difficulty || 'easy',
      questions: (rawQuiz.questions || []).map((q: any) => ({
        id: q.id || q._id?.toString() || '',
        type: q.type || 'multiple_choice',
        question: q.question || '',
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || '',
        points: q.points || 1,
        imageUrl: q.imageUrl,
      })),
      timeLimit: rawQuiz.timeLimit,
      pointsReward: rawQuiz.totalPoints || rawQuiz.points || 0,
      badgeReward: rawQuiz.badgeReward,
      completionCount: rawQuiz.completionCount || 0,
      averageScore: rawQuiz.averageScore || 0,
      createdAt: rawQuiz.createdAt || new Date().toISOString(),
      createdBy: rawQuiz.createdBy || '',
      isActive: rawQuiz.isActive !== false,
      tags: rawQuiz.tags || [],
    };

    console.log('[GamificationService] Transformed quiz:', quiz);
    console.log('[GamificationService] Quiz questions count:', quiz.questions.length);

    if (quiz.questions.length === 0) {
      console.warn('[GamificationService] Quiz has no questions!');
    }

    return quiz;
  }

  /**
   * Submit a quiz attempt
   * POST /v1/api/gamification/quiz-attempts
   * Body: { quizId: string, answers: Record<string, string>, timeSpent: number }
   * Returns: { attempt: QuizAttempt, newBadges: Badge[], pointsEarned: number }
   */
  async submitQuizAttempt(data: SubmitQuizAttemptRequest): Promise<QuizAttempt> {
    // Convert QuizAnswer[] to Record<string, string> format expected by backend
    const answersRecord: Record<string, string> = {};
    data.answers.forEach((answer) => {
      answersRecord[answer.questionId] = String(answer.userAnswer);
    });

    console.log('[GamificationService] Submitting quiz attempt:', {
      quizId: data.quizId,
      answersCount: data.answers.length,
      answersRecord,
      timeSpent: data.timeSpent,
      answerDetails: data.answers.map((a) => ({
        questionId: a.questionId,
        userAnswer: a.userAnswer,
        isCorrect: a.isCorrect,
        pointsEarned: a.pointsEarned,
      })),
    });

    const response = await apiService.post<{
      attempt: QuizAttempt;
      newBadges: GameBadge[];
      pointsEarned: number;
    }>(`${this.BASE_PATH}/quiz-attempts`, {
      quizId: data.quizId,
      answers: answersRecord,
      timeSpent: data.timeSpent,
    });

    console.log('[GamificationService] Quiz attempt response:', response);

    // Backend returns { attempt: {...}, newBadges: [], pointsEarned: number } directly
    // apiService.post returns ApiResponse<T> which is response.data from axios
    // Since backend returns the object directly (not wrapped), response should be { attempt: {...}, newBadges: [], pointsEarned: number }
    // But ApiResponse<T> has structure { success: boolean, data?: T, ... }
    // So we need to check both response.attempt (direct) and response.data.attempt (wrapped)

    let attempt: QuizAttempt | null = null;

    // Check direct structure first (if backend response is not wrapped in ApiResponse)
    if ('attempt' in response && (response as any).attempt) {
      attempt = (response as any).attempt;
    }
    // Check if wrapped in ApiResponse.data
    else if (response.data && typeof response.data === 'object') {
      if ('attempt' in response.data && (response.data as any).attempt) {
        attempt = (response.data as any).attempt;
      }
    }

    if (!attempt) {
      console.error('[GamificationService] Attempt not found in response. Response structure:', {
        hasAttempt: 'attempt' in response,
        hasData: 'data' in response,
        responseKeys: Object.keys(response || {}),
        response: response,
      });
      throw new Error('Failed to submit quiz attempt - no attempt data in response');
    }

    // Extract newBadges from response
    let newBadges: any[] = [];
    if ('newBadges' in response && Array.isArray((response as any).newBadges)) {
      newBadges = (response as any).newBadges;
    } else if (response.data && typeof response.data === 'object' && 'newBadges' in response.data) {
      newBadges = (response.data as any).newBadges || [];
    }

    console.log('[GamificationService] New badges earned:', newBadges);

    // Return attempt with newBadges attached
    return { ...attempt, newBadges } as any;
  }

  /**
   * Get recent quiz attempts
   * GET /v1/api/gamification/quiz-attempts/recent?limit=10
   * Returns: { attempts: QuizAttempt[] }
   */
  async getRecentAttempts(limit?: number): Promise<QuizAttempt[]> {
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await apiService.get<{ attempts: QuizAttempt[] }>(
        `${this.BASE_PATH}/quiz-attempts/recent${params}`
      );

      // Backend returns { attempts: [...] } directly
      // Check both direct structure and wrapped structure
      let attempts: QuizAttempt[] = [];

      if ('attempts' in response && Array.isArray((response as any).attempts)) {
        attempts = (response as any).attempts;
      } else if (
        response.data &&
        typeof response.data === 'object' &&
        'attempts' in response.data
      ) {
        attempts = (response.data as any).attempts || [];
      }

      return Array.isArray(attempts) ? attempts : [];
    } catch (error) {
      console.error('[GamificationService] getRecentAttempts error:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  /**
   * Get user gamification profile
   * GET /v1/api/gamification/profile
   * Returns: { profile: UserProfile }
   */
  async getUserProfile(): Promise<UserProfile> {
    console.log('[GamificationService] getUserProfile called');
    const url = `${this.BASE_PATH}/profile`;
    console.log('[GamificationService] Request URL:', url);

    try {
      const response = await apiService.get<{ profile: UserProfile }>(url);
      console.log('[GamificationService] getUserProfile response:', response);

      // Backend returns { profile: {...} } directly
      // apiService.get returns ApiResponse<T> which is response.data from axios
      // Check both direct structure and wrapped structure
      let profile: UserProfile | null = null;

      // Check direct structure first (backend returns { profile: {...} } directly)
      if ('profile' in response && (response as any).profile) {
        profile = (response as any).profile;
        console.log('[GamificationService] Found profile in response.profile');
      }
      // Check if wrapped in ApiResponse.data
      else if (response.data && typeof response.data === 'object') {
        if ('profile' in response.data && (response.data as any).profile) {
          profile = (response.data as any).profile;
          console.log('[GamificationService] Found profile in response.data.profile');
        }
      }

      if (!profile) {
        console.error('[GamificationService] Profile not found in response. Response structure:', {
          hasProfile: 'profile' in response,
          hasData: 'data' in response,
          responseKeys: Object.keys(response || {}),
          response: response,
        });
        throw new Error('Failed to load user profile - no profile data in response');
      }

      console.log('[GamificationService] Returning profile:', profile);
      return profile;
    } catch (error) {
      console.error('[GamificationService] getUserProfile error:', error);
      throw error;
    }
  }

  /**
   * Get subject-specific progress
   * GET /v1/api/gamification/progress?subject=Math
   * Returns: { progress: UserProgress[] }
   */
  async getProgress(subject?: string): Promise<UserProgress[]> {
    console.log('[GamificationService] getProgress called', { subject });
    const params = subject ? `?subject=${subject}` : '';
    const url = `${this.BASE_PATH}/progress${params}`;
    console.log('[GamificationService] Request URL:', url);

    try {
      const response = await apiService.get<{ progress: UserProgress[] }>(url);
      console.log('[GamificationService] getProgress response:', response);

      // Backend returns { success: true, data: [...] } where data is the progress array
      // Check multiple possible response formats
      let progress: UserProgress[] = [];

      // Check if response.data is an array directly (backend format)
      if (response.data && Array.isArray(response.data)) {
        progress = response.data;
        console.log('[GamificationService] Found progress in response.data (array)');
      }
      // Check if response has progress property
      else if ('progress' in response && Array.isArray((response as any).progress)) {
        progress = (response as any).progress;
        console.log('[GamificationService] Found progress in response.progress');
      }
      // Check if response.data.progress exists
      else if (
        response.data &&
        typeof response.data === 'object' &&
        'progress' in response.data &&
        Array.isArray((response.data as any).progress)
      ) {
        progress = (response.data as any).progress || [];
        console.log('[GamificationService] Found progress in response.data.progress');
      }
      // Check if response is an array directly
      else if (Array.isArray(response)) {
        progress = response;
        console.log('[GamificationService] Response is array directly');
      }

      console.log('[GamificationService] Returning progress:', progress.length, progress);
      return Array.isArray(progress) ? progress : [];
    } catch (error) {
      console.error('[GamificationService] getProgress error:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  /**
   * Get available badges
   * GET /v1/api/gamification/badges
   * Returns: { badges: GameBadge[] }
   */
  async getBadges(): Promise<GameBadge[]> {
    console.log('[GamificationService] getBadges called');
    const url = `${this.BASE_PATH}/badges`;
    console.log('[GamificationService] Request URL:', url);

    try {
      const response = await apiService.get<{ badges: GameBadge[] }>(url);
      console.log('[GamificationService] getBadges response:', response);

      // Backend returns { badges: [...] } directly
      // Check both direct structure and wrapped structure
      let badges: GameBadge[] = [];

      if ('badges' in response && Array.isArray((response as any).badges)) {
        badges = (response as any).badges;
        console.log('[GamificationService] Found badges in response.badges');
      } else if (response.data && typeof response.data === 'object' && 'badges' in response.data) {
        badges = (response.data as any).badges || [];
        console.log('[GamificationService] Found badges in response.data.badges');
      }

      console.log('[GamificationService] Returning badges:', badges.length);
      return Array.isArray(badges) ? badges : [];
    } catch (error) {
      console.error('[GamificationService] getBadges error:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }

  /**
   * Get global leaderboard
   * GET /v1/api/gamification/leaderboard?timeframe=all&limit=10
   * Returns: LeaderboardEntry[] (direct array, not wrapped)
   */
  async getLeaderboard(filters?: LeaderboardFilters): Promise<LeaderboardEntry[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.timeframe) params.append('timeframe', filters.timeframe);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `${this.BASE_PATH}/leaderboard${queryString ? `?${queryString}` : ''}`;

      const response = await apiService.get<LeaderboardEntry[]>(url);

      // Backend returns array directly, but apiService.get might wrap it
      let leaderboard: LeaderboardEntry[] = [];

      if (Array.isArray(response)) {
        leaderboard = response;
      } else if (response.data && Array.isArray(response.data)) {
        leaderboard = response.data;
      }

      return Array.isArray(leaderboard) ? leaderboard : [];
    } catch (error) {
      console.error('[GamificationService] getLeaderboard error:', error);
      // Return empty array instead of throwing to prevent crashes
      return [];
    }
  }
}

export const gamificationService = new GamificationService();
export default gamificationService;
