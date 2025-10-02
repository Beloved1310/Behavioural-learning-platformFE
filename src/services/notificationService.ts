interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

interface SessionReminder {
  sessionId: string;
  sessionTitle: string;
  startTime: Date;
  reminderTime: number; // minutes before
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {
    this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private init() {
    // Request notification permission on service initialization
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('Notification service initialized');
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  public showNotification(data: NotificationData): void {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Check quiet hours
    if (this.isQuietHours()) {
      console.log('Notification blocked due to quiet hours');
      return;
    }

    try {
      const notification = new Notification(data.title, {
        body: data.body,
        icon: data.icon || '/favicon.ico',
        tag: data.tag,
        data: data.data,
        requireInteraction: false
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle notification click (could navigate to sessions page)
        if (data.data?.sessionId) {
          window.location.href = '/sessions';
        }
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public scheduleSessionReminder(reminder: SessionReminder): void {
    const now = new Date();
    const reminderTime = new Date(reminder.startTime.getTime() - reminder.reminderTime * 60 * 1000);

    if (reminderTime <= now) {
      console.log('Reminder time is in the past, skipping');
      return;
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification({
        title: '🚀 Learning Adventure Starting Soon!',
        body: `Your "${reminder.sessionTitle}" session starts in ${reminder.reminderTime} minutes!`,
        tag: `session-reminder-${reminder.sessionId}`,
        data: { sessionId: reminder.sessionId, type: 'session-reminder' }
      });
    }, timeUntilReminder);

    console.log(`Scheduled reminder for session "${reminder.sessionTitle}" at ${reminderTime.toLocaleString()}`);
  }

  public showMotivationalMessage(): void {
    const messages = [
      {
        title: '🌟 You\'re Amazing!',
        body: 'Keep up the fantastic learning! You\'re doing great!'
      },
      {
        title: '🚀 Learning Superstar!',
        body: 'Every session makes you smarter and more awesome!'
      },
      {
        title: '🏆 Achievement Unlocked!',
        body: 'You\'re building incredible knowledge every day!'
      },
      {
        title: '🎯 On Fire!',
        body: 'Your learning streak is absolutely incredible!'
      },
      {
        title: '⭐ Brilliant Mind!',
        body: 'Your curiosity and dedication are truly inspiring!'
      }
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    this.showNotification({
      ...randomMessage,
      tag: 'motivational-message'
    });
  }

  public showSessionStarting(sessionTitle: string): void {
    this.showNotification({
      title: '⏰ Time to Learn!',
      body: `Your "${sessionTitle}" session is starting now! Let\'s have some fun!`,
      tag: 'session-starting'
    });
  }

  public showSessionCompleted(sessionTitle: string, duration: number): void {
    this.showNotification({
      title: '🎉 Session Complete!',
      body: `Amazing work! You just completed "${sessionTitle}" (${duration} minutes). You\'re awesome!`,
      tag: 'session-completed'
    });
  }

  public showStreakCelebration(streakDays: number): void {
    let title = '🔥 Learning Streak!';
    let body = `${streakDays} days in a row! You're on fire!`;

    if (streakDays >= 7) {
      title = '🏆 Week Warrior!';
      body = `${streakDays} days straight! You're a learning champion!`;
    }

    if (streakDays >= 30) {
      title = '👑 Month Master!';
      body = `${streakDays} days! You're absolutely incredible!`;
    }

    this.showNotification({
      title,
      body,
      tag: 'streak-celebration'
    });
  }

  private isQuietHours(): boolean {
    try {
      const preferences = localStorage.getItem('notificationPreferences');
      if (!preferences) return false;

      const { quietHoursStart, quietHoursEnd } = JSON.parse(preferences);
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const startTime = this.parseTimeString(quietHoursStart);
      const endTime = this.parseTimeString(quietHoursEnd);

      // Handle overnight quiet hours (e.g., 22:00 to 07:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      }

      return currentTime >= startTime && currentTime <= endTime;
    } catch {
      return false;
    }
  }

  private parseTimeString(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  public clearAllNotifications(): void {
    // This will close all notifications with the same tag
    const tags = [
      'session-reminder',
      'session-starting',
      'session-completed',
      'motivational-message',
      'streak-celebration'
    ];

    // Note: There's no direct way to close all notifications,
    // but we can create dummy notifications with the same tags to replace them
    tags.forEach(tag => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const dummy = new Notification('', { tag, silent: true });
        dummy.close();
      }
    });
  }
}

export const notificationService = NotificationService.getInstance();

// Auto-schedule motivational messages (optional feature)
export const startMotivationalMessages = () => {
  const preferences = localStorage.getItem('notificationPreferences');
  if (!preferences) return;

  try {
    const { motivationalMessages } = JSON.parse(preferences);
    if (!motivationalMessages) return;

    // Send motivational message every 4 hours during active hours
    setInterval(() => {
      const now = new Date();
      const hour = now.getHours();

      // Only during active learning hours (8 AM to 8 PM)
      if (hour >= 8 && hour <= 20) {
        notificationService.showMotivationalMessage();
      }
    }, 4 * 60 * 60 * 1000); // 4 hours
  } catch {
    // Ignore parsing errors
  }
};

// Helper function to calculate session duration
export const calculateSessionDuration = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
};