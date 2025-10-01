import React from 'react';
import { RegisterForm } from '../components/auth/RegisterForm';
import { AuthLayout } from '../components/layout';

export const Register: React.FC = () => {
  return (
    <AuthLayout 
      title="Create your account"
      subtitle="Join thousands of students learning through our gamified platform."
    >
      <RegisterForm />
    </AuthLayout>
  );
};