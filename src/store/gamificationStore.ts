import { create } from 'zustand';
import { GamificationState, Quiz, QuizAttempt, UserBadge, QuizAnswer } from '../types';
import { gamificationService } from '../services/gamificationService';
import { logger } from '../utils/logger';

interface GamificationStore extends GamificationState {
  // Pagination state
  quizzesPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;

  // Quiz management
  loadQuizzes: (
    subject?: string,
    difficulty?: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  startQuiz: (quizId: string) => Promise<Quiz>;
  submitQuizAttempt: (
    quizId: string,
    answers: QuizAnswer[],
    timeSpent: number
  ) => Promise<QuizAttempt>;

  // Badge system
  loadUserBadges: () => Promise<void>;
  loadAvailableBadges: () => Promise<void>;
  checkBadgeEligibility: (userId: string) => Promise<UserBadge[]>;

  // Leaderboard
  loadLeaderboard: (timeframe?: 'week' | 'month' | 'all') => Promise<void>;

  // Progress tracking
  loadUserProgress: () => Promise<void>;
  updateStudyStreak: () => Promise<void>;
  addXP: (amount: number, subject?: string) => Promise<void>;

  // User profile
  loadUserProfile: () => Promise<void>;

  // Utility functions
  clearError: () => void;
  calculateLevel: (totalXP: number) => { level: number; currentXP: number; nextLevelXP: number };
}

export const useGamificationStore = create<GamificationStore>((set, get) => ({
  userProfile: null,
  availableQuizzes: [],
  recentAttempts: [],
  leaderboard: [],
  availableBadges: [],
  subjectProgress: [],
  isLoading: false,
  error: null,
  quizzesPagination: null,

  loadQuizzes: async (subject?: string, difficulty?: string, page?: number, limit?: number) => {
    logger.debug('Loading quizzes', { subject, difficulty, page, limit });
    set({ isLoading: true, error: null });

    try {
      const result = await gamificationService.getQuizzes({ subject, difficulty, page, limit });
      const quizzes = Array.isArray(result?.quizzes) ? result.quizzes : [];
      logger.debug('Quizzes loaded', { count: quizzes.length });
      set({
        availableQuizzes: quizzes,
        quizzesPagination: result?.pagination || null,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Error loading quizzes', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load quizzes',
        availableQuizzes: [], // Ensure it's always an array
      });
    }
  },

  startQuiz: async (quizId: string) => {
    try {
      const quiz = await gamificationService.getQuizById(quizId);
      return quiz;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to start quiz');
    }
  },

  submitQuizAttempt: async (quizId: string, answers: QuizAnswer[], timeSpent: number) => {
    set({ isLoading: true, error: null });

    try {
      const result = await gamificationService.submitQuizAttempt({
        quizId,
        answers,
        timeSpent,
      });

      // Extract attempt and newBadges from result
      const attempt = result as any;
      const newBadges = (attempt.newBadges || []) as any[];

      // Update recent attempts and reload user profile/progress to get latest badges
      await Promise.all([get().loadUserProfile(), get().loadUserProgress()]);

      // Fetch updated recent attempts
      const recentAttempts = await gamificationService.getRecentAttempts(10);
      const attemptsArray = Array.isArray(recentAttempts) ? recentAttempts : [];
      set({ recentAttempts: attemptsArray, isLoading: false });

      // Return attempt with newBadges
      return { ...attempt, newBadges };
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit quiz attempt',
      });
      throw error;
    }
  },

  loadUserBadges: async () => {
    // Badges are loaded as part of user profile
    // This method is kept for backwards compatibility
    await get().loadUserProfile();
  },

  loadAvailableBadges: async () => {
    console.log('[GamificationStore] loadAvailableBadges called');
    set({ isLoading: true, error: null });

    try {
      console.log('[GamificationStore] Calling gamificationService.getBadges...');
      const badges = await gamificationService.getBadges();
      const badgesArray = Array.isArray(badges) ? badges : [];
      console.log('[GamificationStore] Badges received:', badgesArray.length);
      set({ availableBadges: badgesArray, isLoading: false });
    } catch (error) {
      logger.error('Error loading badges', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load badges',
      });
    }
  },

  checkBadgeEligibility: async (_userId: string) => {
    // Badge eligibility is checked automatically by the backend
    // Reload the user profile to get any new badges
    await get().loadUserProfile();
    return [];
  },

  loadLeaderboard: async (timeframe = 'all') => {
    set({ isLoading: true, error: null });

    try {
      const leaderboard = await gamificationService.getLeaderboard({ timeframe });
      const leaderboardArray = Array.isArray(leaderboard) ? leaderboard : [];
      set({ leaderboard: leaderboardArray, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
        leaderboard: [], // Ensure it's always an array
      });
    }
  },

  loadUserProgress: async () => {
    logger.debug('Loading user progress');
    set({ isLoading: true, error: null });

    try {
      console.log('[GamificationStore] Calling gamificationService.getProgress...');
      const progress = await gamificationService.getProgress();
      const progressArray = Array.isArray(progress) ? progress : [];
      console.log('[GamificationStore] Progress received:', progressArray.length);
      set({ subjectProgress: progressArray, isLoading: false });
    } catch (error) {
      logger.error('Error loading user progress', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load user progress',
      });
    }
  },

  updateStudyStreak: async () => {
    // Study streak is updated automatically by the backend
    // Reload the user profile to get updated streak information
    await get().loadUserProfile();
  },

  addXP: async (_amount: number, _subject?: string) => {
    // XP is added automatically by the backend when completing activities
    // Reload user profile and progress to get updated values
    await Promise.all([get().loadUserProfile(), get().loadUserProgress()]);
  },

  loadUserProfile: async () => {
    logger.debug('Loading user profile');
    set({ isLoading: true, error: null });

    try {
      console.log('[GamificationStore] Calling gamificationService.getUserProfile...');
      const profile = await gamificationService.getUserProfile();
      console.log('[GamificationStore] User profile received:', profile);
      set({ userProfile: profile, isLoading: false });
    } catch (error) {
      logger.error('Error loading user profile', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load user profile',
      });
    }
  },

  calculateLevel: (totalXP: number) => {
    // Level calculation: Each level requires more XP (exponential growth)
    const baseXP = 100;
    let level = 1;
    let xpForCurrentLevel = 0;
    let xpForNextLevel = baseXP;

    while (totalXP >= xpForNextLevel) {
      xpForCurrentLevel = xpForNextLevel;
      level++;
      xpForNextLevel = Math.floor(baseXP * Math.pow(1.5, level - 1));
    }

    const currentXP = totalXP - xpForCurrentLevel;
    const nextLevelXP = xpForNextLevel - xpForCurrentLevel;

    return { level, currentXP, nextLevelXP };
  },

  clearError: () => set({ error: null }),
}));
