import { useEffect, useRef, useCallback } from 'react';
import { useBehavioralStore } from '../store/behavioralStore';

export const useBehavioralTracking = (userId: string) => {
  const startTimeRef = useRef<Date | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const { trackEngagement, recordBehavioralData } = useBehavioralStore();

  useEffect(() => {
    if (!userId) return;

    const trackLogin = () => {
      trackEngagement({
        eventType: 'login',
        metadata: {
          url: window.location.pathname,
          timestamp: new Date(),
          userAgent: navigator.userAgent,
        },
      });
    };

    const trackSessionStart = () => {
      startTimeRef.current = new Date();
      trackEngagement({
        eventType: 'session_start',
        metadata: {
          startTime: startTimeRef.current,
          userAgent: navigator.userAgent,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });
    };

    const trackSessionEnd = () => {
      if (startTimeRef.current) {
        const duration = Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000);

        // Record behavioral data
        recordBehavioralData({
          sessionDuration: duration,
          actionsPerformed: 0, // Can be calculated from events if needed
          engagementScore: 75, // Default, can be calculated from activity
        });

        trackEngagement({
          eventType: 'session_end',
          duration,
          metadata: {
            endTime: new Date(),
            totalDuration: duration,
            lastActivity: lastActivityRef.current,
          },
        });
      }
    };

    const trackActivity = () => {
      lastActivityRef.current = new Date();
    };

    // Track login and session start on mount
    trackLogin();
    trackSessionStart();

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) => {
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

    // Cleanup
    return () => {
      trackSessionEnd();
      events.forEach((event) => {
        document.removeEventListener(event, trackActivity, true);
      });
      window.removeEventListener('beforeunload', trackSessionEnd);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]); // trackEngagement and recordBehavioralData are stable Zustand actions, don't need to be in deps

  const trackCustomEvent = useCallback(
    (
      eventType: 'login' | 'session_start' | 'session_end' | 'quiz_start' | 'quiz_complete',
      metadata?: Record<string, any>
    ) => {
      trackEngagement({
        eventType,
        metadata: metadata || {},
      });
    },
    [trackEngagement]
  );

  const trackQuizStart = useCallback(
    (quizId: string) => {
      trackEngagement({
        eventType: 'quiz_start',
        metadata: { quizId },
      });
    },
    [trackEngagement]
  );

  const trackQuizComplete = useCallback(
    (quizId: string, score: number, duration: number) => {
      trackEngagement({
        eventType: 'quiz_complete',
        duration,
        metadata: { quizId, score },
      });

      // Record behavioral data for quiz completion
      recordBehavioralData({
        sessionDuration: duration,
        actionsPerformed: 1,
        engagementScore: score, // Use quiz score as engagement indicator
      });
    },
    [trackEngagement, recordBehavioralData]
  );

  return {
    trackCustomEvent,
    trackQuizStart,
    trackQuizComplete,
  };
};
