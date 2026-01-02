'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import apiClient from '@/lib/apiClient';
import useAuthStore from '@/store/authStore';

interface IncomeSource {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Income {
  id: string;
  sourceId: string;
  amount: string;
  description: string;
  date: string;
}

interface IncomeFormProps {
  onSubmit?: (income: any) => void;
  onClose?: () => void;
  editingIncome?: Income | null;
}

export default function IncomeForm({ onSubmit, onClose, editingIncome }: IncomeFormProps) {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [formData, setFormData] = useState({
    sourceId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const user = useAuthStore((state: any) => state.user);
  const currency = user?.currency || 'USD';
  const step = currency === 'VND' ? '1' : '0.01';

  useEffect(() => {
    fetchSources();
  }, [editingIncome]);

  useEffect(() => {
    if (editingIncome) {
      setFormData({
        sourceId: editingIncome.sourceId,
        amount: editingIncome.amount,
        description: editingIncome.description,
        date: editingIncome.date.split('T')[0], // Format date
      });
    }
  }, [editingIncome]);

  const fetchSources = async () => {
    try {
      const response = await apiClient.get('/incomes/sources');
      setSources(response.data.sources);
      if (response.data.sources.length > 0 && !editingIncome) {
        setFormData((prev) => ({ ...prev, sourceId: response.data.sources[0].id }));
      }
    } catch (err: any) {
      setError('Failed to load income sources');
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

    if (!formData.sourceId) {
      setError('Please select an income source');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (editingIncome) {
        response = await apiClient.put(`/incomes/${editingIncome.id}`, {
          sourceId: formData.sourceId,
          amount,
          description: formData.description,
          date: formData.date,
        });
        setSuccessMessage('Income updated successfully!');
      } else {
        response = await apiClient.post('/incomes', {
          sourceId: formData.sourceId,
          amount,
          description: formData.description,
          date: formData.date,
        });
        setSuccessMessage('Income added successfully!');
      }

      if (onSubmit) onSubmit(response.data.income);

      // Clear only amount and description, keep source and date for convenience
      setFormData(prev => ({
        ...prev,
        amount: '',
        description: '',
      }));

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${editingIncome ? 'update' : 'add'} income`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{editingIncome ? 'Edit Income' : 'Add Income'}</h2>
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
          <label className="block text-gray-700 font-semibold mb-2">Income Source</label>
          <select
            value={formData.sourceId}
            onChange={(e) => setFormData({ ...formData, sourceId: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.icon} {source.name}
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
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
        >
          {isLoading ? (editingIncome ? 'Updating...' : 'Adding...') : (editingIncome ? 'Update Income' : 'Add Income')}
        </button>
      </form>
    </div>
  );
}