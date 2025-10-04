import React from 'react';
import {
  CreditCard,
  Calendar,
  User,
  BookOpen,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Transaction } from '../../types';
import { Button } from '../ui/Button';

interface TransactionCardProps {
  transaction: Transaction;
  onViewReceipt?: (transactionId: string) => void;
  onRequestRefund?: (transactionId: string) => void;
  showActions?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onViewReceipt,
  onRequestRefund,
  showActions = true
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: transaction.currency || 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      case 'disputed':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'failed':
        return 'text-red-700 bg-red-100';
      case 'refunded':
        return 'text-blue-700 bg-blue-100';
      case 'disputed':
        return 'text-orange-700 bg-orange-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'session_payment':
        return <BookOpen className="h-4 w-4" />;
      case 'subscription':
        return <User className="h-4 w-4" />;
      case 'refund':
        return <RefreshCw className="h-4 w-4" />;
      case 'fee':
        return <CreditCard className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatTransactionType = (type: string) => {
    switch (type) {
      case 'session_payment':
        return 'Session Payment';
      case 'subscription':
        return 'Subscription';
      case 'refund':
        return 'Refund';
      case 'fee':
        return 'Fee';
      default:
        return type;
    }
  };

  const canRequestRefund = () => {
    return transaction.status === 'completed' &&
           (transaction.type === 'session_payment' || transaction.type === 'subscription') &&
           !transaction.refundedAt;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getTypeIcon(transaction.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {transaction.description}
              </h3>
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                {getStatusIcon(transaction.status)}
                <span className="capitalize">{transaction.status}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span className="font-medium">{formatTransactionType(transaction.type)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">ID:</span>
                <span className="font-mono text-xs">{transaction.id.slice(-8)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(transaction.amount)}
          </div>
          {transaction.refundAmount && (
            <div className="text-sm text-red-600">
              Refunded: {formatCurrency(transaction.refundAmount)}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Details */}
      {transaction.metadata && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Transaction Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {transaction.metadata.sessionTitle && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Session:</span>
                <span className="font-medium">{transaction.metadata.sessionTitle}</span>
              </div>
            )}
            {transaction.metadata.tutorName && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Tutor:</span>
                <span className="font-medium">{transaction.metadata.tutorName}</span>
              </div>
            )}
            {transaction.metadata.duration && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{transaction.metadata.duration} minutes</span>
              </div>
            )}
            {transaction.metadata.subject && (
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{transaction.metadata.subject}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Information */}
      {transaction.refundReason && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-blue-800">Refund Reason: </span>
            <span className="text-blue-700">{transaction.refundReason}</span>
          </div>
          {transaction.refundedAt && (
            <div className="text-xs text-blue-600 mt-1">
              Refunded on {formatDate(transaction.refundedAt)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {transaction.processedAt && (
              <span>Processed on {formatDate(transaction.processedAt)}</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {transaction.receiptUrl && onViewReceipt && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReceipt(transaction.id)}
              >
                <Download className="h-4 w-4 mr-1" />
                Receipt
              </Button>
            )}
            {canRequestRefund() && onRequestRefund && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRequestRefund(transaction.id)}
                className="text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Request Refund
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};