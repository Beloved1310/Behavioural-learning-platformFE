import React from 'react';

// Generic skeleton base component
const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Card skeleton for payment methods and transaction cards
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 space-y-4">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <SkeletonBase className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>
      <SkeletonBase className="h-8 w-20 rounded-md" />
    </div>
    <SkeletonBase className="h-3 w-full" />
    <SkeletonBase className="h-3 w-3/4" />
  </div>
);

// Table skeleton for transaction history
export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    {/* Table Header */}
    <div className="bg-gray-50 px-4 sm:px-6 py-3 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-4 w-16" />
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-4 w-12" />
      </div>
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-4 sm:px-6 py-4 flex items-center space-x-4">
          <SkeletonBase className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-32" />
            <SkeletonBase className="h-3 w-24" />
          </div>
          <SkeletonBase className="h-4 w-16" />
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton for payment forms
export const FormSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 space-y-6">
    <div className="space-y-2">
      <SkeletonBase className="h-4 w-24" />
      <SkeletonBase className="h-10 w-full rounded-md" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-20" />
        <SkeletonBase className="h-10 w-full rounded-md" />
      </div>
      <div className="space-y-2">
        <SkeletonBase className="h-4 w-16" />
        <SkeletonBase className="h-10 w-full rounded-md" />
      </div>
    </div>

    <div className="space-y-2">
      <SkeletonBase className="h-4 w-28" />
      <SkeletonBase className="h-10 w-full rounded-md" />
    </div>

    <div className="flex justify-end space-x-3">
      <SkeletonBase className="h-10 w-20 rounded-md" />
      <SkeletonBase className="h-10 w-24 rounded-md" />
    </div>
  </div>
);

// Stats skeleton for dashboard stats cards
export const StatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-6 w-16" />
          </div>
          <SkeletonBase className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

// List skeleton for notifications and refunds
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 4 }) => (
  <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="p-4 sm:p-6 flex items-start space-x-4">
        <SkeletonBase className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <SkeletonBase className="h-4 w-32" />
            <SkeletonBase className="h-3 w-16" />
          </div>
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-2/3" />
          <div className="flex items-center space-x-2 mt-3">
            <SkeletonBase className="h-6 w-16 rounded-full" />
            <SkeletonBase className="h-6 w-20 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Subscription skeleton for subscription management
export const SubscriptionSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Current Plan */}
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBase className="h-5 w-32" />
          <SkeletonBase className="h-6 w-20 rounded-full" />
        </div>
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-3/4" />
        <div className="flex items-center justify-between pt-4 border-t">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-8 w-28 rounded-md" />
        </div>
      </div>
    </div>

    {/* Billing Details */}
    <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
      <SkeletonBase className="h-5 w-28 mb-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <SkeletonBase className="h-4 w-28" />
          <SkeletonBase className="h-4 w-24" />
        </div>
      </div>
    </div>
  </div>
);

// Payment method skeleton
export const PaymentMethodSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <SkeletonBase className="h-8 w-12 rounded" />
        <div className="space-y-1">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <SkeletonBase className="h-6 w-16 rounded-full" />
        <SkeletonBase className="h-8 w-8 rounded" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonBase className="h-3 w-20" />
      <SkeletonBase className="h-3 w-28" />
    </div>
  </div>
);

// Enhanced component loader with better visual feedback
export const EnhancedComponentLoader: React.FC<{
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
}> = ({
  message = "Loading...",
  size = 'md',
  showMessage = true
}) => {
  const sizeClasses = {
    sm: 'py-4 sm:py-6',
    md: 'py-8 sm:py-12',
    lg: 'py-12 sm:py-16'
  };

  const spinnerSizes = {
    sm: 'h-5 w-5 sm:h-6 sm:w-6',
    md: 'h-6 w-6 sm:h-8 sm:w-8',
    lg: 'h-8 w-8 sm:h-10 sm:w-10'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          <div className={`animate-spin rounded-full ${spinnerSizes[size]} border-2 border-gray-300 border-t-blue-600`}></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-400 animate-ping"></div>
        </div>
        {showMessage && (
          <span className="text-sm sm:text-base text-gray-600 font-medium animate-pulse">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default {
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  StatsSkeleton,
  ListSkeleton,
  SubscriptionSkeleton,
  PaymentMethodSkeleton,
  EnhancedComponentLoader
};