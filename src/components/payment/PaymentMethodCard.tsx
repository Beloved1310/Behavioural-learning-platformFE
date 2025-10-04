import React from 'react';
import { CreditCard, Trash2, Star, MoreVertical } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { Button } from '../ui/Button';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onSetDefault?: (methodId: string) => void;
  onEdit?: (methodId: string) => void;
  onDelete?: (methodId: string) => void;
  showActions?: boolean;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onSetDefault,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-6 w-6" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getCardBrandColor = (brand?: string) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'text-blue-600';
      case 'mastercard':
        return 'text-red-600';
      case 'amex':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCardType = (type: string) => {
    switch (type) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'bank_account':
        return 'Bank Account';
      case 'paypal':
        return 'PayPal';
      default:
        return type;
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-4 ${paymentMethod.isDefault ? 'border-blue-500' : 'border-gray-200'} hover:border-gray-300 transition-colors`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${paymentMethod.isDefault ? 'bg-blue-100' : 'bg-gray-100'}`}>
            {getCardIcon(paymentMethod.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {formatCardType(paymentMethod.type)}
              </h3>
              {paymentMethod.isDefault && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-xs font-medium">Default</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 mt-1">
              {paymentMethod.cardBrand && (
                <span className={`text-sm font-medium ${getCardBrandColor(paymentMethod.cardBrand)}`}>
                  {paymentMethod.cardBrand.toUpperCase()}
                </span>
              )}
              {paymentMethod.cardLast4 && (
                <span className="text-sm text-gray-600">
                  •••• {paymentMethod.cardLast4}
                </span>
              )}
              {paymentMethod.bankName && (
                <span className="text-sm text-gray-600">
                  {paymentMethod.bankName}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {paymentMethod.holderName}
            </p>
            {paymentMethod.expiryMonth && paymentMethod.expiryYear && (
              <p className="text-xs text-gray-500 mt-1">
                Expires {String(paymentMethod.expiryMonth).padStart(2, '0')}/{paymentMethod.expiryYear}
              </p>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            {!paymentMethod.isDefault && onSetDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSetDefault(paymentMethod.id)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Set Default
              </Button>
            )}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="p-1"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Added {new Date(paymentMethod.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(paymentMethod.id)}
                className="text-gray-600 hover:text-gray-800"
              >
                Edit
              </Button>
            )}
            {onDelete && (
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
        </div>
      )}
    </div>
  );
};