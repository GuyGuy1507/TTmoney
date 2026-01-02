'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ExpenseForm from './ExpenseForm';
import { Plus } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const setUser = useAuthStore((state: any) => state.setUser);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('authUser');
    if (token && userData && !user) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser, token);
      } catch (e) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, [setUser, user]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Sidebar - hidden on mobile, shown on large screens */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>

      {/* Quick Add Floating Button */}
      <button
        onClick={() => setShowExpenseForm(true)}
        className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl z-50 md:bottom-8 md:right-8"
        aria-label="Add Expense"
      >
        <Plus size={24} />
      </button>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ExpenseForm onClose={() => setShowExpenseForm(false)} />
        </div>
      )}
    </div>
  );
}
