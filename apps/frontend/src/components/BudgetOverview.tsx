'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { formatCurrency } from '@/lib/currency';
import useAuthStore from '@/store/authStore';

interface BudgetStatus {
  budgeted: number;
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetOverviewProps {
  refreshTrigger?: number;
}

export default function BudgetOverview({ refreshTrigger }: BudgetOverviewProps) {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state: any) => state.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchBudgetStatus();
  }, [refreshTrigger]);

  const fetchBudgetStatus = async () => {
    try {
      const response = await apiClient.get('/api/budgets/overall/status');
      setBudgetStatus(response.data);
    } catch (error) {
      console.error('Failed to load budget status');
      // Set default values
      setBudgetStatus({
        budgeted: 0,
        spent: 0,
        remaining: 0,
        percentage: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  const isExceeded = budgetStatus && budgetStatus.percentage > 80;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Budget</h2>

      {!budgetStatus || budgetStatus.budgeted === 0 ? (
        <div className="text-center py-8 text-gray-600">
          No monthly budget set. Set a budget to track your spending.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Monthly Budget</h3>
              <span className={`text-sm font-bold ${isExceeded ? 'text-red-600' : 'text-green-600'}`}>
                {budgetStatus.percentage.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${isExceeded ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${Math.min(budgetStatus.percentage, 100)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>Spent: {formatCurrency(budgetStatus.spent || 0, currency)}</span>
              <span>Budget: {formatCurrency(budgetStatus.budgeted || 0, currency)}</span>
            </div>

            <div className="mt-2 text-sm text-gray-500">
              {budgetStatus.remaining >= 0 ? (
                <span>You have {formatCurrency(budgetStatus.remaining, currency)} left this month</span>
              ) : (
                <span className="text-red-600">You have exceeded your budget by {formatCurrency(Math.abs(budgetStatus.remaining), currency)}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
