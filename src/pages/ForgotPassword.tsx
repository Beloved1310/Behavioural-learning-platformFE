import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthService } from '../services/authService';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError(null);

    try {
      const message = await AuthService.forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={success ? 'Check your email!' : 'Forgot your password?'}
      subtitle={
        success
          ? "We've sent you a password reset link"
          : "No worries! We'll send you reset instructions"
      }
    >
      {success ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Email sent successfully!
            </h3>
            <p className="text-sm text-green-700">
              We've sent a password reset link to your email address. Please check your inbox
              and follow the instructions to reset your password.
            </p>
          </div>

          <div className="text-center text-sm text-amber-700">
            Didn't receive the email?{' '}
            <button
              onClick={() => setSuccess(false)}
              className="font-medium text-purple-600 hover:text-pink-500"
            >
              Try again
            </button>
          </div>

          <Link to="/login">
            <Button type="button" variant="outline" className="w-full">
              Back to login
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

          <Input
            {...register('email')}
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="your.email@example.com"
            error={errors.email?.message}
            helperText="Enter the email address you used to register"
          />

          <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
            Send reset link
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
