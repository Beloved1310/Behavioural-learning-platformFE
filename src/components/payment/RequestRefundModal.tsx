import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, X, AlertCircle } from 'lucide-react';
import { Transaction } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

const refundRequestSchema = z.object({
  transactionId: z.string().min(1, 'Please select a transaction'),
  reason: z.enum(['session_cancelled', 'technical_issues', 'unsatisfactory_service', 'duplicate_charge', 'other']),
  description: z.string().min(10, 'Please provide at least 10 characters of description'),
  refundMethod: z.enum(['original_payment', 'store_credit']),
  amount: z.number().positive('Amount must be greater than 0')
});

type RefundRequestFormData = z.infer<typeof refundRequestSchema>;

interface RequestRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RefundRequestFormData) => Promise<void>;
  eligibleTransactions: Transaction[];
  isLoading: boolean;
}

export const RequestRefundModal: React.FC<RequestRefundModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  eligibleTransactions,
  isLoading
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<RefundRequestFormData>({
    resolver: zodResolver(refundRequestSchema)
  });

  const selectedTransactionId = watch('transactionId');
  const selectedReason = watch('reason');

  React.useEffect(() => {
    if (selectedTransactionId) {
      const transaction = eligibleTransactions.find(t => t.id === selectedTransactionId);
      setSelectedTransaction(transaction || null);
      if (transaction) {
        setValue('amount', transaction.amount);
      }
    }
  }, [selectedTransactionId, eligibleTransactions, setValue]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFormSubmit = async (data: RefundRequestFormData) => {
    try {
      await onSubmit({
        ...data,
        sessionId: selectedTransaction?.sessionId
      });
      reset();
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error submitting refund request:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedTransaction(null);
    onClose();
  };

  const transactionOptions = eligibleTransactions.map(transaction => ({
    value: transaction.id,
    label: `${formatCurrency(transaction.amount)} - ${transaction.description} (${formatDate(transaction.createdAt)})`
  }));

  const reasonOptions = [
    { value: 'session_cancelled', label: 'Session was cancelled' },
    { value: 'technical_issues', label: 'Technical issues during session' },
    { value: 'unsatisfactory_service', label: 'Unsatisfactory service' },
    { value: 'duplicate_charge', label: 'Duplicate charge' },
    { value: 'other', label: 'Other reason' }
  ];

  const refundMethodOptions = [
    { value: 'original_payment', label: 'Refund to original payment method' },
    { value: 'store_credit', label: 'Store credit for future use' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleClose} />

        <div className="inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Request Refund
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose} className="p-1">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {eligibleTransactions.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Eligible Transactions
              </h3>
              <p className="text-gray-600">
                You don't have any transactions that are eligible for refund at this time.
              </p>
              <Button onClick={handleClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
              {/* Transaction Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Transaction
                </label>
                <Select
                  {...register('transactionId')}
                  options={transactionOptions}
                  placeholder="Choose a transaction to refund"
                  error={errors.transactionId?.message}
                />
              </div>

              {/* Selected Transaction Details */}
              {selectedTransaction && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedTransaction.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">
                        {selectedTransaction.type.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedTransaction.metadata?.sessionTitle && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Session:</span>
                        <span className="font-medium">{selectedTransaction.metadata.sessionTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Refund Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Refund
                </label>
                <Select
                  {...register('reason')}
                  options={reasonOptions}
                  placeholder="Select a reason"
                  error={errors.reason?.message}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                  {selectedReason === 'other' && <span className="text-red-500 ml-1">*</span>}
                </label>
                <textarea
                  {...register('description')}
                  placeholder="Please provide details about your refund request..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Refund Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount
                </label>
                <Input
                  {...register('amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedTransaction?.amount || undefined}
                  placeholder="0.00"
                  error={errors.amount?.message}
                />
                {selectedTransaction && (
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum refund amount: {formatCurrency(selectedTransaction.amount)}
                  </p>
                )}
              </div>

              {/* Refund Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Method
                </label>
                <Select
                  {...register('refundMethod')}
                  options={refundMethodOptions}
                  placeholder="Choose refund method"
                  error={errors.refundMethod?.message}
                />
              </div>

              {/* Information Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Refund Processing Information</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Refund requests are reviewed within 1-2 business days</li>
                      <li>• Approved refunds are processed within 3-5 business days</li>
                      <li>• Store credit refunds are applied immediately once approved</li>
                      <li>• You'll receive email notifications about your request status</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  disabled={isLoading || !selectedTransaction}
                >
                  {isLoading ? 'Submitting...' : 'Submit Refund Request'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};