import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Plus,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Eye
} from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { RefundRequest } from '../../types';
import { RefundRequestCard } from './RefundRequestCard';
import { RequestRefundModal } from './RequestRefundModal';
import { Button } from '../ui/Button';

export const RefundRequests: React.FC = () => {
  const {
    refundRequests,
    transactions,
    isLoading,
    error,
    fetchRefundRequests,
    fetchTransactions,
    requestRefund,
    cancelRefundRequest
  } = usePaymentStore();

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'processed'>('all');

  useEffect(() => {
    fetchRefundRequests();
    fetchTransactions();
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      processed: 0
    };

    refundRequests.forEach(request => {
      counts[request.status as keyof typeof counts]++;
    });

    return counts;
  };

  const getTotalRefundAmount = () => {
    return refundRequests
      .filter(request => request.status === 'processed')
      .reduce((total, request) => total + request.amount, 0);
  };

  const filteredRequests = refundRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const eligibleTransactions = transactions.filter(transaction =>
    transaction.status === 'completed' &&
    (transaction.type === 'session_payment' || transaction.type === 'subscription') &&
    !transaction.refundedAt &&
    !refundRequests.some(refund => refund.transactionId === transaction.id)
  );

  const statusCounts = getStatusCounts();

  const handleRequestRefund = async (data: any) => {
    try {
      await requestRefund(data);
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error requesting refund:', error);
    }
  };

  const handleCancelRefund = async (refundId: string) => {
    if (confirm('Are you sure you want to cancel this refund request?')) {
      try {
        await cancelRefundRequest(refundId);
      } catch (error) {
        console.error('Error cancelling refund request:', error);
      }
    }
  };

  if (isLoading && refundRequests.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Refund Requests</h2>
          <p className="text-gray-600 mt-1">
            Manage your refund requests for tutoring sessions and subscriptions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => fetchRefundRequests()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {eligibleTransactions.length > 0 && (
            <Button onClick={() => setShowRequestModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Refund
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(getTotalRefundAmount())}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-blue-600">{statusCounts.processed}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All ({refundRequests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({statusCounts.pending})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'approved'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved ({statusCounts.approved})
        </button>
        <button
          onClick={() => setFilter('processed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'processed'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Processed ({statusCounts.processed})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'rejected'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Rejected ({statusCounts.rejected})
        </button>
      </div>

      {/* Refund Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No Refund Requests' : `No ${filter} refund requests`}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === 'all'
              ? "You haven't submitted any refund requests yet."
              : `No ${filter} refund requests to show.`
            }
          </p>
          {eligibleTransactions.length > 0 && filter === 'all' && (
            <Button onClick={() => setShowRequestModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Request Your First Refund
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <RefundRequestCard
              key={request.id}
              refundRequest={request}
              transaction={transactions.find(t => t.id === request.transactionId)}
              onCancel={request.status === 'pending' ? handleCancelRefund : undefined}
            />
          ))}
        </div>
      )}

      {/* Refund Policy Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Refund Policy</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Session refunds can be requested up to 24 hours before the scheduled time</p>
              <p>• Subscription refunds are prorated based on usage</p>
              <p>• Refunds are typically processed within 3-5 business days</p>
              <p>• Emergency refunds may be processed faster upon review</p>
            </div>
            <div className="mt-3">
              <a
                href="/refund-policy"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Read Full Refund Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Request Refund Modal */}
      {showRequestModal && (
        <RequestRefundModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onSubmit={handleRequestRefund}
          eligibleTransactions={eligibleTransactions}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};