import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface TransactionFiltersProps {
  filters: {
    status: string;
    type: string;
    dateFrom: string;
    dateTo: string;
    minAmount: string;
    maxAmount: string;
  };
  onFiltersChange: (filters: any) => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      type: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'disputed', label: 'Disputed' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'session_payment', label: 'Session Payment' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'refund', label: 'Refund' },
    { value: 'fee', label: 'Fee' }
  ];

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Filter Transactions</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Type
          </label>
          <Select
            value={filters.type}
            onChange={(value) => handleFilterChange('type', value)}
            options={typeOptions}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            From Date
          </label>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            To Date
          </label>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Min Amount
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Max Amount
          </label>
          <Input
            type="number"
            step="0.01"
            placeholder="1000.00"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Active filters:</span>
          {filters.status && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
            </span>
          )}
          {filters.type && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Type: {typeOptions.find(opt => opt.value === filters.type)?.label}
            </span>
          )}
          {filters.dateFrom && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              From: {filters.dateFrom}
            </span>
          )}
          {filters.dateTo && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              To: {filters.dateTo}
            </span>
          )}
          {filters.minAmount && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Min: ${filters.minAmount}
            </span>
          )}
          {filters.maxAmount && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Max: ${filters.maxAmount}
            </span>
          )}
        </div>
      )}
    </div>
  );
};