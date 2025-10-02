import { useEffect, useRef } from 'react';
import { behavioralTrackingService } from '../services/behavioralTrackingService';

export const useBehavioralTracking = (userId: string) => {
  const startTimeRef = useRef<Date | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  useEffect(() => {
    if (!userId) return;

    const trackPageView = () => {
      behavioralTrackingService.trackEvent({
        userId,
        eventType: 'page_view',
        metadata: {
          url: window.location.pathname,
          timestamp: new Date()
        }
      });
    };

    const trackActivity = () => {
      lastActivityRef.current = new Date();
    };

    const trackSessionStart = () => {
      startTimeRef.current = new Date();
      behavioralTrackingService.trackEvent({
        userId,
        eventType: 'session_start',
        metadata: {
          startTime: startTimeRef.current,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    };

    const trackSessionEnd = () => {
      if (startTimeRef.current) {
        const duration = new Date().getTime() - startTimeRef.current.getTime();
        behavioralTrackingService.trackEvent({
          userId,
          eventType: 'session_end',
          duration: Math.round(duration / 1000), // Convert to seconds
          metadata: {
            endTime: new Date(),
            totalDuration: duration,
            lastActivity: lastActivityRef.current
          }
        });
      }
    };

    // Track page view on mount
    trackPageView();
    trackSessionStart();

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, trackActivity, true);
    });

    // Track session end on page unload
    window.addEventListener('beforeunload', trackSessionEnd);

    // Track visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        trackSessionEnd();
      } else {
        trackSessionStart();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity, true);
      });
      window.removeEventListener('beforeunload', trackSessionEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      trackSessionEnd();
    };
  }, [userId]);

  const trackCustomEvent = (eventType: string, metadata?: any) => {
    if (userId) {
      behavioralTrackingService.trackEvent({
        userId,
        eventType: eventType as any,
        metadata: { ...metadata, customEvent: true }
      });
    }
  };

  const trackQuizAttempt = (quizId: string, score: number, totalQuestions: number) => {
    if (userId) {
      behavioralTrackingService.trackEvent({
        userId,
        eventType: 'quiz_attempt',
        metadata: {
          quizId,
          score,
          totalQuestions,
          percentage: Math.round((score / totalQuestions) * 100),
          timestamp: new Date()
        }
      });
    }
  };

  const trackMood = (mood: string, intensity: number, notes?: string) => {
    if (userId) {
      behavioralTrackingService.trackMood(userId, {
        mood,
        intensity,
        notes,
        timestamp: new Date()
      });
    }
  };

  const trackAchievement = (achievementId: string, achievementType: string) => {
    if (userId) {
      behavioralTrackingService.trackEvent({
        userId,
        eventType: 'achievement_earned',
        metadata: {
          achievementId,
          achievementType,
          timestamp: new Date()
        }
      });
    }
  };

  return {
    trackCustomEvent,
    trackQuizAttempt,
    trackMood,
    trackAchievement
  };
};