import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const paymentMethodSchema = z.object({
  type: z.enum(['credit_card', 'debit_card', 'bank_account', 'paypal']),
  cardNumber: z.string().min(13, 'Card number must be at least 13 digits').max(19, 'Card number must be at most 19 digits').optional(),
  expiryMonth: z.number().min(1).max(12).optional(),
  expiryYear: z.number().min(new Date().getFullYear()).optional(),
  cvc: z.string().min(3).max(4).optional(),
  holderName: z.string().min(2, 'Cardholder name is required'),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  routingNumber: z.string().optional(),
  paypalEmail: z.string().email().optional(),
}).refine((data) => {
  if (data.type === 'credit_card' || data.type === 'debit_card') {
    return data.cardNumber && data.expiryMonth && data.expiryYear && data.cvc;
  }
  if (data.type === 'bank_account') {
    return data.bankName && data.accountNumber && data.routingNumber;
  }
  if (data.type === 'paypal') {
    return data.paypalEmail;
  }
  return true;
}, {
  message: 'Please fill all required fields for the selected payment method type'
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

interface AddPaymentMethodFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [selectedType, setSelectedType] = useState<string>('credit_card');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: 'credit_card'
    }
  });

  const watchedType = watch('type');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue('cardNumber', formatted.replace(/\s/g, ''));
    e.target.value = formatted;
  };

  const onFormSubmit = async (data: PaymentMethodFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error adding payment method:', error);
    }
  };

  const paymentTypeOptions = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_account', label: 'Bank Account' },
    { value: 'paypal', label: 'PayPal' }
  ];

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: String(i + 1).padStart(2, '0')
  }));

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => ({
    value: (currentYear + i).toString(),
    label: (currentYear + i).toString()
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Type
          </label>
          <Select
            {...register('type')}
            options={paymentTypeOptions}
            onChange={(value) => {
              setValue('type', value as any);
              setSelectedType(value);
            }}
            error={errors.type?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder / Account Holder Name
          </label>
          <Input
            {...register('holderName')}
            placeholder="John Doe"
            error={errors.holderName?.message}
          />
        </div>

        {(watchedType === 'credit_card' || watchedType === 'debit_card') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <Input
                {...register('cardNumber')}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                onChange={handleCardNumberChange}
                error={errors.cardNumber?.message}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <Select
                  {...register('expiryMonth', { valueAsNumber: true })}
                  options={monthOptions}
                  placeholder="MM"
                  error={errors.expiryMonth?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <Select
                  {...register('expiryYear', { valueAsNumber: true })}
                  options={yearOptions}
                  placeholder="YYYY"
                  error={errors.expiryYear?.message}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVC
                </label>
                <Input
                  {...register('cvc')}
                  placeholder="123"
                  maxLength={4}
                  error={errors.cvc?.message}
                />
              </div>
            </div>
          </>
        )}

        {watchedType === 'bank_account' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Name
              </label>
              <Input
                {...register('bankName')}
                placeholder="Chase Bank"
                error={errors.bankName?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <Input
                {...register('accountNumber')}
                placeholder="1234567890"
                error={errors.accountNumber?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <Input
                {...register('routingNumber')}
                placeholder="021000021"
                error={errors.routingNumber?.message}
              />
            </div>
          </>
        )}

        {watchedType === 'paypal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Email
            </label>
            <Input
              {...register('paypalEmail')}
              type="email"
              placeholder="john@example.com"
              error={errors.paypalEmail?.message}
            />
          </div>
        )}

        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">
            Your payment information is encrypted and secure
          </span>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
            {isLoading ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </div>
      </form>
    </div>
  );
};