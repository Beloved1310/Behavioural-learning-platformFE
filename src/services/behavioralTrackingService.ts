interface EngagementEvent {
  id: string;
  userId: string;
  eventType: 'page_view' | 'session_start' | 'session_end' | 'click' | 'scroll' | 'quiz_attempt' | 'mood_log' | 'achievement_earned';
  timestamp: Date;
  duration?: number; // in seconds
  metadata: {
    page?: string;
    sessionType?: string;
    score?: number;
    mood?: string;
    difficulty?: string;
    subject?: string;
    [key: string]: any;
  };
}

interface StudyPattern {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
  averageSessionDuration: number;
  consistencyScore: number;
  strongSubjects: string[];
  challengingSubjects: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  engagementLevel: 'low' | 'medium' | 'high';
}

interface BehavioralInsight {
  id: string;
  type: 'motivation' | 'warning' | 'celebration' | 'suggestion';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionable: boolean;
  suggestedAction?: string;
  timestamp: Date;
  category: 'engagement' | 'performance' | 'consistency' | 'mood';
}

interface MoodEntry {
  id: string;
  userId: string;
  mood: 'excited' | 'happy' | 'okay' | 'tired' | 'frustrated' | 'confused';
  energy: number; // 1-5 scale
  confidence: number; // 1-5 scale
  notes?: string;
  timestamp: Date;
  sessionId?: string;
}

class BehavioralTrackingService {
  private static instance: BehavioralTrackingService;
  private events: EngagementEvent[] = [];
  private currentSessionStart: Date | null = null;
  private pageLoadTime: Date = new Date();

  private constructor() {
    this.initializeTracking();
    this.loadStoredData();
  }

  public static getInstance(): BehavioralTrackingService {
    if (!BehavioralTrackingService.instance) {
      BehavioralTrackingService.instance = new BehavioralTrackingService();
    }
    return BehavioralTrackingService.instance;
  }

  private initializeTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('session_end', {
          duration: this.getCurrentSessionDuration()
        });
      } else {
        this.trackEvent('session_start', {});
        this.currentSessionStart = new Date();
      }
    });

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.trackEvent('session_end', {
        duration: this.getCurrentSessionDuration()
      });
      this.saveToStorage();
    });

    // Start initial session
    this.trackEvent('session_start', {});
    this.currentSessionStart = new Date();
  }

  private loadStoredData() {
    try {
      const storedEvents = localStorage.getItem('behavioralTrackingEvents');
      if (storedEvents) {
        this.events = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading behavioral tracking data:', error);
    }
  }

  private saveToStorage() {
    try {
      // Only keep last 1000 events to prevent storage bloat
      const recentEvents = this.events.slice(-1000);
      localStorage.setItem('behavioralTrackingEvents', JSON.stringify(recentEvents));
    } catch (error) {
      console.error('Error saving behavioral tracking data:', error);
    }
  }

  private getCurrentSessionDuration(): number {
    if (!this.currentSessionStart) return 0;
    return Math.round((new Date().getTime() - this.currentSessionStart.getTime()) / 1000);
  }

  public trackEvent(eventType: EngagementEvent['eventType'], metadata: EngagementEvent['metadata']) {
    const event: EngagementEvent = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.getCurrentUserId(),
      eventType,
      timestamp: new Date(),
      metadata
    };

    this.events.push(event);
    this.saveToStorage();

    // Trigger real-time analysis for certain events
    if (['session_end', 'quiz_attempt', 'mood_log'].includes(eventType)) {
      this.analyzeRecentBehavior();
    }
  }

  public trackPageView(page: string) {
    this.trackEvent('page_view', { page });
  }

  public trackQuizAttempt(score: number, subject: string, difficulty: string) {
    this.trackEvent('quiz_attempt', { score, subject, difficulty });
  }

  public trackMoodEntry(mood: MoodEntry) {
    this.trackEvent('mood_log', {
      mood: mood.mood,
      energy: mood.energy,
      confidence: mood.confidence,
      notes: mood.notes
    });
  }

  public trackAchievement(achievementType: string, points: number) {
    this.trackEvent('achievement_earned', { achievementType, points });
  }

  private getCurrentUserId(): string {
    // In a real app, this would come from auth service
    return localStorage.getItem('userId') || 'anonymous';
  }

  // FR-5.1: Engagement Pattern Analysis
  public getEngagementPatterns(): {
    loginFrequency: number;
    averageSessionDuration: number;
    dailyEngagement: { [day: string]: number };
    weeklyTrend: 'increasing' | 'decreasing' | 'stable';
    mostActiveTimeOfDay: string;
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentEvents = this.events.filter(event => event.timestamp >= thirtyDaysAgo);
    const sessionStarts = recentEvents.filter(event => event.eventType === 'session_start');
    const sessionEnds = recentEvents.filter(event => event.eventType === 'session_end');

    // Calculate login frequency (sessions per day)
    const uniqueDays = new Set(sessionStarts.map(event =>
      event.timestamp.toDateString()
    ));
    const loginFrequency = uniqueDays.size / 30;

    // Calculate average session duration
    const totalDuration = sessionEnds.reduce((sum, event) =>
      sum + (event.metadata.duration || 0), 0
    );
    const averageSessionDuration = sessionEnds.length > 0 ? totalDuration / sessionEnds.length : 0;

    // Daily engagement analysis
    const dailyEngagement: { [day: string]: number } = {};
    sessionStarts.forEach(event => {
      const day = event.timestamp.toDateString();
      dailyEngagement[day] = (dailyEngagement[day] || 0) + 1;
    });

    // Weekly trend analysis
    const thisWeekSessions = sessionStarts.filter(event =>
      event.timestamp >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const lastWeekSessions = sessionStarts.filter(event => {
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return event.timestamp >= twoWeeksAgo && event.timestamp < oneWeekAgo;
    }).length;

    let weeklyTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (thisWeekSessions > lastWeekSessions * 1.1) weeklyTrend = 'increasing';
    else if (thisWeekSessions < lastWeekSessions * 0.9) weeklyTrend = 'decreasing';

    // Most active time of day
    const hourCounts: { [hour: number]: number } = {};
    sessionStarts.forEach(event => {
      const hour = event.timestamp.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const mostActiveHour = Object.entries(hourCounts).reduce((a, b) =>
      hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b
    )?.[0];

    let mostActiveTimeOfDay = 'morning';
    if (mostActiveHour) {
      const hour = parseInt(mostActiveHour);
      if (hour >= 6 && hour < 12) mostActiveTimeOfDay = 'morning';
      else if (hour >= 12 && hour < 17) mostActiveTimeOfDay = 'afternoon';
      else if (hour >= 17 && hour < 21) mostActiveTimeOfDay = 'evening';
      else mostActiveTimeOfDay = 'night';
    }

    return {
      loginFrequency,
      averageSessionDuration,
      dailyEngagement,
      weeklyTrend,
      mostActiveTimeOfDay
    };
  }

  // FR-5.2: Study Consistency Analysis
  public getStudyConsistency(): {
    consistencyScore: number;
    streakDays: number;
    weeklyPattern: string[];
    subjectConsistency: { [subject: string]: number };
    recommendations: string[];
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentQuizzes = this.events.filter(event =>
      event.eventType === 'quiz_attempt' && event.timestamp >= thirtyDaysAgo
    );

    // Calculate consistency score (0-100)
    const activeDays = new Set(recentQuizzes.map(event =>
      event.timestamp.toDateString()
    ));
    const consistencyScore = Math.round((activeDays.size / 30) * 100);

    // Calculate streak
    let streakDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    while (streakDays < 30) {
      const dayString = currentDate.toDateString();
      const hasActivity = activeDays.has(dayString);

      if (!hasActivity) break;

      streakDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    // Weekly pattern analysis
    const weeklyPattern: string[] = [];
    for (let i = 0; i < 7; i++) {
      const dayOfWeek = (new Date().getDay() - i + 7) % 7;
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
      const dayActivities = recentQuizzes.filter(event =>
        event.timestamp.getDay() === dayOfWeek
      ).length;

      weeklyPattern.push(`${dayName}: ${dayActivities > 0 ? 'Active' : 'Inactive'}`);
    }

    // Subject consistency
    const subjectConsistency: { [subject: string]: number } = {};
    recentQuizzes.forEach(event => {
      const subject = event.metadata.subject || 'unknown';
      subjectConsistency[subject] = (subjectConsistency[subject] || 0) + 1;
    });

    // Generate recommendations
    const recommendations: string[] = [];
    if (consistencyScore < 50) {
      recommendations.push('Try to study a little bit every day, even just for 10 minutes!');
    }
    if (streakDays === 0) {
      recommendations.push('Start a new learning streak today - you can do it!');
    }
    if (Object.keys(subjectConsistency).length === 1) {
      recommendations.push('Explore different subjects to make learning more exciting!');
    }

    return {
      consistencyScore,
      streakDays,
      weeklyPattern,
      subjectConsistency,
      recommendations
    };
  }

  // FR-5.3: Generate Behavioral Insights and Motivational Prompts
  public generateInsights(): BehavioralInsight[] {
    const insights: BehavioralInsight[] = [];
    const patterns = this.getEngagementPatterns();
    const consistency = this.getStudyConsistency();

    // Engagement insights
    if (patterns.weeklyTrend === 'decreasing') {
      insights.push({
        id: 'engagement_decrease',
        type: 'warning',
        priority: 'medium',
        title: 'Let\'s Get Back on Track! 🚀',
        message: 'I noticed you\'ve been less active lately. Remember, every small step counts!',
        actionable: true,
        suggestedAction: 'Start with a 10-minute fun quiz today',
        timestamp: new Date(),
        category: 'engagement'
      });
    }

    if (patterns.weeklyTrend === 'increasing') {
      insights.push({
        id: 'engagement_increase',
        type: 'celebration',
        priority: 'high',
        title: 'You\'re On Fire! 🔥',
        message: 'Your learning activity is increasing! You\'re doing amazing!',
        actionable: false,
        timestamp: new Date(),
        category: 'engagement'
      });
    }

    // Consistency insights
    if (consistency.streakDays >= 7) {
      insights.push({
        id: 'streak_celebration',
        type: 'celebration',
        priority: 'high',
        title: `${consistency.streakDays} Day Streak Champion! 👑`,
        message: 'You\'ve been learning consistently! You\'re building incredible knowledge!',
        actionable: false,
        timestamp: new Date(),
        category: 'consistency'
      });
    }

    if (consistency.consistencyScore < 30) {
      insights.push({
        id: 'consistency_low',
        type: 'motivation',
        priority: 'medium',
        title: 'Small Steps, Big Dreams! ⭐',
        message: 'Consistent learning is like building a castle brick by brick. Let\'s start today!',
        actionable: true,
        suggestedAction: 'Set a daily 15-minute learning reminder',
        timestamp: new Date(),
        category: 'consistency'
      });
    }

    // Time-based insights
    if (patterns.mostActiveTimeOfDay) {
      insights.push({
        id: 'optimal_time',
        type: 'suggestion',
        priority: 'low',
        title: `You Learn Best in the ${patterns.mostActiveTimeOfDay}! 🌅`,
        message: `I've noticed you're most engaged during ${patterns.mostActiveTimeOfDay} sessions.`,
        actionable: true,
        suggestedAction: `Schedule more learning activities in the ${patterns.mostActiveTimeOfDay}`,
        timestamp: new Date(),
        category: 'engagement'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private analyzeRecentBehavior() {
    // This would trigger real-time behavioral analysis
    const insights = this.generateInsights();

    // Store insights for the UI to consume
    localStorage.setItem('behavioralInsights', JSON.stringify(insights));

    // Trigger notifications for high-priority insights
    insights.filter(insight => insight.priority === 'high').forEach(insight => {
      // This could trigger a notification or in-app message
      console.log('High priority insight:', insight);
    });
  }

  public getStoredInsights(): BehavioralInsight[] {
    try {
      const stored = localStorage.getItem('behavioralInsights');
      if (stored) {
        return JSON.parse(stored).map((insight: any) => ({
          ...insight,
          timestamp: new Date(insight.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading behavioral insights:', error);
    }
    return [];
  }

  // FR-5.4: Mood Tracking Support
  public getMoodAnalytics(): {
    averageMood: number;
    moodTrend: 'improving' | 'declining' | 'stable';
    energyLevels: number[];
    confidenceLevels: number[];
    moodDistribution: { [mood: string]: number };
  } {
    const moodEvents = this.events.filter(event => event.eventType === 'mood_log');

    if (moodEvents.length === 0) {
      return {
        averageMood: 3,
        moodTrend: 'stable',
        energyLevels: [],
        confidenceLevels: [],
        moodDistribution: {}
      };
    }

    const moodValues = { excited: 5, happy: 4, okay: 3, tired: 2, frustrated: 1, confused: 1 };
    const averageMood = moodEvents.reduce((sum, event) =>
      sum + (moodValues[event.metadata.mood as keyof typeof moodValues] || 3), 0
    ) / moodEvents.length;

    // Trend analysis (compare recent vs older entries)
    const recentMoods = moodEvents.slice(-10);
    const olderMoods = moodEvents.slice(-20, -10);

    const recentAvg = recentMoods.reduce((sum, event) =>
      sum + (moodValues[event.metadata.mood as keyof typeof moodValues] || 3), 0
    ) / Math.max(recentMoods.length, 1);

    const olderAvg = olderMoods.reduce((sum, event) =>
      sum + (moodValues[event.metadata.mood as keyof typeof moodValues] || 3), 0
    ) / Math.max(olderMoods.length, 1);

    let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) moodTrend = 'improving';
    else if (recentAvg < olderAvg * 0.9) moodTrend = 'declining';

    const energyLevels = moodEvents.map(event => event.metadata.energy || 3);
    const confidenceLevels = moodEvents.map(event => event.metadata.confidence || 3);

    const moodDistribution: { [mood: string]: number } = {};
    moodEvents.forEach(event => {
      const mood = event.metadata.mood;
      if (mood) {
        moodDistribution[mood] = (moodDistribution[mood] || 0) + 1;
      }
    });

    return {
      averageMood,
      moodTrend,
      energyLevels,
      confidenceLevels,
      moodDistribution
    };
  }

  // Clean up old data (keep only last 90 days)
  public cleanupOldData() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(event => event.timestamp >= ninetyDaysAgo);
    this.saveToStorage();
  }
}

export const behavioralTrackingService = BehavioralTrackingService.getInstance();

// Export types for use in components
export type { EngagementEvent, StudyPattern, BehavioralInsight, MoodEntry };