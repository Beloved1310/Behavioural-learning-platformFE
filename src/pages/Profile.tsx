import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  gradeLevel: z.string().optional(),
  learningStyle: z.enum(['visual', 'auditory', 'kinesthetic', 'reading_writing']).optional(),
  academicGoals: z.string().optional(),
  subjects: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      gradeLevel: user?.gradeLevel || '',
      learningStyle: user?.learningStyle || undefined,
      academicGoals: user?.academicGoals?.join(', ') || '',
      subjects: user?.subjects?.join(', ') || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // TODO: Call backend API to update profile
      // await AuthService.updateProfile({
      //   ...data,
      //   academicGoals: data.academicGoals?.split(',').map(s => s.trim()).filter(Boolean),
      //   subjects: data.subjects?.split(',').map(s => s.trim()).filter(Boolean),
      // });

      // Mock delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-purple-900">Profile Settings</h1>
          <p className="text-sm text-amber-600 mt-1">
            Manage your personal information and academic preferences
          </p>
        </div>

        {/* Profile Picture Section */}
        <div className="border-b border-gray-200 px-6 py-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-4">Profile Picture</h2>
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <Button type="button" variant="outline" size="sm">
                Upload new picture
              </Button>
              <p className="text-xs text-amber-600 mt-2">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              Profile updated successfully!
            </div>
          )}

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h2 className="text-lg font-semibold text-purple-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="First name"
                type="text"
                error={errors.firstName?.message}
              />
              <Input
                {...register('lastName')}
                label="Last name"
                type="text"
                error={errors.lastName?.message}
              />
              <Input
                {...register('email')}
                label="Email address"
                type="email"
                error={errors.email?.message}
                helperText="Contact support to change your email"
                disabled
              />
              {user?.role === 'STUDENT' && (
                <Select
                  {...register('gradeLevel')}
                  label="Grade Level"
                  options={[
                    { value: '', label: 'Select grade level' },
                    { value: '6', label: '6th Grade' },
                    { value: '7', label: '7th Grade' },
                    { value: '8', label: '8th Grade' },
                    { value: '9', label: '9th Grade' },
                    { value: '10', label: '10th Grade' },
                    { value: '11', label: '11th Grade' },
                    { value: '12', label: '12th Grade' },
                  ]}
                  error={errors.gradeLevel?.message}
                />
              )}
            </div>
          </div>

          {/* Academic Preferences (Students only) */}
          {user?.role === 'STUDENT' && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold text-purple-900 mb-4">
                  Academic Preferences
                </h2>
                <div className="space-y-4">
                  <Select
                    {...register('learningStyle')}
                    label="Preferred Learning Style"
                    options={[
                      { value: '', label: 'Select learning style' },
                      { value: 'visual', label: 'Visual (pictures, diagrams, charts)' },
                      { value: 'auditory', label: 'Auditory (listening, discussions)' },
                      { value: 'kinesthetic', label: 'Kinesthetic (hands-on, movement)' },
                      { value: 'reading_writing', label: 'Reading/Writing (notes, reading)' },
                    ]}
                    error={errors.learningStyle?.message}
                    helperText="This helps us personalize your learning experience"
                  />

                  <div>
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Subjects of Interest
                    </label>
                    <Input
                      {...register('subjects')}
                      type="text"
                      placeholder="Math, Science, English, History..."
                      error={errors.subjects?.message}
                      helperText="Separate subjects with commas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-900 mb-1">
                      Academic Goals
                    </label>
                    <textarea
                      {...register('academicGoals')}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-purple-900"
                      placeholder="Improve math grades, prepare for SAT, learn Spanish..."
                    />
                    {errors.academicGoals && (
                      <p className="text-sm text-pink-600 mt-1">{errors.academicGoals.message}</p>
                    )}
                    <p className="text-xs text-amber-600 mt-1">
                      Share your goals to help tutors understand how to best support you
                    </p>
                  </div>
                </div>
              </div>

              {/* Parental Consent Info (if applicable) */}
              {user?.parentalConsentStatus && (
                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-lg font-semibold text-purple-900 mb-4">
                    Parental Consent
                  </h2>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          user.parentalConsentStatus === 'approved'
                            ? 'bg-green-500'
                            : user.parentalConsentStatus === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Status:{' '}
                          <span className="capitalize">{user.parentalConsentStatus}</span>
                        </p>
                        {user.parentEmail && (
                          <p className="text-xs text-amber-600">
                            Parent email: {user.parentEmail}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Account Information */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-purple-900 mb-4">Account Information</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-amber-700">Account Type:</span>
                <span className="text-purple-900 font-medium capitalize">
                  {user?.role?.toLowerCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Subscription:</span>
                <span className="text-purple-900 font-medium">{user?.subscriptionTier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-700">Member Since:</span>
                <span className="text-purple-900 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
