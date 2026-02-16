import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Select } from '../components/ui/Select';
import { userService } from '../services/userService';
import { useToast } from '../contexts/ToastContext';
import { Shield } from 'lucide-react';

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

type PasswordForm = z.infer<typeof passwordSchema>;

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  sessionReminders: z.boolean(),
  weeklyReport: z.boolean(),
});

type NotificationForm = z.infer<typeof notificationSchema>;

export const Settings: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState<'notifications' | 'password' | 'privacy'>(
    'notifications'
  );
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
      weeklyReport: user?.preferences?.weeklyReport ?? true,
    },
  });

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
      showSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to change password';
      setError(errorMessage);
      showError(errorMessage);
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
      showSuccess('Notification preferences updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update preferences';
      setError(errorMessage);
      showError(errorMessage);
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
      const errorMessage = err.message || 'Failed to delete account';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-900">Account Settings</h1>
          <p className="text-xs sm:text-sm text-amber-600 mt-1">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-amber-700 hover:text-purple-900 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'password'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-amber-700 hover:text-purple-900 hover:border-gray-300'
              }`}
            >
              Password & Security
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-amber-700 hover:text-purple-900 hover:border-gray-300'
              }`}
            >
              Privacy
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-3 sm:px-4 py-2 sm:py-3 rounded mb-4 sm:mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form
              onSubmit={notificationForm.handleSubmit(onNotificationSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <label className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-purple-900 text-sm sm:text-base">
                        Email Notifications
                      </p>
                      <p className="text-xs sm:text-sm text-amber-600">
                        Receive updates and announcements via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('emailNotifications')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-purple-900 text-sm sm:text-base">
                        Push Notifications
                      </p>
                      <p className="text-xs sm:text-sm text-amber-600">
                        Get real-time notifications in your browser
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('pushNotifications')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-purple-900 text-sm sm:text-base">
                        Session Reminders
                      </p>
                      <p className="text-xs sm:text-sm text-amber-600">
                        Receive reminders before scheduled sessions
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('sessionReminders')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-purple-900 text-sm sm:text-base">
                        Weekly Progress Report
                      </p>
                      <p className="text-xs sm:text-sm text-amber-600">
                        Get a weekly summary of your learning progress
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('weeklyReport')}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 flex-shrink-0"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                  Save Preferences
                </Button>
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
                <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4">
                  Change Password
                </h2>
                <div className="space-y-3 sm:space-y-4 max-w-md">
                  <PasswordInput
                    {...passwordForm.register('currentPassword')}
                    label="Current password"
                    autoComplete="current-password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                  />

                  <PasswordInput
                    {...passwordForm.register('newPassword')}
                    label="New password"
                    autoComplete="new-password"
                    error={passwordForm.formState.errors.newPassword?.message}
                    helperText="Must be at least 8 characters"
                  />

                  <PasswordInput
                    {...passwordForm.register('confirmPassword')}
                    label="Confirm new password"
                    autoComplete="new-password"
                    error={passwordForm.formState.errors.confirmPassword?.message}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
                  Update Password
                </Button>
              </div>
            </form>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>Privacy Settings</span>
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">
                      Data & Privacy
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-600 mb-3 sm:mb-4">
                      We take your privacy seriously. Review our privacy policy to understand how we
                      handle your data.
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
                                  <li>Profile information (grade level, subjects, learning style)</li>
                                  <li>Session and learning data</li>
                                  <li>Quiz attempts and progress</li>
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
                                  <li>Personalize your learning experience</li>
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
                    <h3 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">
                      Download Your Data
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-600 mb-3 sm:mb-4">
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
                <h2 className="text-base sm:text-lg font-semibold text-pink-900 mb-3 sm:mb-4">
                  Danger Zone
                </h2>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 sm:p-4">
                  <h3 className="font-medium text-pink-900 mb-2 text-sm sm:text-base">
                    Delete Account
                  </h3>
                  <p className="text-xs sm:text-sm text-pink-700 mb-3 sm:mb-4">
                    Permanently delete your account and all associated data. This action cannot be
                    undone.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-600 hover:bg-pink-100 w-full sm:w-auto"
                    onClick={handleDeleteAccount}
                    isLoading={isLoading}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
