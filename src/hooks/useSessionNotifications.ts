import { useEffect } from 'react';
import { notificationService, calculateSessionDuration } from '../services/notificationService';

interface Session {
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled';
  reminderEnabled?: boolean;
  reminderTime?: number;
}

export const useSessionNotifications = (sessions: Session[]) => {
  useEffect(() => {
    // Schedule reminders for upcoming sessions
    const upcomingSessions = sessions.filter(session =>
      session.status === 'scheduled' &&
      session.reminderEnabled &&
      new Date(session.startTime) > new Date()
    );

    upcomingSessions.forEach(session => {
      const reminderTime = session.reminderTime || 15; // Default to 15 minutes

      notificationService.scheduleSessionReminder({
        sessionId: session.id,
        sessionTitle: session.title,
        startTime: new Date(session.startTime),
        reminderTime: reminderTime
      });
    });

    // Schedule session start notifications
    upcomingSessions.forEach(session => {
      const startTime = new Date(session.startTime);
      const now = new Date();
      const timeUntilStart = startTime.getTime() - now.getTime();

      if (timeUntilStart > 0) {
        setTimeout(() => {
          notificationService.showSessionStarting(session.title);
        }, timeUntilStart);
      }
    });

  }, [sessions]);

  // Function to manually trigger session completion notification
  const notifySessionCompleted = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      const duration = calculateSessionDuration(session.startTime, session.endTime);
      notificationService.showSessionCompleted(session.title, duration);
    }
  };

  // Function to notify about learning streaks
  const notifyStreak = (streakDays: number) => {
    if (streakDays > 1) {
      notificationService.showStreakCelebration(streakDays);
    }
  };

  return {
    notifySessionCompleted,
    notifyStreak
  };
};