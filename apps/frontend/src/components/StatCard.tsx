'use client';

import { formatCurrency } from '@/lib/currency';
import useAuthStore from '@/store/authStore';

interface StatCardProps {
  title: string;
  amount: number;
  color: 'primary' | 'secondary' | 'danger';
  icon: string;
}

const colorClasses = {
  primary: 'bg-blue-50 text-blue-600',
  secondary: 'bg-green-50 text-green-600',
  danger: 'bg-red-50 text-red-600',
};

export default function StatCard({ title, amount, color, icon }: StatCardProps) {
  const user = useAuthStore((state: any) => state.user);
  const currency = user?.currency || 'USD';

  return (
    <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-dark mt-2">{formatCurrency(amount, currency)}</p>
        </div>
        <div className={`${colorClasses[color]} text-4xl rounded-lg p-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
