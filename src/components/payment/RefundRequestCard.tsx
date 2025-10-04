import React from 'react';
import {
  RefreshCw,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  CreditCard
} from 'lucide-react';
import { RefundRequest, Transaction } from '../../types';
import { Button } from '../ui/Button';

interface RefundRequestCardProps {
  refundRequest: RefundRequest;
  transaction?: Transaction;
  onCancel?: (refundId: string) => void;
  showActions?: boolean;
}

export const RefundRequestCard: React.FC<RefundRequestCardProps> = ({
  refundRequest,
  transaction,
  onCancel,
  showActions = true
}) => {
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processed':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'processed':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'session_cancelled':
        return 'Session Cancelled';
      case 'technical_issues':
        return 'Technical Issues';
      case 'unsatisfactory_service':
        return 'Unsatisfactory Service';
      case 'duplicate_charge':
        return 'Duplicate Charge';
      case 'other':
        return 'Other';
      default:
        return reason;
    }
  };

  const getRefundMethodLabel = (method: string) => {
    switch (method) {
      case 'original_payment':
        return 'Original Payment Method';
      case 'store_credit':
        return 'Store Credit';
      default:
        return method;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <RefreshCw className="h-6 w-6 text-gray-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Refund Request #{refundRequest.id.slice(-8)}
              </h3>
              <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(refundRequest.status)}`}>
                {getStatusIcon(refundRequest.status)}
                <span className="capitalize">{refundRequest.status}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Requested {formatDate(refundRequest.requestedAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-medium">{getReasonLabel(refundRequest.reason)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(refundRequest.amount)}
          </div>
          <div className="text-sm text-gray-600">
            {getRefundMethodLabel(refundRequest.refundMethod)}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {transaction && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Transaction</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">{formatCurrency(transaction.amount)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(transaction.createdAt)}</span>
            </div>
            {transaction.metadata?.sessionTitle && (
              <div className="flex items-center space-x-2 col-span-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Session:</span>
                <span className="font-medium">{transaction.metadata.sessionTitle}</span>
              </div>
            )}
            {transaction.metadata?.tutorName && (
              <div className="flex items-center space-x-2 col-span-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Tutor:</span>
                <span className="font-medium">{transaction.metadata.tutorName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Refund Details */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Refund Details</h4>
        <div className="text-sm">
          <div className="mb-2">
            <span className="text-gray-600 font-medium">Reason: </span>
            <span>{getReasonLabel(refundRequest.reason)}</span>
          </div>
          {refundRequest.description && (
            <div className="mb-2">
              <span className="text-gray-600 font-medium">Description: </span>
              <span>{refundRequest.description}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600 font-medium">Refund Method: </span>
            <span>{getRefundMethodLabel(refundRequest.refundMethod)}</span>
          </div>
        </div>
      </div>

      {/* Admin Notes (if rejected) */}
      {refundRequest.status === 'rejected' && refundRequest.adminNotes && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">Admin Response</h4>
          <p className="text-sm text-red-700">{refundRequest.adminNotes}</p>
        </div>
      )}

      {/* Processing Information */}
      {refundRequest.processedAt && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-green-800">
              {refundRequest.status === 'processed' ? 'Processed' : 'Updated'} on{' '}
              {formatDate(refundRequest.processedAt)}
            </span>
            {refundRequest.processedBy && (
              <span className="text-green-700 ml-2">
                by {refundRequest.processedBy}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {refundRequest.status === 'pending' && (
              <span>Refund request is being reviewed</span>
            )}
            {refundRequest.status === 'approved' && (
              <span>Refund approved, processing payment</span>
            )}
            {refundRequest.status === 'processed' && (
              <span>Refund has been processed to your account</span>
            )}
            {refundRequest.status === 'rejected' && (
              <span>Refund request was not approved</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {transaction && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = `/payment/transactions?id=${transaction.id}`}
              >
                View Transaction
              </Button>
            )}
            {refundRequest.status === 'pending' && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(refundRequest.id)}
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                Cancel Request
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};