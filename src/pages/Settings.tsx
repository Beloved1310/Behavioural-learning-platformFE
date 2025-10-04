import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Select } from '../components/ui/Select';

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
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'notifications' | 'password' | 'privacy'>('notifications');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);

    try {
      // TODO: Call backend API to change password
      // await AuthService.changePassword(data.currentPassword, data.newPassword);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      passwordForm.reset();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Call backend API to update notification preferences
      // await AuthService.updatePreferences(data);

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
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
      // TODO: Call backend API to delete account
      // await AuthService.deleteAccount();

      alert('Account deletion requested. You will receive a confirmation email.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-purple-900">Account Settings</h1>
          <p className="text-sm text-amber-600 mt-1">
            Manage your account preferences and security settings
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-amber-700 hover:text-purple-900 hover:border-gray-300'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-amber-700 hover:text-purple-900 hover:border-gray-300'
              }`}
            >
              Password & Security
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
        <div className="px-6 py-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              Settings updated successfully!
            </div>
          )}

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-purple-900 mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-purple-900">Email Notifications</p>
                      <p className="text-sm text-amber-600">
                        Receive updates and announcements via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('emailNotifications')}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-purple-900">Push Notifications</p>
                      <p className="text-sm text-amber-600">
                        Get real-time notifications in your browser
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('pushNotifications')}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-purple-900">Session Reminders</p>
                      <p className="text-sm text-amber-600">
                        Receive reminders before scheduled sessions
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('sessionReminders')}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-purple-900">Weekly Progress Report</p>
                      <p className="text-sm text-amber-600">
                        Get a weekly summary of your learning progress
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      {...notificationForm.register('weeklyReport')}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
                  Save Preferences
                </Button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-purple-900 mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
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
                <Button type="submit" isLoading={isLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-purple-900 mb-4">Privacy Settings</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-purple-900 mb-2">Data & Privacy</h3>
                    <p className="text-sm text-amber-600 mb-4">
                      We take your privacy seriously. Review our privacy policy to understand how we
                      handle your data.
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      View Privacy Policy
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-purple-900 mb-2">Download Your Data</h3>
                    <p className="text-sm text-amber-600 mb-4">
                      Request a copy of all your data stored on our platform.
                    </p>
                    <Button type="button" variant="outline" size="sm">
                      Request Data Export
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-pink-900 mb-4">Danger Zone</h2>
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                  <h3 className="font-medium text-pink-900 mb-2">Delete Account</h3>
                  <p className="text-sm text-pink-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be
                    undone.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-600 hover:bg-pink-100"
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
