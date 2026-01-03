'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { FiTrash2, FiEdit2, FiSearch } from 'react-icons/fi';
import { format, isToday, isYesterday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/lib/currency';
import useAuthStore from '@/store/authStore';

interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  category_name: string;
  category_color: string;
  category_id: string;
  payment_method: string;
}

interface ExpenseListProps {
  refreshTrigger?: number;
  onEdit?: (expense: Expense) => void;
}

export default function ExpenseList({ refreshTrigger, onEdit }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore((state: any) => state.user);
  const currency = user?.currency || 'USD';

  useEffect(() => {
    fetchExpenses();
  }, [refreshTrigger]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/api/expenses');
      setExpenses(response.data.expenses || []);
    } catch (err: any) {
      setError('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      await apiClient.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (err: any) {
      setError('Failed to delete expense');
    }
  };

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const date = new Date(expense.date);
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
    groups[dateKey].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);

  if (isLoading) return <div className="text-center py-8 text-gray-600">Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>

      {/* Search */}
      <div className="mb-6 relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      {filteredExpenses.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          {expenses.length === 0 ? 'No expenses yet' : 'No expenses match your search'}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedExpenses).map(([dateKey, dayExpenses]) => (
            <div key={dateKey}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{dateKey}</h3>
              <AnimatePresence>
                {dayExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition mb-2"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="inline-block px-3 py-1 rounded-full text-white text-sm" style={{ backgroundColor: expense.category_color }}>
                        {expense.category_name}
                      </span>
                      <span className="text-gray-700">{expense.description || 'No description'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{formatCurrency(expense.amount, currency)}</span>
                      <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(expense); }} className="p-2 text-blue-500 hover:text-blue-700 cursor-pointer">
                        <FiEdit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-700">
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
