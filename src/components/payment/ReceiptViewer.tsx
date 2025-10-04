import React, { useState, useEffect } from 'react';
import { Download, Mail, Printer, X } from 'lucide-react';
import { usePaymentStore } from '../../store/paymentStore';
import { Receipt } from '../../types';
import { Button } from '../ui/Button';

interface ReceiptViewerProps {
  receiptId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receiptId,
  isOpen,
  onClose
}) => {
  const {
    fetchReceipt,
    downloadReceipt,
    emailReceipt,
    isLoading,
    error
  } = usePaymentStore();

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (isOpen && receiptId) {
      loadReceipt();
    }
  }, [isOpen, receiptId]);

  const loadReceipt = async () => {
    try {
      const receiptData = await fetchReceipt(receiptId);
      setReceipt(receiptData);
    } catch (error) {
      console.error('Error loading receipt:', error);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadReceipt(receiptId);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `receipt-${receipt?.receiptNumber || receiptId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const handleEmailReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAddress) return;

    try {
      await emailReceipt(receiptId, emailAddress);
      setShowEmailForm(false);
      setEmailAddress('');
      alert('Receipt sent successfully!');
    } catch (error) {
      console.error('Error emailing receipt:', error);
      alert('Error sending receipt. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error || 'Receipt not found'}</p>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl my-8 text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Receipt Details</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEmailForm(true)}>
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Email Form */}
          {showEmailForm && (
            <div className="p-6 border-b border-gray-200 bg-gray-50 print:hidden">
              <form onSubmit={handleEmailReceipt} className="flex items-center space-x-3">
                <div className="flex-1">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowEmailForm(false)}>
                  Cancel
                </Button>
              </form>
            </div>
          )}

          {/* Receipt Content */}
          <div className="p-8 print:p-4">
            {/* Company Header */}
            <div className="text-center mb-8 print:mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Behavioral Learning Platform</h1>
              <p className="text-gray-600">Educational Services Receipt</p>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 print:mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Receipt Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Receipt Number:</span>
                    <span className="font-mono font-medium">{receipt.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span>{formatDate(receipt.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs">{receipt.transactionId}</span>
                  </div>
                </div>
              </div>

              {receipt.billingAddress && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Billing Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{receipt.billingAddress.street}</p>
                    <p>{receipt.billingAddress.city}, {receipt.billingAddress.state} {receipt.billingAddress.postalCode}</p>
                    <p>{receipt.billingAddress.country}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Itemized Charges */}
            <div className="mb-8 print:mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Itemized Charges</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Description
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-4 py-2 text-right text-sm font-medium text-gray-700">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.itemizedCharges.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-4 py-2 text-sm text-gray-900">
                          {item.description}
                          <div className="text-xs text-gray-500 capitalize">
                            {item.type.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900">
                          {formatCurrency(item.unitPrice, receipt.currency)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right text-sm text-gray-900 font-medium">
                          {formatCurrency(item.totalPrice, receipt.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8 print:mb-4">
              <div className="w-64">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(receipt.subtotal, receipt.currency)}</span>
                  </div>
                  {receipt.tax && receipt.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatCurrency(receipt.tax, receipt.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-300">
                    <span>Total:</span>
                    <span>{formatCurrency(receipt.totalAmount, receipt.currency)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-8 print:mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Payment Method</h3>
              <p className="text-sm text-gray-600">{receipt.paymentMethod}</p>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
              <p>Thank you for using Behavioral Learning Platform!</p>
              <p>For questions about this receipt, please contact our support team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};