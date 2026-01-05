'use client';

import { useState, useCallback } from 'react';
import Dashboard from '@/components/Dashboard';
import ExpenseList from '@/components/ExpenseList';
import BudgetOverview from '@/components/BudgetOverview';
import ExpenseForm from '@/components/ExpenseForm';
import AIInsights from '@/components/AIInsights';
import ProtectedLayout from '@/components/ProtectedLayout';
import { useTranslation } from '@/hooks/useTranslation';

interface Expense {
  id: string;
  amount: string;
  description: string;
  date: string;
  categoryId: string;
  paymentMethod: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleExpenseAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowExpenseForm(false);
    setEditingExpense(null);
  };

  const handleEditExpense = useCallback((expense: any) => {
    setEditingExpense({
      id: expense.id,
      categoryId: expense.category_id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      paymentMethod: expense.payment_method,
    });
    setShowExpenseForm(true);
  }, []);

  return (
    <ProtectedLayout>
      <div className="grid grid-cols-1 gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h1>
          <button
            onClick={() => setShowExpenseForm(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            + {t('addExpense')}
          </button>
        </div>

        {showExpenseForm && (
          <div className="flex justify-center">
            <ExpenseForm onSubmit={handleExpenseAdded} onClose={() => { setShowExpenseForm(false); setEditingExpense(null); }} editingExpense={editingExpense} />
          </div>
        )}

        <Dashboard refreshTrigger={refreshTrigger} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BudgetOverview refreshTrigger={refreshTrigger} />
          <AIInsights refreshTrigger={refreshTrigger} />
        </div>
        <ExpenseList refreshTrigger={refreshTrigger} onEdit={handleEditExpense} />
      </div>
    </ProtectedLayout>
  );
}
