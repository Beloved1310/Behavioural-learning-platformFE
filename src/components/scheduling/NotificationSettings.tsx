import React, { useState, useEffect } from 'react';

interface Session {
  userId: string;
  id: string;
  title: string;
  subject: string;
  type: 'study' | 'tutoring' | 'quiz' | 'reading';
  startTime: string;
  endTime: string;
  tutor?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'scheduled' | 'completed' | 'missed' | 'cancelled' | 'confirmed' | 'pending';
  isRecurring?: boolean;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

interface NotificationSettingsProps {
  sessions: Session[];
  onUpdateSession: (sessionId: string, updatedData: Partial<Session>) => void;
}

interface NotificationPreferences {
  enablePushNotifications: boolean;
  enableEmailReminders: boolean;
  defaultReminderTime: number;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendReminders: boolean;
  motivationalMessages: boolean;
  parentNotifications: boolean;
  parentEmail: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  sessions,
  onUpdateSession,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enablePushNotifications: true,
    enableEmailReminders: true,
    defaultReminderTime: 15,
    quietHoursStart: '21:00',
    quietHoursEnd: '07:00',
    weekendReminders: true,
    motivationalMessages: true,
    parentNotifications: true,
    parentEmail: '',
  });

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 sessions per page

  useEffect(() => {
    // Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Load preferences from localStorage
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        setPreferences((prev) => ({
          ...prev,
          enablePushNotifications: true,
        }));
      }
    }
  };

  const updatePreferences = (key: keyof NotificationPreferences, value: any) => {
    const newPreferences = {
      ...preferences,
      [key]: value,
    };

    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  const toggleSessionReminder = (sessionId: string, enabled: boolean) => {
    onUpdateSession(sessionId, {
      reminderEnabled: enabled,
      reminderTime: enabled ? preferences.defaultReminderTime : undefined,
    });
  };

  const updateSessionReminderTime = (sessionId: string, reminderTime: number) => {
    onUpdateSession(sessionId, {
      reminderTime,
      reminderEnabled: true,
    });
  };

  const reminderTimeOptions = [
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
  ];

  const sendTestNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 Test Notification from Fun Learning!', {
        body: "Your reminders are working perfectly! You're all set for awesome learning adventures! 🚀",
        icon: '/favicon.ico',
        tag: 'test-notification',
      });
    }
  };

  const upcomingSessions = sessions.filter(
    (session) =>
      session.status === 'scheduled' &&
      session.reminderEnabled &&
      new Date(session.startTime) > new Date()
  );

  // Pagination calculations
  const totalPages = Math.ceil(upcomingSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = upcomingSessions.slice(startIndex, endIndex);

  // Reset to page 1 when sessions change and current page is out of bounds
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages]);

  return (
    <div className="space-y-6">
      {/* Notification Permission */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3">🔔 Notification Permissions</h3>

        {notificationPermission === 'default' && (
          <div className="space-y-3">
            <p className="text-amber-700">
              We'd love to send you helpful reminders for your learning sessions! Click the button
              below to allow notifications.
            </p>
            <button
              onClick={requestNotificationPermission}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              🚀 Enable Notifications
            </button>
          </div>
        )}

        {notificationPermission === 'granted' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-green-700">
              <span className="text-xl">✅</span>
              <span className="font-medium">Notifications are enabled! You're all set!</span>
            </div>
            <button
              onClick={sendTestNotification}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors"
            >
              🧪 Send Test Notification
            </button>
          </div>
        )}

        {notificationPermission === 'denied' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-red-700">
              <span className="text-xl">❌</span>
              <span className="font-medium">Notifications are blocked</span>
            </div>
            <p className="text-sm text-red-600">
              To enable notifications, please allow them in your browser settings and refresh the
              page.
            </p>
          </div>
        )}
      </div>

      {/* General Notification Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">⚙️ Notification Preferences</h3>

        <div className="space-y-4">
          {/* Push Notifications */}
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
            <div>
              <div className="font-medium text-purple-900">📱 Browser Notifications</div>
              <div className="text-sm text-purple-600">Get reminders in your browser</div>
            </div>
            <button
              onClick={() =>
                updatePreferences('enablePushNotifications', !preferences.enablePushNotifications)
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                preferences.enablePushNotifications ? 'bg-purple-500' : 'bg-gray-300'
              }`}
              disabled={notificationPermission !== 'granted'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  preferences.enablePushNotifications
                    ? 'transform translate-x-6'
                    : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Email Reminders */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
            <div>
              <div className="font-medium text-purple-900">📧 Email Reminders</div>
              <div className="text-sm text-blue-600">Get reminders via email</div>
            </div>
            <button
              onClick={() =>
                updatePreferences('enableEmailReminders', !preferences.enableEmailReminders)
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                preferences.enableEmailReminders ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  preferences.enableEmailReminders ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Parent Notifications */}
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
            <div>
              <div className="font-medium text-purple-900">👨‍👩‍👧‍👦 Parent Notifications</div>
              <div className="text-sm text-yellow-600">Send updates to parents</div>
            </div>
            <button
              onClick={() =>
                updatePreferences('parentNotifications', !preferences.parentNotifications)
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                preferences.parentNotifications ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  preferences.parentNotifications ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Parent Email Input */}
          {preferences.parentNotifications && (
            <div className="ml-4 p-3 bg-gray-50 rounded-xl">
              <label className="block text-sm font-medium text-purple-900 mb-2">
                Parent's Email Address
              </label>
              <input
                type="email"
                value={preferences.parentEmail}
                onChange={(e) => updatePreferences('parentEmail', e.target.value)}
                placeholder="parent@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Timing Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">⏰ Reminder Timing</h3>

        <div className="space-y-4">
          {/* Default Reminder Time */}
          <div>
            <label className="block text-sm font-medium text-purple-900 mb-2">
              How early should we remind you? 🕐
            </label>
            <select
              value={preferences.defaultReminderTime}
              onChange={(e) => updatePreferences('defaultReminderTime', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              {reminderTimeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quiet Hours */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-purple-900">
                Quiet Hours (No notifications during these times) 😴
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sleep time</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => updatePreferences('quietHoursStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Wake up time</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => updatePreferences('quietHoursEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Weekend Reminders */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl">
            <div>
              <div className="font-medium text-purple-900">🎮 Weekend Reminders</div>
              <div className="text-sm text-orange-600">Get reminders on weekends too</div>
            </div>
            <button
              onClick={() => updatePreferences('weekendReminders', !preferences.weekendReminders)}
              className={`w-12 h-6 rounded-full relative transition-colors ${
                preferences.weekendReminders ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  preferences.weekendReminders ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Motivational Messages */}
          <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl">
            <div>
              <div className="font-medium text-purple-900">🌟 Motivational Messages</div>
              <div className="text-sm text-pink-600">Get encouraging messages and tips</div>
            </div>
            <button
              onClick={() =>
                updatePreferences('motivationalMessages', !preferences.motivationalMessages)
              }
              className={`w-12 h-6 rounded-full relative transition-colors ${
                preferences.motivationalMessages ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  preferences.motivationalMessages ? 'transform translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Individual Session Reminders */}
      {upcomingSessions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-purple-900">🎯 Individual Session Reminders</h3>
              <p className="text-sm text-amber-600 mt-1">
                Customize reminders for each of your upcoming sessions! ({upcomingSessions.length}{' '}
                total)
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            {paginatedSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-purple-900 text-sm">{session.title}</h4>
                    <p className="text-xs text-amber-600">
                      {new Date(session.startTime).toLocaleDateString()} at{' '}
                      {new Date(session.startTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <select
                      value={session.reminderTime || preferences.defaultReminderTime}
                      onChange={(e) =>
                        updateSessionReminderTime(session.id, parseInt(e.target.value))
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      {reminderTimeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => toggleSessionReminder(session.id, !session.reminderEnabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${
                        session.reminderEnabled ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                          session.reminderEnabled ? 'transform translate-x-5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, upcomingSessions.length)} of{' '}
                {upcomingSessions.length} sessions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
        <h3 className="text-lg font-bold text-purple-900 mb-3">💡 Notification Tips</h3>
        <div className="space-y-2 text-sm text-green-700">
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Enable browser notifications for the best experience!</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Set quiet hours so you won't be disturbed during sleep time.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Customize reminder times for different types of sessions.</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-500 mt-0.5">✓</span>
            <span>Parent notifications help keep everyone in the loop!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
