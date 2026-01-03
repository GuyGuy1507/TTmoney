'use client';

import { useState, useEffect } from 'react';
import { FiX, FiZap } from 'react-icons/fi';
import apiClient from '@/lib/apiClient';
import useAuthStore from '@/store/authStore';
import { suggestCategory } from '@/lib/ai';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  paymentMethod: string;
}

interface ExpenseFormProps {
  onSubmit?: (expense: any) => void;
  onClose?: () => void;
  editingExpense?: Expense | null;
}

export default function ExpenseForm({ onSubmit, onClose, editingExpense }: ExpenseFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const user = useAuthStore((state: any) => state.user);
  const currency = user?.currency || 'USD';
  const step = currency === 'VND' ? '1' : '0.01';
  const [aiSuggestion, setAiSuggestion] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [editingExpense]);

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        categoryId: editingExpense.categoryId,
        amount: editingExpense.amount,
        description: editingExpense.description,
        date: editingExpense.date.split('T')[0], // Format date
        paymentMethod: editingExpense.paymentMethod,
      });
    }
  }, [editingExpense]);

  // AI categorization suggestion
  useEffect(() => {
    if (formData.description && categories.length > 0) {
      const suggestion = suggestCategory(formData.description, categories);
      setAiSuggestion(suggestion);
    } else {
      setAiSuggestion(null);
    }
  }, [formData.description, categories]);

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data.categories);
      if (response.data.categories.length > 0 && !editingExpense) {
        setFormData((prev) => ({ ...prev, categoryId: response.data.categories[0].id }));
      }
    } catch (err: any) {
      setError('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      setIsLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (editingExpense) {
        response = await apiClient.put(`/api/expenses/${editingExpense.id}`, {
          categoryId: formData.categoryId,
          amount,
          description: formData.description,
          date: formData.date,
          paymentMethod: formData.paymentMethod,
        });
        setSuccessMessage('Expense updated successfully!');
      } else {
        response = await apiClient.post('/api/expenses', {
          categoryId: formData.categoryId,
          amount,
          description: formData.description,
          date: formData.date,
          paymentMethod: formData.paymentMethod,
        });
        setSuccessMessage('Expense added successfully!');
      }

      if (onSubmit) onSubmit(response.data.expense);

      // Clear only amount and description, keep category and date for convenience
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: '',
      }));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${editingExpense ? 'update' : 'add'} expense`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Category</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Amount</label>
          <input
            type="number"
            step={step}
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={currency === 'VND' ? '0' : '0.00'}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional description"
          />
          {aiSuggestion && aiSuggestion.id !== formData.categoryId && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiZap className="text-blue-500" size={16} />
                <span className="text-sm text-blue-700">
                  AI suggests: <span className="font-semibold">{aiSuggestion.icon} {aiSuggestion.name}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, categoryId: aiSuggestion.id })}
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Payment Method</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
        >
          {isLoading ? (editingExpense ? 'Updating...' : 'Adding...') : (editingExpense ? 'Update Expense' : 'Add Expense')}
        </button>
      </form>
    </div>
  );
}
