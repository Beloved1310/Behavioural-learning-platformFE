import { create } from 'zustand';
import {
  sessionService,
  Session,
  SessionStats,
  SessionFilters,
  CreateSessionRequest,
} from '../services/sessionService';
import {
  tutorService,
  Tutor,
  TutorSearchFilters,
  BookSessionRequest,
  AvailableSlot,
} from '../services/tutorService';

interface SessionState {
  // Session data
  sessions: Session[];
  stats: SessionStats | null;
  selectedSession: Session | null;
  sessionsPagination: any | null;

  // Tutor data
  tutors: Tutor[];
  selectedTutor: Tutor | null;
  tutorAvailability: AvailableSlot[];

  // UI state
  isLoading: boolean;
  error: string | null;
}

interface SessionStore extends SessionState {
  // Session management
  loadSessions: (filters?: SessionFilters) => Promise<void>;
  loadSessionStats: () => Promise<void>;
  getSessionById: (sessionId: string) => Promise<void>;
  createSession: (data: CreateSessionRequest) => Promise<Session>;
  updateSession: (sessionId: string, data: Partial<CreateSessionRequest>) => Promise<Session>;
  deleteSession: (sessionId: string) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: Session['status']) => Promise<void>;

  // Tutor management
  searchTutors: (filters?: TutorSearchFilters) => Promise<void>;
  getTutorById: (tutorId: string) => Promise<void>;
  getTutorAvailability: (tutorId: string, date: string, duration?: number) => Promise<void>;
  bookSession: (data: BookSessionRequest) => Promise<void>;

  // UI helpers
  setSelectedSession: (session: Session | null) => void;
  setSelectedTutor: (tutor: Tutor | null) => void;
  clearError: () => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  // Initial state
  sessions: [],
  stats: null,
  selectedSession: null,
  sessionsPagination: null,
  tutors: [],
  selectedTutor: null,
  tutorAvailability: [],
  isLoading: false,
  error: null,

  // Session management
  loadSessions: async (filters?: SessionFilters) => {
    // Check if token exists before making API call
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({
        isLoading: false,
        error: 'Authentication required. Please log in again.',
      });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const result = await sessionService.getSessions(filters);
      const sessions = result.sessions || [];

      // Deduplicate sessions - remove duplicates based on title, startTime, and duration
      // Keep the first occurrence (usually the one with PENDING status if applicable)
      const seen = new Set<string>();
      const deduplicatedSessions = sessions.filter((session) => {
        // Create a unique key based on title, startTime, duration, and tutorId
        const key = `${session.title}-${session.startTime}-${session.duration}-${session.tutor?.id || 'no-tutor'}`;
        if (seen.has(key)) {
          return false; // Duplicate, skip it
        }
        seen.add(key);
        return true; // First occurrence, keep it
      });

      set({
        sessions: deduplicatedSessions,
        isLoading: false,
        sessionsPagination: result.pagination,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load sessions',
      });
    }
  },

  loadSessionStats: async () => {
    set({ isLoading: true, error: null });

    try {
      const stats = await sessionService.getSessionStats();
      set({ stats, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load session statistics',
      });
    }
  },

  getSessionById: async (sessionId: string) => {
    set({ isLoading: true, error: null, selectedSession: null });

    try {
      const session = await sessionService.getSessionById(sessionId);
      set({ selectedSession: session, isLoading: false, error: null });
    } catch (error) {
      set({
        isLoading: false,
        selectedSession: null,
        error: error instanceof Error ? error.message : 'Failed to load session',
      });
      throw error; // Re-throw so component can handle it
    }
  },

  createSession: async (data: CreateSessionRequest) => {
    set({ isLoading: true, error: null });

    try {
      const newSession = await sessionService.createSession(data);

      // Add to local state
      const { sessions } = get();
      set({
        sessions: [newSession, ...sessions],
        isLoading: false,
      });

      // Reload stats
      await get().loadSessionStats();

      return newSession;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to create session',
      });
      throw error;
    }
  },

  updateSession: async (sessionId: string, data: Partial<CreateSessionRequest>) => {
    set({ isLoading: true, error: null });

    try {
      const updatedSession = await sessionService.updateSession(sessionId, data);

      // Update local state
      const { sessions } = get();
      set({
        sessions: sessions.map((session) => (session.id === sessionId ? updatedSession : session)),
        selectedSession:
          get().selectedSession?.id === sessionId ? updatedSession : get().selectedSession,
        isLoading: false,
      });

      return updatedSession;
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update session',
      });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ isLoading: true, error: null });

    try {
      await sessionService.deleteSession(sessionId);

      // Remove from local state
      const { sessions } = get();
      set({
        sessions: sessions.filter((session) => session.id !== sessionId),
        selectedSession: get().selectedSession?.id === sessionId ? null : get().selectedSession,
        isLoading: false,
      });

      // Reload stats
      await get().loadSessionStats();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to delete session',
      });
      throw error;
    }
  },

  updateSessionStatus: async (sessionId: string, status: Session['status']) => {
    set({ isLoading: true, error: null });

    try {
      const updatedSession = await sessionService.updateSessionStatus(sessionId, status);

      // Update local state
      const { sessions } = get();
      set({
        sessions: sessions.map((session) => (session.id === sessionId ? updatedSession : session)),
        selectedSession:
          get().selectedSession?.id === sessionId ? updatedSession : get().selectedSession,
        isLoading: false,
      });

      // Reload stats
      await get().loadSessionStats();
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to update session status',
      });
      throw error;
    }
  },

  // Tutor management
  searchTutors: async (filters?: TutorSearchFilters) => {
    set({ isLoading: true, error: null });

    try {
      const tutors = await tutorService.searchTutors(filters);
      set({ tutors, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to search tutors',
      });
    }
  },

  getTutorById: async (tutorId: string) => {
    set({ isLoading: true, error: null });

    try {
      const tutor = await tutorService.getTutorById(tutorId);
      set({ selectedTutor: tutor, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load tutor',
      });
    }
  },

  getTutorAvailability: async (tutorId: string, date: string, duration?: number) => {
    set({ isLoading: true, error: null });

    try {
      const availability = await tutorService.getTutorAvailability(tutorId, { date, duration });
      set({ tutorAvailability: availability, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load tutor availability',
      });
    }
  },

  bookSession: async (data: BookSessionRequest) => {
    set({ isLoading: true, error: null });

    try {
      await tutorService.bookSession(data);

      // Reload sessions after booking
      await get().loadSessions();
      await get().loadSessionStats();

      set({ isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to book session',
      });
      throw error;
    }
  },

  // UI helpers
  setSelectedSession: (session: Session | null) => {
    set({ selectedSession: session });
  },

  setSelectedTutor: (tutor: Tutor | null) => {
    set({ selectedTutor: tutor });
  },

  clearError: () => {
    set({ error: null });
  },
}));
