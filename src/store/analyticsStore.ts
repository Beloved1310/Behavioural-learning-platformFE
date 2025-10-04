import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  AnalyticsState,
  StudentProgressReport,
  TutorPerformanceAnalytics,
  PlatformUsageMetrics,
  ParentalDashboard,
  ExportOptions,
  ExportResult
} from '../types';
import { analyticsService } from '../services/analyticsService';

interface AnalyticsActions {
  // Student Progress Reports (FR-7.1)
  fetchStudentProgressReport: (studentId: string, startDate: string, endDate: string) => Promise<void>;
  fetchAllStudentReports: (studentIds: string[]) => Promise<void>;
  clearStudentReports: () => void;

  // Tutor Performance Analytics (FR-7.2)
  fetchTutorPerformanceAnalytics: (tutorId: string, startDate: string, endDate: string) => Promise<void>;
  clearTutorAnalytics: () => void;

  // Platform Usage Metrics (FR-7.3)
  fetchPlatformUsageMetrics: (startDate: string, endDate: string) => Promise<void>;
  clearPlatformMetrics: () => void;

  // Parental Dashboard (FR-7.5)
  fetchParentalDashboard: (parentId: string) => Promise<void>;
  markAlertAsRead: (alertId: string) => void;
  clearParentalDashboard: () => void;

  // Export Functionality (FR-7.4)
  exportData: (options: ExportOptions) => Promise<ExportResult>;
  fetchExportHistory: (userId: string) => Promise<void>;
  clearExportHistory: () => void;

  // Utility functions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

const initialState: AnalyticsState = {
  studentReports: [],
  tutorAnalytics: [],
  platformMetrics: null,
  parentalDashboard: null,
  exportHistory: [],
  isLoading: false,
  error: null
};

export const useAnalyticsStore = create<AnalyticsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Student Progress Reports (FR-7.1)
      fetchStudentProgressReport: async (studentId: string, startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
          const report = await analyticsService.getStudentProgressReport(studentId, startDate, endDate);
          set(state => ({
            studentReports: [...state.studentReports.filter(r => r.studentId !== studentId), report],
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to fetch student progress report:', error);
          set({ error: 'Failed to load student progress report', isLoading: false });
        }
      },

      fetchAllStudentReports: async (studentIds: string[]) => {
        set({ isLoading: true, error: null });
        try {
          const reports = await analyticsService.getAllStudentReports(studentIds);
          set({ studentReports: reports, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch student reports:', error);
          set({ error: 'Failed to load student reports', isLoading: false });
        }
      },

      clearStudentReports: () => {
        set({ studentReports: [] });
      },

      // Tutor Performance Analytics (FR-7.2)
      fetchTutorPerformanceAnalytics: async (tutorId: string, startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
          const analytics = await analyticsService.getTutorPerformanceAnalytics(tutorId, startDate, endDate);
          set(state => ({
            tutorAnalytics: [...state.tutorAnalytics.filter(t => t.tutorId !== tutorId), analytics],
            isLoading: false
          }));
        } catch (error) {
          console.error('Failed to fetch tutor analytics:', error);
          set({ error: 'Failed to load tutor performance analytics', isLoading: false });
        }
      },

      clearTutorAnalytics: () => {
        set({ tutorAnalytics: [] });
      },

      // Platform Usage Metrics (FR-7.3)
      fetchPlatformUsageMetrics: async (startDate: string, endDate: string) => {
        set({ isLoading: true, error: null });
        try {
          const metrics = await analyticsService.getPlatformUsageMetrics(startDate, endDate);
          set({ platformMetrics: metrics, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch platform metrics:', error);
          set({ error: 'Failed to load platform usage metrics', isLoading: false });
        }
      },

      clearPlatformMetrics: () => {
        set({ platformMetrics: null });
      },

      // Parental Dashboard (FR-7.5)
      fetchParentalDashboard: async (parentId: string) => {
        set({ isLoading: true, error: null });
        try {
          const dashboard = await analyticsService.getParentalDashboard(parentId);
          set({ parentalDashboard: dashboard, isLoading: false });
        } catch (error) {
          console.error('Failed to fetch parental dashboard:', error);
          set({ error: 'Failed to load parental dashboard', isLoading: false });
        }
      },

      markAlertAsRead: (alertId: string) => {
        set(state => {
          if (!state.parentalDashboard) return state;

          return {
            parentalDashboard: {
              ...state.parentalDashboard,
              alerts: state.parentalDashboard.alerts.map(alert =>
                alert.id === alertId ? { ...alert, isRead: true } : alert
              )
            }
          };
        });
      },

      clearParentalDashboard: () => {
        set({ parentalDashboard: null });
      },

      // Export Functionality (FR-7.4)
      exportData: async (options: ExportOptions): Promise<ExportResult> => {
        set({ isLoading: true, error: null });
        try {
          const result = await analyticsService.exportData(options);

          // Add to export history
          set(state => ({
            exportHistory: [result, ...state.exportHistory],
            isLoading: false
          }));

          return result;
        } catch (error) {
          console.error('Failed to export data:', error);
          set({ error: 'Failed to export data', isLoading: false });
          throw error;
        }
      },

      fetchExportHistory: async (userId: string) => {
        try {
          const history = await analyticsService.getExportHistory(userId);
          set({ exportHistory: history });
        } catch (error) {
          console.error('Failed to fetch export history:', error);
          set({ error: 'Failed to load export history' });
        }
      },

      clearExportHistory: () => {
        set({ exportHistory: [] });
      },

      // Utility functions
      setLoading: (isLoading: boolean) => {
        set({ isLoading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      resetState: () => {
        set(initialState);
      }
    }),
    {
      name: 'analytics-store',
      partialize: (state) => ({
        exportHistory: state.exportHistory // Only persist export history
      })
    }
  )
);

// Utility hooks for specific data
export const useStudentReports = () => {
  const { studentReports, fetchStudentProgressReport, clearStudentReports } = useAnalyticsStore();
  return { studentReports, fetchStudentProgressReport, clearStudentReports };
};

export const useTutorAnalytics = () => {
  const { tutorAnalytics, fetchTutorPerformanceAnalytics, clearTutorAnalytics } = useAnalyticsStore();
  return { tutorAnalytics, fetchTutorPerformanceAnalytics, clearTutorAnalytics };
};

export const usePlatformMetrics = () => {
  const { platformMetrics, fetchPlatformUsageMetrics, clearPlatformMetrics } = useAnalyticsStore();
  return { platformMetrics, fetchPlatformUsageMetrics, clearPlatformMetrics };
};

export const useParentalDashboard = () => {
  const { parentalDashboard, fetchParentalDashboard, markAlertAsRead, clearParentalDashboard } = useAnalyticsStore();
  return { parentalDashboard, fetchParentalDashboard, markAlertAsRead, clearParentalDashboard };
};

export const useExportData = () => {
  const { exportHistory, exportData, fetchExportHistory, clearExportHistory } = useAnalyticsStore();
  return { exportHistory, exportData, fetchExportHistory, clearExportHistory };
};