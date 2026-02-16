import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
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
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    user?.profileImage || null
  );

  const {
    register,
    handleSubmit,
    reset,
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
      const updatedUser = await userService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        gradeLevel: data.gradeLevel || undefined,
        learningStyle: data.learningStyle || undefined,
        academicGoals: data.academicGoals
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        subjects: data.subjects
          ?.split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });

      // Update user in store
      setUser(updatedUser);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (2MB max)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      setError('Image size must be less than 2MB');
      return;
    }

    setIsUploadingImage(true);
    setError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to backend
      const result = await userService.uploadProfileImage(file);

      // Update user profile with new image URL
      if (user) {
        const updatedUser = { ...user, profileImage: result.imageUrl };
        setUser(updatedUser);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      // Reset preview on error
      setProfileImagePreview(user?.profileImage || null);
    } finally {
      setIsUploadingImage(false);
      // Reset input value to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    reset();
    // Clear any error or success messages
    setError(null);
    setSuccess(false);
    // Navigate back to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-purple-900">Profile Settings</h1>
          <p className="text-xs sm:text-sm text-amber-600 mt-1">
            Manage your personal information and academic preferences
          </p>
        </div>

        {/* Profile Picture Section */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
          <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4">
            Profile Picture
          </h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            {profileImagePreview ? (
              <img
                src={profileImagePreview}
                alt="Profile"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </div>
            )}
            <div className="w-full sm:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFileSelect}
                isLoading={isUploadingImage}
                disabled={isUploadingImage}
                className="w-full sm:w-auto"
              >
                {isUploadingImage ? 'Uploading...' : 'Upload new picture'}
              </Button>
              <p className="text-xs text-amber-600 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6"
        >
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
              Profile updated successfully!
            </div>
          )}

          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                    { value: 'Year 6', label: '6th Grade' },
                    { value: 'Year 7', label: '7th Grade' },
                    { value: 'Year 8', label: '8th Grade' },
                    { value: 'Year 9', label: '9th Grade' },
                    { value: 'Year 10', label: '10th Grade' },
                    { value: 'Year 11', label: '11th Grade' },
                    { value: 'Year 12', label: '12th Grade' },
                  ]}
                  error={errors.gradeLevel?.message}
                />
              )}
            </div>
          </div>

          {/* Academic Preferences (Students only) */}
          {user?.role === 'STUDENT' && (
            <>
              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4">
                  Academic Preferences
                </h2>
                <div className="space-y-3 sm:space-y-4">
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
                  <h2 className="text-lg font-semibold text-purple-900 mb-4">Parental Consent</h2>
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
                          Status: <span className="capitalize">{user.parentalConsentStatus}</span>
                        </p>
                        {user.parentEmail && (
                          <p className="text-xs text-amber-600">Parent email: {user.parentEmail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Account Information */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h2 className="text-base sm:text-lg font-semibold text-purple-900 mb-3 sm:mb-4">
              Account Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-amber-700">Account Type:</span>
                <span className="text-purple-900 font-medium capitalize">
                  {user?.role?.toLowerCase()}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0">
                <span className="text-amber-700">Member Since:</span>
                <span className="text-purple-900 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
