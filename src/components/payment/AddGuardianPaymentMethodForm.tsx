import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Lock, Users, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

const guardianPaymentMethodSchema = z.object({
  type: z.enum(['credit_card', 'debit_card']),
  cardNumber: z.string().min(13).max(19),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
  cvc: z.string().min(3).max(4),
  holderName: z.string().min(2, 'Cardholder name is required'),
  studentIds: z.array(z.string()).min(1, 'At least one student must be selected'),
  spendingLimit: z.number().positive().optional(),
  monthlySpendingLimit: z.number().positive().optional(),
});

type GuardianPaymentMethodFormData = z.infer<typeof guardianPaymentMethodSchema>;

interface AddGuardianPaymentMethodFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  availableStudents: { id: string; firstName: string; lastName: string }[];
  isLoading?: boolean;
}

export const AddGuardianPaymentMethodForm: React.FC<AddGuardianPaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
  availableStudents,
  isLoading = false
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<GuardianPaymentMethodFormData>({
    resolver: zodResolver(guardianPaymentMethodSchema),
    defaultValues: {
      type: 'credit_card',
      studentIds: []
    }
  });

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

  const handleStudentToggle = (studentId: string) => {
    const updatedStudents = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId];

    setSelectedStudents(updatedStudents);
    setValue('studentIds', updatedStudents);
  };

  const onFormSubmit = async (data: GuardianPaymentMethodFormData) => {
    try {
      await onSubmit({
        ...data,
        studentIds: selectedStudents
      });
    } catch (error) {
      console.error('Error adding guardian payment method:', error);
    }
  };

  const paymentTypeOptions = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' }
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
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <CreditCard className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add Guardian Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type
              </label>
              <Select
                {...register('type')}
                options={paymentTypeOptions}
                error={errors.type?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <Input
                {...register('holderName')}
                placeholder="John Doe"
                error={errors.holderName?.message}
              />
            </div>
          </div>

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
        </div>

        {/* Student Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Link Students</span>
          </h3>

          {availableStudents.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No students available to link</p>
            </div>
          ) : (
            <div className="space-y-2">
              {availableStudents.map((student) => (
                <div
                  key={student.id}
                  className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedStudents.includes(student.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleStudentToggle(student.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentToggle(student.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {errors.studentIds && (
            <p className="text-red-600 text-sm">{errors.studentIds.message}</p>
          )}
        </div>

        {/* Spending Limits */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Spending Limits (Optional)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Per Transaction Limit
              </label>
              <Input
                {...register('spendingLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="100.00"
                error={errors.spendingLimit?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Spending Limit
              </label>
              <Input
                {...register('monthlySpendingLimit', { valueAsNumber: true })}
                type="number"
                step="0.01"
                placeholder="500.00"
                error={errors.monthlySpendingLimit?.message}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <Lock className="h-4 w-4 text-green-600" />
          <span className="text-sm text-gray-600">
            Your payment information is encrypted and secure. Spending limits help you control your students' expenses.
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
            disabled={isLoading || selectedStudents.length === 0}
          >
            {isLoading ? 'Adding...' : 'Add Payment Method'}
          </Button>
        </div>
      </form>
    </div>
  );
};