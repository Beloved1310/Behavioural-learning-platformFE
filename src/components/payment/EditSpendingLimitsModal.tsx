import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, X } from 'lucide-react';
import { GuardianPaymentMethod } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

const spendingLimitsSchema = z.object({
  spendingLimit: z.number().positive().optional(),
  monthlySpendingLimit: z.number().positive().optional(),
}).refine(data => data.spendingLimit || data.monthlySpendingLimit, {
  message: "At least one spending limit must be set"
});

type SpendingLimitsFormData = z.infer<typeof spendingLimitsSchema>;

interface EditSpendingLimitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SpendingLimitsFormData) => Promise<void>;
  currentLimits?: GuardianPaymentMethod;
  isLoading: boolean;
}

export const EditSpendingLimitsModal: React.FC<EditSpendingLimitsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentLimits,
  isLoading
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<SpendingLimitsFormData>({
    resolver: zodResolver(spendingLimitsSchema),
    defaultValues: {
      spendingLimit: currentLimits?.spendingLimit || undefined,
      monthlySpendingLimit: currentLimits?.monthlySpendingLimit || undefined
    }
  });

  const handleFormSubmit = async (data: SpendingLimitsFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error updating spending limits:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Edit Spending Limits
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {currentLimits && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Limits</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Per Transaction:</span>
                  <span className="font-medium">
                    {currentLimits.spendingLimit ? formatCurrency(currentLimits.spendingLimit) : 'No limit'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly:</span>
                  <span className="font-medium">
                    {currentLimits.monthlySpendingLimit ? formatCurrency(currentLimits.monthlySpendingLimit) : 'No limit'}
                  </span>
                </div>
                {currentLimits.monthlySpendingLimit && (
                  <div className="flex justify-between text-xs pt-1 border-t border-gray-200 mt-2">
                    <span className="text-gray-500">This month spent:</span>
                    <span className="text-gray-700 font-medium">
                      {formatCurrency(currentLimits.currentMonthSpending)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Transaction Limit
              </label>
              <Input
                {...register('spendingLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount (e.g., 100.00)"
                error={errors.spendingLimit?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum amount that can be charged in a single transaction
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Spending Limit
              </label>
              <Input
                {...register('monthlySpendingLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount (e.g., 500.00)"
                error={errors.monthlySpendingLimit?.message}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum total amount that can be spent in a calendar month
              </p>
            </div>

            {errors.root && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {errors.root.message}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Leave a field empty to remove that limit.
                At least one limit must be set to maintain spending controls.
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Limits'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};