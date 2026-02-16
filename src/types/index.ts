export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  profileImage?: string;
  isVerified: boolean;
  createdAt: string;
  dateOfBirth?: string;
  parentEmail?: string;
  parentalConsentStatus?: 'pending' | 'approved' | 'rejected';
  parentalConsentDate?: string;
  gradeLevel?: string;
  academicGoals?: string[];
  subjects?: string[];
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic' | 'reading_writing';
  preferences?: UserPreferences;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  sessionReminders: boolean;
  weeklyReport: boolean;
  language?: string;
  timezone?: string;
}

export interface UserProfileResponse {
  user: User;
  preferences: UserPreferences;
  statistics?: {
    totalStudyHours: number;
    completedSessions: number;
    currentStreak: number;
    totalQuizzes: number;
    averageScore: number;
    badgesEarned: number;
    currentLevel: number;
    totalPoints: number;
  };
}

export const UserRole = {
  STUDENT: 'STUDENT',
  TUTOR: 'TUTOR',
  PARENT: 'PARENT',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionTier = {
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
} as const;

export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dateOfBirth?: string;
  parentEmail?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: unknown[];
}

// Dashboard Types
export interface DashboardStats {
  totalStudyHours: number;
  completedSessions: number;
  currentStreak: number;
  nextSession?: string;
}

export interface Activity {
  id: string;
  type: 'quiz_completed' | 'session_attended' | 'badge_earned' | 'milestone_reached';
  title: string;
  description: string;
  timestamp: string;
  points?: number;
  badgeIcon?: string;
}

export interface UpcomingSession {
  id: string;
  title: string;
  subject: string;
  tutor?: string;
  scheduledTime: string;
  duration: number;
  type: 'tutoring' | 'self_study' | 'quiz';
  status: 'scheduled' | 'confirmed' | 'pending';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  category: 'study' | 'achievement' | 'social' | 'time';
}

export interface ProgressData {
  subject: string;
  current: number;
  target: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

// Chat Types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  timestamp: string;
  messageType: 'text' | 'image' | 'document' | 'audio' | 'video';
  attachments?: MessageAttachment[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  title?: string;
  type: 'direct' | 'group' | 'study_group';
  lastMessage?: ChatMessage;
  lastActivity: string;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  metadata?: {
    subject?: string;
    sessionId?: string;
    groupType?: 'study' | 'tutoring' | 'general';
  };
}

export interface OnlineStatus {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: string;
}

export interface ChatReport {
  id: string;
  reporterId: string;
  conversationId: string;
  messageId?: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'safety_concern' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
}

export interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: { [conversationId: string]: ChatMessage[] };
  onlineUsers: OnlineStatus[];
  typingIndicators: TypingIndicator[];
  isLoading: boolean;
  error: string | null;
}

// Gamification Types
export interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  pointsReward: number;
  badgeReward?: string;
  completionCount: number;
  averageScore: number;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'essay';
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number;
  explanation?: string;
  points: number;
  imageUrl?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
  timeSpent: number; // in seconds
  answers: QuizAnswer[];
  feedback?: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface GameBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'study' | 'achievement' | 'social' | 'time' | 'streak' | 'quiz';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: {
    type:
      | 'quiz_score'
      | 'study_hours'
      | 'streak_days'
      | 'points_earned'
      | 'quizzes_completed'
      | 'perfect_scores';
    threshold: number;
    subject?: string;
  };
  pointsReward: number;
  createdAt: string;
  isActive: boolean;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: GameBadge;
  earnedAt: string;
  progress?: number; // for progressive badges
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  totalPoints: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  badges: UserBadge[];
  rank: number;
  profileImage?: string;
}

export interface StudyStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  streakStartDate: string;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  pointsEarned: number;
  unlockedAt: string;
  category: 'milestone' | 'improvement' | 'consistency' | 'mastery';
}

export interface UserProgress {
  id: string;
  userId: string;
  subject: string;
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  completedQuizzes: number;
  averageScore: number;
  studyTime: number; // in minutes
  lastActivity: string;
}

export interface GamificationState {
  userProfile: {
    totalPoints: number;
    level: number;
    currentXP: number;
    nextLevelXP: number;
    badges: UserBadge[];
    achievements: Achievement[];
    streak: StudyStreak;
    rank: number;
  } | null;
  availableQuizzes: Quiz[];
  recentAttempts: QuizAttempt[];
  leaderboard: LeaderboardEntry[];
  availableBadges: GameBadge[];
  subjectProgress: UserProgress[];
  isLoading: boolean;
  error: string | null;
}


// Analytics & Reporting Types
export interface StudentProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  overallGrade: string;
  overallProgress: number; // percentage
  subjectProgress: SubjectProgress[];
  studyHours: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  quizPerformance: {
    totalQuizzes: number;
    averageScore: number;
    improvement: number;
  };
  attendanceRate: number;
  achievements: Achievement[];
  strengths: string[];
  areasForImprovement: string[];
  tutorComments: TutorComment[];
  generatedAt: string;
}

export interface SubjectProgress {
  subject: string;
  currentLevel: number;
  targetLevel: number;
  progress: number; // percentage
  hoursSpent: number;
  averageScore: number;
  lastActivity: string;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  achievedAt?: string;
  isCompleted: boolean;
}

export interface TutorComment {
  id: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export interface TutorPerformanceAnalytic {
  tutorId: string;
  tutorName: string;
  profileImage?: string;
  period: {
    startDate: string;
    endDate: string;
  };
  overallRating: number;
  totalStudents: number;
  totalSessions: number;
  totalHours: number;
  earnings: {
    total: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  subjectExpertise: SubjectExpertise[];
  studentSatisfaction: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: RatingDistribution[];
  };
  sessionMetrics: {
    completionRate: number;
    punctualityScore: number;
    preparationScore: number;
  };
  engagement: {
    responseTime: number; // minutes
    messagesSent: number;
    resourcesShared: number;
  };
  studentOutcomes: {
    averageImprovement: number;
    successRate: number;
    retentionRate: number;
  };
  recentFeedback: StudentFeedback[];
  performanceTrends: PerformanceTrend[];
}

export interface SubjectExpertise {
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  studentsHelped: number;
  averageRating: number;
  sessionHours: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface StudentFeedback {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  subject: string;
  createdAt: string;
}

export interface PerformanceTrend {
  date: string;
  metric: 'rating' | 'sessions' | 'hours' | 'earnings';
  value: number;
}

export interface PlatformUsageMetric {
  period: {
    startDate: string;
    endDate: string;
  };
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
    userRetentionRate: number;
    userGrowthRate: number;
  };
  sessionMetrics: {
    totalSessions: number;
    averageSessionDuration: number;
    sessionCompletionRate: number;
    peakUsageHours: HourlyUsage[];
  };
  engagementMetrics: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageTimeSpent: number;
    bounceRate: number;
    pageViews: number;
  };
  contentMetrics: {
    quizzesCompleted: number;
    resourcesAccessed: number;
    messagesExchanged: number;
    documentsShared: number;
  };
  deviceMetrics: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  geographicDistribution: GeographicData[];
  featureUsage: FeatureUsage[];
  performanceMetrics: {
    averageLoadTime: number;
    errorRate: number;
    uptime: number;
  };
}

export interface HourlyUsage {
  hour: number;
  users: number;
  sessions: number;
}

export interface GeographicData {
  country: string;
  users: number;
  percentage: number;
}

export interface FeatureUsage {
  feature: string;
  usage: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  includeCharts: boolean;
  sections: string[];
  customFilters?: Record<string, any>;
}

export interface ExportResult {
  id: string;
  fileName: string;
  format: string;
  size: number;
  downloadUrl: string;
  createdAt: string;
  expiresAt: string;
  status: 'generating' | 'completed' | 'failed';
}

export interface ParentalDashboard {
  parentId: string;
  children: ChildOverview[];
  familyStats: {
    totalStudyHours: number;
    totalQuizzesCompleted: number;
    averageProgress: number;
    totalSpent: number;
  };
  recentActivity: ParentActivityItem[];
  upcomingSessions: UpcomingSession[];
  alerts: ParentAlert[];
  monthlyReport: MonthlyFamilyReport;
}

export interface ChildOverview {
  studentId: string;
  name: string;
  age: number;
  grade: string;
  profileImage?: string;
  currentProgress: {
    overallProgress: number;
    weakestSubject: string;
    strongestSubject: string;
    recentTrend: 'improving' | 'declining' | 'stable';
  };
  weeklyStats: {
    hoursStudied: number;
    quizzesCompleted: number;
    averageScore: number;
    streakDays: number;
  };
  nextSession?: {
    subject: string;
    tutorName: string;
    scheduledTime: string;
  };
  recentAchievements: Achievement[];
  concerns: string[];
}

export interface ParentActivityItem {
  id: string;
  type: 'quiz_completed' | 'session_attended' | 'achievement_earned' | 'concern_raised';
  studentName: string;
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    subject?: string;
    score?: number;
    amount?: number;
  };
}

export interface ParentAlert {
  id: string;
  type: 'low_performance' | 'missed_session' | 'spending_limit' | 'achievement' | 'behavior';
  severity: 'low' | 'medium' | 'high';
  studentName: string;
  title: string;
  message: string;
  actionRequired: boolean;
  createdAt: string;
  isRead: boolean;
}

export interface MonthlyFamilyReport {
  month: string;
  year: number;
  summary: {
    totalHoursStudied: number;
    totalQuizzesCompleted: number;
    averageFamilyProgress: number;
    totalSpending: number;
  };
  individualProgress: Array<{
    studentName: string;
    hoursStudied: number;
    progress: number;
    topSubject: string;
    needsAttention: string[];
  }>;
  achievements: Achievement[];
  recommendations: string[];
}

export interface AnalyticsState {
  studentReports: StudentProgressReport[];
  tutorAnalytics: TutorPerformanceAnalytic[];
  platformMetrics: PlatformUsageMetric | null;
  parentalDashboard: ParentalDashboard | null;
  exportHistory: ExportResult[];
  isLoading: boolean;
  error: string | null;
}

// Behavioral Learning Types
export interface BehavioralEvent {
  id: string;
  userId: string;
  eventType:
    | 'page_view'
    | 'button_click'
    | 'form_submit'
    | 'quiz_start'
    | 'quiz_complete'
    | 'session_join'
    | 'session_leave'
    | 'chat_message'
    | 'resource_view'
    | 'search'
    | 'custom';
  eventName: string;
  metadata?: Record<string, any>;
  timestamp: string;
  sessionId?: string;
  page?: string;
  duration?: number;
}

export interface EventCount {
  eventType: string;
  count: number;
  percentage: number;
}

export interface PageView {
  page: string;
  views: number;
  averageDuration: number;
  uniqueUsers?: number;
}

export interface BehavioralInsight {
  id: string;
  userId: string;
  insightType:
    | 'mood_pattern'
    | 'study_habit'
    | 'engagement_trend'
    | 'performance_correlation'
    | 'recommendation';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success' | 'critical';
  data?: Record<string, any>;
  generatedAt: string;
  isRead: boolean;
}

export interface StudyConsistency {
  streakDays: number;
  totalStudyDays: number;
  totalDaysInPeriod: number;
  consistencyScore: number;
  studyPattern: {
    date: string;
    studied: boolean;
    duration?: number;
    sessions?: number;
  }[];
  weekdayDistribution: {
    day: string;
    studyCount: number;
    averageDuration: number;
  }[];
}

export interface SentimentAnalysis {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  positiveFactors: string[];
  concernAreas: string[];
  recommendations: string[];
}

export interface Recommendation {
  id: string;
  userId: string;
  type:
    | 'study_schedule'
    | 'learning_style'
    | 'subject_focus'
    | 'wellbeing'
    | 'motivation'
    | 'time_management';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionItems: string[];
  basedOn: {
    dataPoints: string[];
    insights: string[];
  };
  isRead: boolean;
  isActioned: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ProgressReport {
  id: string;
  userId: string;
  reportType: 'weekly' | 'monthly' | 'custom';
  periodStart: string;
  periodEnd: string;
  summary: {
    totalStudyHours: number;
    sessionsCompleted: number;
    quizzesCompleted: number;
    averageScore: number;
    engagementScore: number;
    consistencyScore: number;
  };
  highlights: string[];
  areasOfImprovement: string[];
  recommendations: string[];
  studyPatterns: {
    preferredStudyTimes: string[];
    mostProductiveDay: string;
    averageSessionDuration: number;
  };
  generatedAt: string;
  viewedAt?: string;
}

export interface MotivationalPrompt {
  id: string;
  type: 'encouragement' | 'milestone' | 'streak' | 'challenge' | 'tip' | 'quote';
  message: string;
  context?: {
    basedOn?: string;
    relatedTo?: string;
  };
  displayedAt: string;
  wasHelpful?: boolean;
}

export interface BehavioralState {
  eventHistory: BehavioralEvent[];
  insights: BehavioralInsight[];
  recommendations: Recommendation[];
  progressReports: ProgressReport[];
  motivationalPrompts: MotivationalPrompt[];
  studyConsistency: StudyConsistency | null;
  sentimentAnalysis: SentimentAnalysis | null;
  isLoading: boolean;
  error: string | null;
}
