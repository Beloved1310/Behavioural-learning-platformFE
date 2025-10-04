import { apiService } from './api';
import {
  StudentProgressReport,
  TutorPerformanceAnalytics,
  PlatformUsageMetrics,
  ParentalDashboard,
  ExportOptions,
  ExportResult,
  SubjectProgress,
  Milestone,
  TutorComment,
  Achievement,
  SubjectExpertise,
  StudentFeedback,
  PerformanceTrend,
  HourlyUsage,
  GeographicData,
  FeatureUsage,
  ChildOverview,
  ParentActivityItem,
  ParentAlert,
  MonthlyFamilyReport
} from '../types';

// Mock data generators
const generateMockMilestones = (): Milestone[] => [
  {
    id: '1',
    title: 'Basic Algebra',
    description: 'Master basic algebraic operations',
    achievedAt: '2024-12-01T10:00:00Z',
    isCompleted: true
  },
  {
    id: '2',
    title: 'Quadratic Equations',
    description: 'Solve quadratic equations using various methods',
    isCompleted: false
  },
  {
    id: '3',
    title: 'Geometry Foundations',
    description: 'Understand basic geometric principles',
    achievedAt: '2024-11-15T14:30:00Z',
    isCompleted: true
  }
];

const generateMockSubjectProgress = (): SubjectProgress[] => [
  {
    subject: 'Mathematics',
    currentLevel: 7,
    targetLevel: 10,
    progress: 70,
    hoursSpent: 45,
    averageScore: 85,
    lastActivity: '2024-12-10T16:30:00Z',
    milestones: generateMockMilestones()
  },
  {
    subject: 'Science',
    currentLevel: 6,
    targetLevel: 8,
    progress: 75,
    hoursSpent: 32,
    averageScore: 78,
    lastActivity: '2024-12-09T14:20:00Z',
    milestones: generateMockMilestones()
  },
  {
    subject: 'English',
    currentLevel: 8,
    targetLevel: 10,
    progress: 80,
    hoursSpent: 28,
    averageScore: 92,
    lastActivity: '2024-12-11T11:15:00Z',
    milestones: generateMockMilestones()
  }
];

const generateMockTutorComments = (): TutorComment[] => [
  {
    id: '1',
    tutorId: 'tutor-1',
    tutorName: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    comment: 'Excellent progress in algebraic concepts. Shows strong problem-solving skills.',
    rating: 5,
    createdAt: '2024-12-08T15:30:00Z'
  },
  {
    id: '2',
    tutorId: 'tutor-2',
    tutorName: 'Prof. Michael Chen',
    subject: 'Science',
    comment: 'Good understanding of scientific method. Needs practice with lab calculations.',
    rating: 4,
    createdAt: '2024-12-05T10:20:00Z'
  }
];

const generateMockAchievements = (): Achievement[] => [
  {
    id: '1',
    title: 'Math Wizard',
    description: 'Completed 10 consecutive math quizzes with 90%+ scores',
    icon: '🧙‍♂️',
    pointsEarned: 500,
    unlockedAt: '2024-12-01T12:00:00Z',
    category: 'mastery'
  },
  {
    id: '2',
    title: 'Study Streak Champion',
    description: 'Maintained a 15-day study streak',
    icon: '🔥',
    pointsEarned: 300,
    unlockedAt: '2024-11-28T18:00:00Z',
    category: 'consistency'
  }
];

// Mock Analytics Service
class MockAnalyticsService {
  // Simulate API delay
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Student Progress Reports (FR-7.1)
  async getStudentProgressReport(studentId: string, startDate: string, endDate: string): Promise<StudentProgressReport> {
    await this.delay(1500);

    return {
      id: `report-${studentId}-${Date.now()}`,
      studentId,
      studentName: 'Emma Thompson',
      reportPeriod: { startDate, endDate },
      overallGrade: 'A-',
      overallProgress: 78,
      subjectProgress: generateMockSubjectProgress(),
      studyHours: {
        total: 105,
        average: 3.5,
        trend: 'up'
      },
      quizPerformance: {
        totalQuizzes: 24,
        averageScore: 85,
        improvement: 12
      },
      attendanceRate: 92,
      achievements: generateMockAchievements(),
      strengths: [
        'Strong analytical thinking',
        'Excellent problem-solving approach',
        'Consistent study habits'
      ],
      areasForImprovement: [
        'Time management during tests',
        'Complex word problems',
        'Group discussion participation'
      ],
      tutorComments: generateMockTutorComments(),
      generatedAt: new Date().toISOString()
    };
  }

  async getAllStudentReports(studentIds: string[]): Promise<StudentProgressReport[]> {
    await this.delay(2000);

    return Promise.all(
      studentIds.map(id => this.getStudentProgressReport(id, '2024-11-01', '2024-12-01'))
    );
  }

  // Tutor Performance Analytics (FR-7.2)
  async getTutorPerformanceAnalytics(tutorId: string, startDate: string, endDate: string): Promise<TutorPerformanceAnalytics> {
    await this.delay(1500);

    return {
      tutorId,
      tutorName: 'Dr. Sarah Johnson',
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b9d2bf15?w=150',
      period: { startDate, endDate },
      overallRating: 4.8,
      totalStudents: 28,
      totalSessions: 156,
      totalHours: 234,
      earnings: {
        total: 7800,
        average: 50,
        trend: 'up'
      },
      subjectExpertise: [
        {
          subject: 'Mathematics',
          level: 'expert',
          studentsHelped: 18,
          averageRating: 4.9,
          sessionHours: 145
        },
        {
          subject: 'Physics',
          level: 'advanced',
          studentsHelped: 10,
          averageRating: 4.7,
          sessionHours: 89
        }
      ] as SubjectExpertise[],
      studentSatisfaction: {
        averageRating: 4.8,
        totalReviews: 45,
        ratingDistribution: [
          { rating: 5, count: 32, percentage: 71 },
          { rating: 4, count: 10, percentage: 22 },
          { rating: 3, count: 3, percentage: 7 }
        ]
      },
      sessionMetrics: {
        completionRate: 98,
        punctualityScore: 96,
        preparationScore: 94
      },
      engagement: {
        responseTime: 12,
        messagesSent: 1245,
        resourcesShared: 89
      },
      studentOutcomes: {
        averageImprovement: 23,
        successRate: 87,
        retentionRate: 92
      },
      recentFeedback: [
        {
          id: '1',
          studentName: 'Alex Chen',
          rating: 5,
          comment: 'Amazing tutor! Really helped me understand calculus.',
          subject: 'Mathematics',
          createdAt: '2024-12-08T14:30:00Z'
        },
        {
          id: '2',
          studentName: 'Maria Rodriguez',
          rating: 5,
          comment: 'Patient and knowledgeable. Highly recommend!',
          subject: 'Mathematics',
          createdAt: '2024-12-07T16:45:00Z'
        }
      ] as StudentFeedback[],
      performanceTrends: [
        { date: '2024-11-01', metric: 'rating', value: 4.6 },
        { date: '2024-11-08', metric: 'rating', value: 4.7 },
        { date: '2024-11-15', metric: 'rating', value: 4.8 },
        { date: '2024-11-22', metric: 'rating', value: 4.8 },
        { date: '2024-11-29', metric: 'rating', value: 4.9 }
      ] as PerformanceTrend[]
    };
  }

  // Platform Usage Metrics (FR-7.3)
  async getPlatformUsageMetrics(startDate: string, endDate: string): Promise<PlatformUsageMetrics> {
    await this.delay(2000);

    return {
      period: { startDate, endDate },
      userMetrics: {
        totalUsers: 1247,
        activeUsers: 892,
        newRegistrations: 156,
        userRetentionRate: 78,
        userGrowthRate: 14
      },
      sessionMetrics: {
        totalSessions: 3456,
        averageSessionDuration: 45,
        sessionCompletionRate: 87,
        peakUsageHours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          users: Math.floor(Math.random() * 200) + 50,
          sessions: Math.floor(Math.random() * 300) + 100
        })) as HourlyUsage[]
      },
      engagementMetrics: {
        dailyActiveUsers: 456,
        weeklyActiveUsers: 789,
        monthlyActiveUsers: 1123,
        averageTimeSpent: 67,
        bounceRate: 23,
        pageViews: 45670
      },
      contentMetrics: {
        quizzesCompleted: 2345,
        resourcesAccessed: 8901,
        messagesExchanged: 12456,
        documentsShared: 567
      },
      deviceMetrics: {
        desktop: 45,
        mobile: 40,
        tablet: 15
      },
      geographicDistribution: [
        { country: 'United States', users: 456, percentage: 36.6 },
        { country: 'Canada', users: 234, percentage: 18.8 },
        { country: 'United Kingdom', users: 189, percentage: 15.2 },
        { country: 'Australia', users: 156, percentage: 12.5 },
        { country: 'Other', users: 212, percentage: 17.0 }
      ] as GeographicData[],
      featureUsage: [
        { feature: 'Quizzes', usage: 2345, percentage: 34, trend: 'up' },
        { feature: 'Chat', usage: 1890, percentage: 28, trend: 'stable' },
        { feature: 'Resources', usage: 1456, percentage: 21, trend: 'up' },
        { feature: 'Sessions', usage: 1123, percentage: 17, trend: 'down' }
      ] as FeatureUsage[],
      performanceMetrics: {
        averageLoadTime: 1.2,
        errorRate: 0.05,
        uptime: 99.9
      }
    };
  }

  // Parental Dashboard (FR-7.5)
  async getParentalDashboard(parentId: string): Promise<ParentalDashboard> {
    await this.delay(1800);

    return {
      parentId,
      children: [
        {
          studentId: 'student-1',
          name: 'Emma Thompson',
          age: 14,
          grade: '9th Grade',
          profileImage: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150',
          currentProgress: {
            overallProgress: 78,
            weakestSubject: 'Science',
            strongestSubject: 'English',
            recentTrend: 'improving'
          },
          weeklyStats: {
            hoursStudied: 12,
            quizzesCompleted: 8,
            averageScore: 85,
            streakDays: 5
          },
          nextSession: {
            subject: 'Mathematics',
            tutorName: 'Dr. Sarah Johnson',
            scheduledTime: '2024-12-15T15:00:00Z'
          },
          recentAchievements: generateMockAchievements().slice(0, 2),
          concerns: ['Time management during tests']
        },
        {
          studentId: 'student-2',
          name: 'James Thompson',
          age: 12,
          grade: '7th Grade',
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          currentProgress: {
            overallProgress: 65,
            weakestSubject: 'Mathematics',
            strongestSubject: 'Art',
            recentTrend: 'stable'
          },
          weeklyStats: {
            hoursStudied: 8,
            quizzesCompleted: 5,
            averageScore: 72,
            streakDays: 3
          },
          recentAchievements: [],
          concerns: ['Needs more practice with word problems']
        }
      ] as ChildOverview[],
      familyStats: {
        totalStudyHours: 20,
        totalQuizzesCompleted: 13,
        averageProgress: 71,
        totalSpent: 450
      },
      recentActivity: [
        {
          id: '1',
          type: 'quiz_completed',
          studentName: 'Emma Thompson',
          title: 'Math Quiz Completed',
          description: 'Scored 92% on Algebra Quiz',
          timestamp: '2024-12-11T10:30:00Z',
          metadata: { subject: 'Mathematics', score: 92 }
        },
        {
          id: '2',
          type: 'session_attended',
          studentName: 'James Thompson',
          title: 'Tutoring Session',
          description: 'Completed Science tutoring session',
          timestamp: '2024-12-10T14:15:00Z',
          metadata: { subject: 'Science' }
        }
      ] as ParentActivityItem[],
      upcomingSessions: [
        {
          id: 'session-1',
          title: 'Mathematics Tutoring',
          subject: 'Mathematics',
          tutor: 'Dr. Sarah Johnson',
          scheduledTime: '2024-12-15T15:00:00Z',
          duration: 60,
          type: 'tutoring',
          status: 'confirmed'
        }
      ],
      alerts: [
        {
          id: 'alert-1',
          type: 'achievement',
          severity: 'low',
          studentName: 'Emma Thompson',
          title: 'New Achievement Unlocked!',
          message: 'Emma has earned the "Math Wizard" achievement',
          actionRequired: false,
          createdAt: '2024-12-11T09:00:00Z',
          isRead: false
        }
      ] as ParentAlert[],
      monthlyReport: {
        month: 'December',
        year: 2024,
        summary: {
          totalHoursStudied: 85,
          totalQuizzesCompleted: 32,
          averageFamilyProgress: 71,
          totalSpending: 1350
        },
        individualProgress: [
          {
            studentName: 'Emma Thompson',
            hoursStudied: 52,
            progress: 78,
            topSubject: 'English',
            needsAttention: ['Time management']
          },
          {
            studentName: 'James Thompson',
            hoursStudied: 33,
            progress: 65,
            topSubject: 'Art',
            needsAttention: ['Mathematics word problems']
          }
        ],
        achievements: generateMockAchievements(),
        recommendations: [
          'Consider additional math practice sessions for James',
          'Emma is ready for advanced English topics',
          'Both children would benefit from time management workshops'
        ]
      } as MonthlyFamilyReport
    };
  }

  // Export Functionality (FR-7.4)
  async exportData(options: ExportOptions): Promise<ExportResult> {
    await this.delay(3000); // Simulate longer processing time

    const fileName = `report_${options.format}_${Date.now()}.${options.format}`;

    return {
      id: `export-${Date.now()}`,
      fileName,
      format: options.format,
      size: Math.floor(Math.random() * 5000000) + 1000000, // Random size 1-5MB
      downloadUrl: `/api/exports/${fileName}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'completed'
    };
  }

  async getExportHistory(userId: string): Promise<ExportResult[]> {
    await this.delay(800);

    return [
      {
        id: 'export-1',
        fileName: 'student_progress_report.pdf',
        format: 'pdf',
        size: 2456789,
        downloadUrl: '/api/exports/student_progress_report.pdf',
        createdAt: '2024-12-10T14:30:00Z',
        expiresAt: '2024-12-17T14:30:00Z',
        status: 'completed'
      },
      {
        id: 'export-2',
        fileName: 'usage_metrics.csv',
        format: 'csv',
        size: 567890,
        downloadUrl: '/api/exports/usage_metrics.csv',
        createdAt: '2024-12-08T09:15:00Z',
        expiresAt: '2024-12-15T09:15:00Z',
        status: 'completed'
      }
    ];
  }

  // Generate sample data for specific periods
  async generateSampleReport(reportType: 'student' | 'tutor' | 'platform', id?: string): Promise<any> {
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    switch (reportType) {
      case 'student':
        return this.getStudentProgressReport(id || 'sample-student', startDate, endDate);
      case 'tutor':
        return this.getTutorPerformanceAnalytics(id || 'sample-tutor', startDate, endDate);
      case 'platform':
        return this.getPlatformUsageMetrics(startDate, endDate);
      default:
        throw new Error('Invalid report type');
    }
  }
}

export const analyticsService = new MockAnalyticsService();