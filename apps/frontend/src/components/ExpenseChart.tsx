'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from '@/hooks/useTranslation';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  data: { name: string; amount: number }[];
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  const { t } = useTranslation();
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h3 className="text-lg font-bold mb-4">{t('spendingDistribution')}</h3>
      <div className="flex justify-center">
        <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: true }} />
      </div>
    </div>
  );
}
