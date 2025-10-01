import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Select } from '../ui/Select';
import { Calendar } from '../ui/Calendar';
import { useAuthStore } from '../../store/authStore';
import { RegisterRequest, UserRole } from '../../types';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
  dateOfBirth: z.string().optional(),
  parentEmail: z.string().email().optional(),
}).refine((data) => {
  if (data.role === UserRole.STUDENT && data.dateOfBirth) {
    const birthDate = new Date(data.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 18 && !data.parentEmail) {
      return false;
    }
  }
  return true;
}, {
  message: "Parent email is required for students under 18",
  path: ["parentEmail"],
});

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.STUDENT,
    },
  });

  const watchedRole = watch('role');
  const watchedDateOfBirth = watch('dateOfBirth');

  const onSubmit = async (data: RegisterRequest) => {
    try {
      clearError();
      await registerUser(data);
      // Navigate to login page after successful registration
      navigate('/login');
    } catch (error) {
      // Error is handled by the store
    }
  };

  const isStudentUnder18 = () => {
    if (watchedRole === UserRole.STUDENT && watchedDateOfBirth) {
      const birthDate = new Date(watchedDateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age < 18;
    }
    return false;
  };

  return (
    <>
      <div className="mb-6">
        <p className="text-sm text-amber-700">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-purple-600 hover:text-pink-500"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-pink-50 border border-pink-200 text-pink-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...register('firstName')}
                label="First name"
                type="text"
                autoComplete="given-name"
                error={errors.firstName?.message}
              />
              <Input
                {...register('lastName')}
                label="Last name"
                type="text"
                autoComplete="family-name"
                error={errors.lastName?.message}
              />
            </div>

            <Input
              {...register('email')}
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
            />

            <PasswordInput
              {...register('password')}
              label="Password"
              autoComplete="new-password"
              error={errors.password?.message}
            />

            <Select
              {...register('role')}
              label="I am a"
              options={[
                { value: UserRole.STUDENT, label: 'Student', icon: '🎒' },
                { value: UserRole.TUTOR, label: 'Tutor', icon: '👨‍🏫' },
                { value: UserRole.PARENT, label: 'Parent', icon: '👨‍👩‍👧‍👦' }
              ]}
              error={errors.role?.message}
              helperText="Choose what describes you best!"
            />

            {watchedRole === UserRole.STUDENT && (
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Calendar
                    label="When is your birthday?"
                    value={value}
                    onChange={onChange}
                    error={errors.dateOfBirth?.message}
                    helperText="Click to pick your special day! 🎉"
                    maxDate={new Date().toISOString().split('T')[0]}
                  />
                )}
              />
            )}

            {isStudentUnder18() && (
              <Input
                {...register('parentEmail')}
                label="Parent's email address"
                type="email"
                autoComplete="email"
                error={errors.parentEmail?.message}
                helperText="Required for students under 18"
              />
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Create account
          </Button>
      </form>
    </>
  );
};