'use client';

import { useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import IncomeList from '@/components/IncomeList';
import IncomeForm from '@/components/IncomeForm';

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

export default function IncomesPage() {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
  };

  const handleFormSubmit = () => {
    setEditingIncome(null);
    setShowIncomeForm(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormClose = () => {
    setEditingIncome(null);
    setShowIncomeForm(false);
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
            <p className="text-gray-600 mt-2">Track and manage your income sources</p>
          </div>
          <button
            onClick={() => setShowIncomeForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + Add Income
          </button>
        </div>

        {showIncomeForm && (
          <div className="flex justify-center">
            <IncomeForm onSubmit={handleFormSubmit} onClose={handleFormClose} editingIncome={null} />
          </div>
        )}

        <IncomeList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
        {editingIncome && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <IncomeForm
              editingIncome={{
                id: editingIncome.id,
                sourceId: editingIncome.source_id,
                amount: editingIncome.amount,
                description: editingIncome.description,
                date: editingIncome.date,
              }}
              onSubmit={handleFormSubmit}
              onClose={handleFormClose}
            />
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}