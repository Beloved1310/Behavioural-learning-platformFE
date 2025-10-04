import React, { useState, useEffect } from 'react';
import {
  Bell,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  CreditCard,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { PaymentNotification } from '../../types';
import { Button } from '../ui/Button';

export const PaymentNotifications: React.FC = () => {
  const {
    paymentNotifications,
    isLoading,
    error,
    fetchPaymentNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = usePaymentStore();

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchPaymentNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment_success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'payment_failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'refund_processed':
        return <RefreshCw className="h-5 w-5 text-blue-600" />;
      case 'subscription_renewed':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'subscription_cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'spending_limit_reached':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      default:
        return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment_success':
      case 'subscription_renewed':
        return 'border-green-200 bg-green-50';
      case 'payment_failed':
      case 'subscription_cancelled':
        return 'border-red-200 bg-red-50';
      case 'refund_processed':
        return 'border-blue-200 bg-blue-50';
      case 'spending_limit_reached':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const filteredNotifications = paymentNotifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead;
      case 'read':
        return notification.isRead;
      default:
        return true;
    }
  });

  const unreadCount = paymentNotifications.filter(n => !n.isRead).length;

  if (isLoading && paymentNotifications.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Payment Notifications</h2>
          <p className="text-gray-600 mt-1">
            Stay updated on your payment activities and account changes
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              <Eye className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

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
          All Notifications ({paymentNotifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'unread'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'read'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Read ({paymentNotifications.length - unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {filter === 'all' ? 'No Notifications' : `No ${filter} notifications`}
          </h3>
          <p className="text-gray-600">
            {filter === 'all'
              ? "You don't have any payment notifications yet."
              : filter === 'unread'
              ? "All your notifications have been read."
              : "No read notifications to show."
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`relative rounded-lg border p-4 transition-colors ${
                !notification.isRead
                  ? `${getNotificationColor(notification.type)} border-l-4 border-l-blue-500`
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`mt-1 text-sm ${
                        !notification.isRead ? 'text-gray-700' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>

                      {/* Amount Display */}
                      {notification.amount && notification.currency && (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {formatCurrency(notification.amount, notification.currency)}
                        </div>
                      )}

                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                        <span>{formatDate(notification.sentAt)}</span>
                        {notification.readAt && (
                          <span>Read on {formatDate(notification.readAt)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isLoading}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="mt-3 flex items-center space-x-4">
                {notification.relatedTransactionId && (
                  <button
                    onClick={() => window.location.href = `/payment/transactions?id=${notification.relatedTransactionId}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Transaction
                  </button>
                )}
                {notification.relatedSessionId && (
                  <button
                    onClick={() => window.location.href = `/sessions/${notification.relatedSessionId}`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Settings Link */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
            <p className="text-gray-600">
              Customize which payment notifications you receive and how
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/settings/notifications'}
          >
            <Bell className="h-4 w-4 mr-1" />
            Manage Settings
          </Button>
        </div>
      </div>
    </div>
  );
};