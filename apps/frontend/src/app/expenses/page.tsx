'use client';

import { useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import ExpenseList from '@/components/ExpenseList';
import ExpenseForm from '@/components/ExpenseForm';

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

export default function ExpensesPage() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
  };

  const handleFormSubmit = () => {
    setEditingExpense(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormClose = () => {
    setEditingExpense(null);
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-2">View and manage your expenses</p>
        </div>
        <ExpenseList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
        {editingExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <ExpenseForm
              editingExpense={{
                id: editingExpense.id,
                amount: editingExpense.amount,
                description: editingExpense.description,
                date: editingExpense.date,
                categoryId: editingExpense.category_id,
                paymentMethod: editingExpense.payment_method,
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