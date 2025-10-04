import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { AuthService } from '../services/authService';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await AuthService.resetPassword(token, data.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid reset link" subtitle="This password reset link is invalid">
        <div className="space-y-6">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-pink-900 mb-2">Invalid Reset Link</h3>
            <p className="text-sm text-pink-700">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>

          <Link to="/forgot-password">
            <Button type="button" className="w-full">
              Request new reset link
            </Button>
          </Link>

          <div className="text-center text-sm text-amber-700">
            <Link to="/login" className="font-medium text-purple-600 hover:text-pink-500">
              Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={success ? 'Password reset successful!' : 'Create new password'}
      subtitle={
        success
          ? 'You can now login with your new password'
          : 'Enter your new password below'
      }
    >
      {success ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Password successfully reset!
            </h3>
            <p className="text-sm text-green-700">
              Your password has been updated. You'll be redirected to the login page in a few
              seconds...
            </p>
          </div>

          <Link to="/login">
            <Button type="button" className="w-full">
              Go to login
            </Button>
          </Link>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <PasswordInput
            {...register('password')}
            label="New password"
            autoComplete="new-password"
            error={errors.password?.message}
            helperText="Must be at least 8 characters"
          />

          <PasswordInput
            {...register('confirmPassword')}
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Reset password
          </Button>

          <div className="text-center text-sm text-amber-700">
            Remember your password?{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-pink-500">
              Sign in here
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};
