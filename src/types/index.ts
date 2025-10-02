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
}

export const UserRole = {
  STUDENT: 'STUDENT',
  TUTOR: 'TUTOR',
  PARENT: 'PARENT',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const SubscriptionTier = {
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM'
} as const;

export type SubscriptionTier = typeof SubscriptionTier[keyof typeof SubscriptionTier];

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
    type: 'quiz_score' | 'study_hours' | 'streak_days' | 'points_earned' | 'quizzes_completed' | 'perfect_scores';
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

// Payment & Transaction Types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'paypal';
  cardLast4?: string;
  cardBrand?: string;
  bankName?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
  holderName: string;
  createdAt: string;
  isActive: boolean;
}

export interface GuardianPaymentMethod extends PaymentMethod {
  guardianId: string;
  studentIds: string[];
  spendingLimit?: number;
  monthlySpendingLimit?: number;
  currentMonthSpending: number;
}

export interface Transaction {
  id: string;
  userId: string;
  studentId?: string;
  guardianId?: string;
  sessionId?: string;
  amount: number;
  currency: string;
  type: 'session_payment' | 'subscription' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentMethodId: string;
  description: string;
  createdAt: string;
  processedAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  receiptUrl?: string;
  invoiceId?: string;
  metadata?: {
    sessionTitle?: string;
    tutorId?: string;
    tutorName?: string;
    duration?: number;
    subject?: string;
  };
}

export interface Receipt {
  id: string;
  transactionId: string;
  receiptNumber: string;
  issueDate: string;
  amount: number;
  currency: string;
  description: string;
  itemizedCharges: ReceiptItem[];
  subtotal: number;
  tax?: number;
  totalAmount: number;
  paymentMethod: string;
  billingAddress?: Address;
  downloadUrl: string;
  emailSent: boolean;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  type: 'session' | 'subscription' | 'fee' | 'discount';
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  sessionCredits?: number;
  tutorAccessLevel: 'basic' | 'premium' | 'unlimited';
  supportLevel: 'community' | 'email' | 'priority';
  isActive: boolean;
  trialDays?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'trial';
  startDate: string;
  endDate: string;
  renewalDate?: string;
  cancelledAt?: string;
  trialEndsAt?: string;
  autoRenew: boolean;
  sessionCreditsRemaining?: number;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
}

export interface RefundRequest {
  id: string;
  transactionId: string;
  sessionId?: string;
  userId: string;
  guardianId?: string;
  amount: number;
  reason: 'session_cancelled' | 'technical_issues' | 'unsatisfactory_service' | 'duplicate_charge' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminNotes?: string;
  refundMethod: 'original_payment' | 'store_credit';
}

export interface PaymentNotification {
  id: string;
  recipientId: string;
  recipientType: 'student' | 'parent' | 'guardian';
  type: 'payment_success' | 'payment_failed' | 'refund_processed' | 'subscription_renewed' | 'subscription_cancelled' | 'spending_limit_reached';
  title: string;
  message: string;
  relatedTransactionId?: string;
  relatedSessionId?: string;
  amount?: number;
  currency?: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

export interface PaymentState {
  paymentMethods: PaymentMethod[];
  guardianPaymentMethods: GuardianPaymentMethod[];
  transactions: Transaction[];
  receipts: Receipt[];
  subscription: UserSubscription | null;
  subscriptionPlans: SubscriptionPlan[];
  refundRequests: RefundRequest[];
  paymentNotifications: PaymentNotification[];
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

export interface TutorPerformanceAnalytics {
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

export interface PlatformUsageMetrics {
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
  type: 'quiz_completed' | 'session_attended' | 'achievement_earned' | 'payment_made' | 'concern_raised';
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
  tutorAnalytics: TutorPerformanceAnalytics[];
  platformMetrics: PlatformUsageMetrics | null;
  parentalDashboard: ParentalDashboard | null;
  exportHistory: ExportResult[];
  isLoading: boolean;
  error: string | null;
}