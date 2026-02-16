import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { TutorLayout } from '../components/layout/TutorLayout';
import { userService } from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  Clock,
  Users,
  Calendar,
  Mail,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  sessionReminders: z.boolean(),
  sessionRequests: z.boolean(),
  studentProgressAlerts: z.boolean(),
  weeklyReport: z.boolean(),
  atRiskStudentAlerts: z.boolean(),
});

const tutorPreferencesSchema = z.object({
  defaultSessionDuration: z.number().min(15).max(180),
  autoApproveSessions: z.boolean(),
  requireSessionTitle: z.boolean(),
  allowStudentRescheduling: z.boolean(),
  maxStudentsPerSession: z.number().min(1).max(10),
  timezone: z.string(),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type NotificationForm = z.infer<typeof notificationSchema>;
type TutorPreferencesForm = z.infer<typeof tutorPreferencesSchema>;

export const TutorSettings: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<
    'notifications' | 'preferences' | 'password' | 'privacy'
  >('notifications');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const notificationForm = useForm<NotificationForm>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: user?.preferences?.emailNotifications ?? true,
      pushNotifications: user?.preferences?.pushNotifications ?? true,
      sessionReminders: user?.preferences?.sessionReminders ?? true,
      sessionRequests: true,
      studentProgressAlerts: true,
      weeklyReport: user?.preferences?.weeklyReport ?? true,
      atRiskStudentAlerts: true,
    },
  });

  const tutorPreferencesForm = useForm<TutorPreferencesForm>({
    resolver: zodResolver(tutorPreferencesSchema),
    defaultValues: {
      defaultSessionDuration: 60,
      autoApproveSessions: false,
      requireSessionTitle: true,
      allowStudentRescheduling: true,
      maxStudentsPerSession: 1,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  useEffect(() => {
    // Load tutor preferences if they exist
    if ((user as any)?.tutorPreferences) {
      tutorPreferencesForm.reset((user as any).tutorPreferences);
    }
  }, [user]);

  const onPasswordSubmit = async (data: PasswordForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess('Password updated successfully!');
      passwordForm.reset();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.updatePreferences(data);
      setSuccess('Notification preferences updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const onTutorPreferencesSubmit = async (data: TutorPreferencesForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Create backend endpoint for tutor preferences
      // await userService.updateTutorPreferences(data);

      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess('Tutor preferences updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const password = prompt('Please enter your password to confirm account deletion:');
      if (!password) {
        return;
      }
      await userService.deleteAccount({
        password,
        reason: 'User requested deletion',
      });
      showSuccess('Account deletion requested. You will receive a confirmation email.');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'TUTOR') {
    return null;
  }

  return (
    <TutorLayout>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            <span>Tutor Settings</span>
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Manage your account preferences, notifications, and tutor-specific settings
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 sm:space-x-8 px-3 sm:px-6 min-w-max" aria-label="Tabs">
              {[
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'preferences', label: 'Tutor Preferences', icon: Clock },
                { id: 'password', label: 'Password', icon: Lock },
                { id: 'privacy', label: 'Privacy', icon: Shield },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-6">
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <form
                onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-purple-600" />
                    <span>Notification Preferences</span>
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      {
                        key: 'emailNotifications',
                        label: 'Email Notifications',
                        description: 'Receive updates and announcements via email',
                        icon: Mail,
                      },
                      {
                        key: 'pushNotifications',
                        label: 'Push Notifications',
                        description: 'Get real-time notifications in your browser',
                        icon: Bell,
                      },
                      {
                        key: 'sessionReminders',
                        label: 'Session Reminders',
                        description: 'Receive reminders before scheduled sessions',
                        icon: Clock,
                      },
                      {
                        key: 'sessionRequests',
                        label: 'Session Request Alerts',
                        description: 'Get notified when students request new sessions',
                        icon: Calendar,
                      },
                      {
                        key: 'studentProgressAlerts',
                        label: 'Student Progress Alerts',
                        description: 'Receive alerts when students achieve milestones',
                        icon: Users,
                      },
                      {
                        key: 'atRiskStudentAlerts',
                        label: 'At-Risk Student Alerts',
                        description: 'Get notified when students need attention',
                        icon: AlertCircle,
                      },
                      {
                        key: 'weeklyReport',
                        label: 'Weekly Progress Report',
                        description: 'Get a weekly summary of your tutoring activity',
                        icon: Mail,
                      },
                    ].map(({ key, label, description, icon: Icon }) => (
                      <label
                        key={key}
                        className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 gap-3"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Icon className="w-5 h-5 text-purple-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                              {label}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">{description}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          {...notificationForm.register(key as any)}
                          className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tutor Preferences Tab */}
            {activeTab === 'preferences' && (
              <form
                onSubmit={tutorPreferencesForm.handleSubmit(onTutorPreferencesSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span>Tutor Preferences</span>
                  </h2>
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Session Duration (minutes)
                      </label>
                      <input
                        type="number"
                        {...tutorPreferencesForm.register('defaultSessionDuration', {
                          valueAsNumber: true,
                        })}
                        min="15"
                        max="180"
                        step="15"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Default duration for new sessions
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        {...tutorPreferencesForm.register('timezone')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        {Intl.supportedValuesOf('timeZone').map((tz) => (
                          <option key={tz} value={tz}>
                            {tz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Students Per Session
                      </label>
                      <input
                        type="number"
                        {...tutorPreferencesForm.register('maxStudentsPerSession', {
                          valueAsNumber: true,
                        })}
                        min="1"
                        max="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {[
                        {
                          key: 'autoApproveSessions',
                          label: 'Auto-Approve Session Requests',
                          description: 'Automatically approve session requests from students',
                        },
                        {
                          key: 'requireSessionTitle',
                          label: 'Require Session Title',
                          description: 'Students must provide a title when booking sessions',
                        },
                        {
                          key: 'allowStudentRescheduling',
                          label: 'Allow Student Rescheduling',
                          description: 'Students can reschedule their own sessions',
                        },
                      ].map(({ key, label, description }) => (
                        <label
                          key={key}
                          className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm sm:text-base">
                              {label}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">{description}</p>
                          </div>
                          <input
                            type="checkbox"
                            {...tutorPreferencesForm.register(key as any)}
                            className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4 sm:space-y-6"
              >
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <span>Change Password</span>
                  </h2>
                  <div className="space-y-3 sm:space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        {...passwordForm.register('currentPassword')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-xs text-red-600 mt-1">
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        {...passwordForm.register('newPassword')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-xs text-red-600 mt-1">
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        {...passwordForm.register('confirmPassword')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-600 mt-1">
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    <span>Privacy Settings</span>
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        Data & Privacy
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        We take your privacy seriously. Review our privacy policy to understand how
                        we handle your data.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const policyWindow = window.open('', '_blank', 'width=800,height=600');
                          if (policyWindow) {
                            policyWindow.document.write(`
                              <html>
                                <head>
                                  <title>Privacy Policy</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                                    h1 { color: #7c3aed; }
                                    h2 { color: #6b21a8; margin-top: 30px; }
                                    p { margin-bottom: 15px; }
                                  </style>
                                </head>
                                <body>
                                  <h1>Privacy Policy</h1>
                                  <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                                  
                                  <h2>1. Information We Collect</h2>
                                  <p>We collect information that you provide directly to us, including:</p>
                                  <ul>
                                    <li>Account information (name, email, phone number)</li>
                                    <li>Profile information (grade level, subjects, qualifications)</li>
                                    <li>Session and learning data</li>
                                    <li>Payment information (processed securely through third-party providers)</li>
                                  </ul>
                                  
                                  <h2>2. How We Use Your Information</h2>
                                  <p>We use the information we collect to:</p>
                                  <ul>
                                    <li>Provide, maintain, and improve our services</li>
                                    <li>Process transactions and send related information</li>
                                    <li>Send technical notices and support messages</li>
                                    <li>Respond to your comments and questions</li>
                                    <li>Monitor and analyze trends and usage</li>
                                  </ul>
                                  
                                  <h2>3. Data Security</h2>
                                  <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                                  
                                  <h2>4. Your Rights</h2>
                                  <p>You have the right to:</p>
                                  <ul>
                                    <li>Access your personal data</li>
                                    <li>Request correction of inaccurate data</li>
                                    <li>Request deletion of your data</li>
                                    <li>Export your data (available in Settings)</li>
                                    <li>Object to processing of your data</li>
                                  </ul>
                                  
                                  <h2>5. Contact Us</h2>
                                  <p>If you have questions about this Privacy Policy, please contact us through the support channels in your account settings.</p>
                                </body>
                              </html>
                            `);
                            policyWindow.document.close();
                          }
                        }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors"
                      >
                        View Privacy Policy
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                        Download Your Data
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        Request a copy of all your data stored on our platform. Your data will be
                        downloaded as a JSON file.
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          setIsLoading(true);
                          setError(null);
                          setSuccess(null);

                          try {
                            const result = await userService.requestDataExport();
                            await userService.downloadDataExport(result.exportId);
                            showSuccess('Data export downloaded successfully!');
                          } catch (err: any) {
                            const errorMessage = err.message || 'Failed to export data';
                            setError(errorMessage);
                            showError(errorMessage);
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                        disabled={isLoading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Preparing Export...' : 'Request Data Export'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 sm:pt-6">
                  <h2 className="text-base sm:text-lg font-semibold text-red-900 mb-3 sm:mb-4">
                    Danger Zone
                  </h2>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium text-red-900 mb-2 text-sm sm:text-base">
                      Delete Account
                    </h3>
                    <p className="text-xs sm:text-sm text-red-700 mb-3 sm:mb-4">
                      Permanently delete your account and all associated data. This action cannot be
                      undone.
                    </p>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={isLoading}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
};
