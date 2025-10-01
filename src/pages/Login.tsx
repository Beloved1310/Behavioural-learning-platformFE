import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { AuthLayout } from '../components/layout';

export const Login: React.FC = () => {
  return (
    <AuthLayout 
      title="Welcome back"
      subtitle="Please sign in to your account to continue your learning journey."
    >
      <LoginForm />
    </AuthLayout>
  );
};