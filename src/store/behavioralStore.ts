import { create } from 'zustand';
import {
  behavioralService,
  TrackEngagementRequest,
  RecordBehavioralDataRequest,
} from '../services/behavioralService';
import { WeeklyProgressSummary } from '../services/behavioralService';
import { logger } from '../utils/logger';

interface BehavioralStore {
  // MVP State
  weeklyProgressSummary: WeeklyProgressSummary | null;
  motivationalNudges: string[];
  reflectionPrompts: string[];
  isLoading: boolean;
  error: string | null;

  // MVP Actions
  trackEngagement: (data: TrackEngagementRequest) => Promise<void>;
  recordBehavioralData: (data: RecordBehavioralDataRequest) => Promise<void>;
  fetchWeeklyProgressSummary: () => Promise<void>;
  fetchMotivationalNudges: (max?: number) => Promise<void>;
  fetchReflectionPrompts: (context?: {
    subject?: string;
    duration?: number;
    quizCompleted?: boolean;
    score?: number;
  }) => Promise<void>;

  // Helper actions
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  weeklyProgressSummary: null,
  motivationalNudges: [],
  reflectionPrompts: [],
  isLoading: false,
  error: null,
};

export const useBehavioralStore = create<BehavioralStore>((set, get) => ({
  ...initialState,

  // ============ MVP: Engagement Tracking ============

  trackEngagement: async (data: TrackEngagementRequest) => {
    try {
      await behavioralService.trackEngagement(data);
      // Don't refresh progress summary immediately to avoid cascading state updates
      // Progress summary can be refreshed manually or on a schedule
    } catch (error) {
      logger.error('Failed to track engagement', error);
      // Don't show error to user for tracking failures
    }
  },

  recordBehavioralData: async (data: RecordBehavioralDataRequest) => {
    try {
      await behavioralService.recordBehavioralData(data);
      // Don't refresh progress summary immediately to avoid cascading state updates
      // Progress summary can be refreshed manually or on a schedule
    } catch (error) {
      logger.error('Failed to record behavioral data', error);
      // Don't show error to user for tracking failures
    }
  },

  // ============ MVP: Progress Summary ============

  fetchWeeklyProgressSummary: async () => {
    set({ isLoading: true, error: null });

    try {
      const summary = await behavioralService.getWeeklyProgressSummary();
      set({ weeklyProgressSummary: summary, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch progress summary',
      });
    }
  },

  // ============ MVP: Motivational Nudges ============

  fetchMotivationalNudges: async (max?: number) => {
    set({ isLoading: true, error: null });

    try {
      const nudges = await behavioralService.getMotivationalNudges(max);
      set({ motivationalNudges: nudges, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch motivational nudges',
      });
    }
  },

  // ============ MVP: Reflection Prompts ============

  fetchReflectionPrompts: async (context?: {
    subject?: string;
    duration?: number;
    quizCompleted?: boolean;
    score?: number;
  }) => {
    set({ isLoading: true, error: null });

    try {
      const prompts = await behavioralService.getReflectionPrompts(context);
      set({ reflectionPrompts: prompts, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch reflection prompts',
      });
    }
  },

  // ============ Helper Actions ============

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));
