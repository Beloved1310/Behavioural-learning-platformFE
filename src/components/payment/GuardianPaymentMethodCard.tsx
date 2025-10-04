import React from 'react';
import { CreditCard, Users, DollarSign, Edit, Trash2, Plus, Minus } from 'lucide-react';
import { GuardianPaymentMethod } from '../../types';
import { Button } from '../ui/Button';

interface GuardianPaymentMethodCardProps {
  paymentMethod: GuardianPaymentMethod;
  studentNames?: { [studentId: string]: string };
  onEditLimits?: (methodId: string) => void;
  onLinkStudent?: (methodId: string) => void;
  onUnlinkStudent?: (methodId: string, studentId: string) => void;
  onDelete?: (methodId: string) => void;
  showActions?: boolean;
}

export const GuardianPaymentMethodCard: React.FC<GuardianPaymentMethodCardProps> = ({
  paymentMethod,
  studentNames = {},
  onEditLimits,
  onLinkStudent,
  onUnlinkStudent,
  onDelete,
  showActions = true
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getSpendingPercentage = () => {
    if (!paymentMethod.monthlySpendingLimit) return 0;
    return Math.min(100, (paymentMethod.currentMonthSpending / paymentMethod.monthlySpendingLimit) * 100);
  };

  const getSpendingStatusColor = () => {
    const percentage = getSpendingPercentage();
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {paymentMethod.type === 'credit_card' ? 'Credit Card' : 'Debit Card'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {paymentMethod.cardBrand && (
                <span className="font-medium">
                  {paymentMethod.cardBrand.toUpperCase()}
                </span>
              )}
              {paymentMethod.cardLast4 && (
                <span>•••• {paymentMethod.cardLast4}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {paymentMethod.holderName}
            </p>
          </div>
        </div>

        {showActions && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(paymentMethod.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Linked Students */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Linked Students ({paymentMethod.studentIds.length})
            </span>
          </div>
          {showActions && onLinkStudent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLinkStudent(paymentMethod.id)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Link Student
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {paymentMethod.studentIds.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No students linked</p>
          ) : (
            paymentMethod.studentIds.map((studentId) => (
              <div key={studentId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">
                  {studentNames[studentId] || `Student ${studentId}`}
                </span>
                {showActions && onUnlinkStudent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUnlinkStudent(paymentMethod.id, studentId)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spending Limits */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Spending Limits</span>
          </div>
          {showActions && onEditLimits && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditLimits(paymentMethod.id)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {paymentMethod.spendingLimit && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Per Transaction:</span>
              <span className="font-medium">{formatCurrency(paymentMethod.spendingLimit)}</span>
            </div>
          )}

          {paymentMethod.monthlySpendingLimit && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Monthly Limit:</span>
                <span className="font-medium">{formatCurrency(paymentMethod.monthlySpendingLimit)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">This Month:</span>
                <span className={`font-medium px-2 py-1 rounded-full text-xs ${getSpendingStatusColor()}`}>
                  {formatCurrency(paymentMethod.currentMonthSpending)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    getSpendingPercentage() >= 90 ? 'bg-red-600' :
                    getSpendingPercentage() >= 70 ? 'bg-orange-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(100, getSpendingPercentage())}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>{formatCurrency(paymentMethod.monthlySpendingLimit)}</span>
              </div>
            </div>
          )}

          {!paymentMethod.spendingLimit && !paymentMethod.monthlySpendingLimit && (
            <p className="text-sm text-gray-500 italic">No spending limits set</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Added {new Date(paymentMethod.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};