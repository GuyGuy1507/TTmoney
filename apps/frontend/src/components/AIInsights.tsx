'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { generateFinancialInsights } from '@/lib/ai';
import useAuthStore from '@/store/authStore';

interface Insight {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  icon: string;
}

interface AIInsightsProps {
  refreshTrigger?: number;
}

export default function AIInsights({ refreshTrigger }: AIInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((state: any) => state.user);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);

        // Get current month's data
        const [summaryResponse, expensesResponse] = await Promise.all([
          apiClient.get('/reports/summary'),
          apiClient.get('/expenses')
        ]);

        const summary = summaryResponse.data;
        const expenses = expensesResponse.data.expenses || [];

        // Generate AI insights
        const aiInsights = generateFinancialInsights(
          expenses,
          summary.monthlyIncome,
          summary.monthlyExpenses
        );

        setInsights(aiInsights.slice(0, 3)); // Show top 3 insights
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        setInsights([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInsights();
    }
  }, [refreshTrigger, user]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI Financial Insights
        </h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        <span className="mr-2">🤖</span>
        AI Financial Insights
      </h3>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-2xl mb-2 block">📊</span>
          Add more expenses to get personalized insights
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${getTypeStyles(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-lg">{insight.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{insight.title}</h4>
                  <p className="text-sm mt-1 opacity-90">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        💡 Powered by free AI analysis
      </div>
    </div>
  );
}