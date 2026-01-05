'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import apiClient from '@/lib/apiClient';
import { FiTrendingUp, FiTrendingDown, FiBarChart, FiPieChart } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendData {
  period: string;
  total: number;
  transactionCount: number;
  averageTransaction: number;
}

interface CategoryData {
  id: string;
  name: string;
  color: string;
  total: number;
  percentage: number;
}

interface ComparisonData {
  current: {
    year: number;
    month: number;
    total: number;
    transactionCount: number;
    averageTransaction: number;
  };
  previous: {
    year: number;
    month: number;
    total: number;
    transactionCount: number;
    averageTransaction: number;
  };
  change: {
    amount: number;
    percentage: number;
    transactionChange: number;
  };
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'trends' | 'categories' | 'comparison'>('trends');
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'3' | '6' | '12'>('6');

  useEffect(() => {
    loadData();
  }, [activeTab, period]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'trends') {
        const response = await apiClient.get(`/api/reports/expense-trends?months=${period}`);
        setTrendsData(response.data.trends);
      } else if (activeTab === 'categories') {
        const response = await apiClient.get('/api/reports/category-analytics');
        setCategoryData(response.data.categories);
      } else if (activeTab === 'comparison') {
        const response = await apiClient.get('/api/reports/monthly-comparison');
        setComparisonData(response.data);
      }
    } catch (error) {
      console.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: trendsData.map(item => item.period),
    datasets: [
      {
        label: t('monthlyExpenses'),
        data: trendsData.map(item => item.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Expense Trends - Last ${period} Months`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const item = trendsData[context.dataIndex];
            return [
              `Total: $${Number(context.parsed.y).toFixed(2)}`,
              `Transactions: ${item.transactionCount}`,
              `Average: $${Number(item.averageTransaction).toFixed(2)}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">{t('loadingAnalytics')}</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('analyticsInsights')}</h1>
          <p className="text-gray-600 mt-2">{t('analyzePatterns')}</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'trends', label: t('expenseTrends'), icon: FiTrendingUp },
              { id: 'categories', label: t('categoryAnalysis'), icon: FiPieChart },
              { id: 'comparison', label: t('monthComparison'), icon: FiBarChart },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl font-semibold">{t('expenseTrends')}</h2>
                <div className="flex items-center space-x-4 self-start sm:self-auto">
                  <span className="text-sm text-gray-600">Period:</span>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as '3' | '6' | '12')}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="3">Last 3 Months</option>
                    <option value="6">Last 6 Months</option>
                    <option value="12">Last 12 Months</option>
                  </select>
                </div>
              </div>
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendsData.slice(-3).map((item, index) => (
                <div key={item.period} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{item.period}</p>
                      <p className="text-2xl font-bold text-gray-900">${Number(item.total || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{item.transactionCount} transactions</p>
                    </div>
                    {index > 0 && (
                      <div className={`flex items-center ${item.total > trendsData[index - 1]?.total ? 'text-red-500' : 'text-green-500'}`}>
                        {item.total > trendsData[index - 1]?.total ? <FiTrendingUp size={20} /> : <FiTrendingDown size={20} />}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">{t('spendingByCategory')}</h2>
            <div className="space-y-4">
              {categoryData.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-semibold">${Number(category.total || 0).toFixed(2)}</span>
                    <span className="text-sm text-gray-600">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && comparisonData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{t('currentMonth')}</h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">${Number(comparisonData.current.total || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{comparisonData.current.transactionCount} transactions</p>
                  <p className="text-sm text-gray-500">Avg: ${Number(comparisonData.current.averageTransaction || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">{t('previousMonth')}</h3>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-gray-900">${Number(comparisonData.previous.total || 0).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">{comparisonData.previous.transactionCount} transactions</p>
                  <p className="text-sm text-gray-500">Avg: ${Number(comparisonData.previous.averageTransaction || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{t('monthOverMonthChange')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className={`text-2xl font-bold ${comparisonData.change.amount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {comparisonData.change.amount >= 0 ? '+' : ''}${Number(comparisonData.change.amount || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Amount Change</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${comparisonData.change.percentage >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {comparisonData.change.percentage >= 0 ? '+' : ''}{Number(comparisonData.change.percentage || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Percentage Change</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {comparisonData.change.transactionChange >= 0 ? '+' : ''}{comparisonData.change.transactionChange}
                  </p>
                  <p className="text-sm text-gray-600">Transaction Change</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}