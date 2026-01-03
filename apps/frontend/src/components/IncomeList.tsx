'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import useAuthStore from '@/store/authStore';

interface Income {
  id: string;
  amount: string;
  description: string;
  date: string;
  source_name: string;
  source_icon: string;
  source_color: string;
  source_id: string;
}

interface IncomeListProps {
  refreshTrigger?: number;
  onEdit?: (income: Income) => void;
}

export default function IncomeList({ refreshTrigger, onEdit }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state: any) => state.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchIncomes();
  }, [refreshTrigger]);

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/incomes');
      setIncomes(response.data.incomes || []);
    } catch (err: any) {
      setError('Failed to load incomes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      await apiClient.delete(`/api/incomes/${id}`);
      setIncomes(incomes.filter((i) => i.id !== id));
    } catch (err: any) {
      setError('Failed to delete income');
    }
  };

  const filteredIncomes = incomes.filter(income =>
    income.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    income.source_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedIncomes = filteredIncomes.reduce((groups, income) => {
    const date = new Date(income.date);
    let dateKey = format(date, 'yyyy-MM-dd');

    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(date, 'MMMM d, yyyy');
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(income);
    return groups;
  }, {} as Record<string, Income[]>);

  if (isLoading) return <div className="text-center py-8 text-gray-600">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Income History</h2>

      {/* Search */}
      <div className="mb-6 relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search incomes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      {filteredIncomes.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          {incomes.length === 0 ? 'No incomes yet' : 'No incomes match your search'}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedIncomes).map(([dateKey, dayIncomes]) => (
            <div key={dateKey}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{dateKey}</h3>
              <AnimatePresence>
                {dayIncomes.map((income) => (
                  <motion.div
                    key={income.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition mb-2"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="inline-block px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: income.source_color }}>
                        {income.source_icon} {income.source_name}
                      </span>
                      <span className="text-gray-700">{income.description || 'No description'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-green-800">+{formatCurrency(income.amount, currency)}</span>
                      <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(income); }} className="p-2 text-blue-500 hover:text-blue-700 cursor-pointer">
                        <FiEdit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(income.id)} className="text-red-500 hover:text-red-700">
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}