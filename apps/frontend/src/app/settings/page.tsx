'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import useAuthStore from '@/store/authStore';
import apiClient from '@/lib/apiClient';
import { FiUser, FiDollarSign, FiGlobe, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '@/lib/currency';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Budget {
  id: string;
  category_id: string;
  category_name: string;
  amount: number;
}

export default function SettingsPage() {
  const user = useAuthStore((state: any) => state.user);
  const [activeTab, setActiveTab] = useState<'profile' | 'categories' | 'budgets'>('profile');
  const [profileData, setProfileData] = useState({
    currency: user?.currency || 'USD',
    timezone: user?.timezone || 'UTC',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📦', color: '#3b82f6' });
  const [newBudget, setNewBudget] = useState({ categoryId: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (activeTab === 'categories') loadCategories();
    if (activeTab === 'budgets') loadBudgets();
  }, [activeTab]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await apiClient.get('/api/budgets');
      setBudgets(response.data.budgets);
    } catch (error) {
      console.error('Failed to load budgets');
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      await apiClient.put('/api/auth/profile', profileData);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) return;
    try {
      await apiClient.post('/api/categories', newCategory);
      setNewCategory({ name: '', icon: '📦', color: '#3b82f6' });
      loadCategories();
      setMessage('Category added successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Add category error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add category';
      setMessage(errorMessage);
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/api/categories/${id}`);
      loadCategories();
      setMessage('Category deleted successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete category';
      setMessage(errorMessage);
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const addBudget = async () => {
    if (!newBudget.categoryId || !newBudget.amount) return;
    try {
      await apiClient.post('/api/budgets', {
        categoryId: newBudget.categoryId,
        amount: parseFloat(newBudget.amount),
        period: 'monthly',
        alertThreshold: 80,
      });
      setNewBudget({ categoryId: '', amount: '' });
      loadBudgets();
      setMessage('Budget added successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add budget';
      setMessage(errorMessage);
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const deleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    try {
      await apiClient.delete(`/api/budgets/${id}`);
      loadBudgets();
      setMessage('Budget deleted successfully!');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete budget';
      setMessage(errorMessage);
      setMessageType('error');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        {message && (
          <div className={`px-4 py-3 rounded ${
            messageType === 'error'
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-green-100 border border-green-400 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'profile', label: 'Profile', icon: FiUser },
              { id: 'categories', label: 'Categories', icon: FiGlobe },
              { id: 'budgets', label: 'Budgets', icon: FiDollarSign },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                <select
                  value={profileData.currency}
                  onChange={(e) => setProfileData({ ...profileData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="VND">VND (₫)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <select
                  value={profileData.timezone}
                  onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Bangkok">Bangkok</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={updateProfile}
                disabled={loading}
                className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
              >
                <FiSave size={18} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Categories Management */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Manage Categories</h2>

            {/* Add New Category */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Add New Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Icon (emoji)"
                  value={newCategory.icon}
                  onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addCategory}
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <FiPlus size={18} />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Existing Categories */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Existing Categories</h3>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </div>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budgets Management */}
        {activeTab === 'budgets' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Manage Monthly Budgets</h2>

            {/* Add New Budget */}
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Add New Budget</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newBudget.categoryId}
                  onChange={(e) => setNewBudget({ ...newBudget, categoryId: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Budget amount"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addBudget}
                  className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                >
                  <FiPlus size={18} />
                  <span>Add Budget</span>
                </button>
              </div>
            </div>

            {/* Existing Budgets */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Existing Budgets</h3>
              {budgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{budget.category_name}</span>
                    <span className="text-gray-600">{formatCurrency(budget.amount, profileData.currency)}/month</span>
                  </div>
                  <button
                    onClick={() => deleteBudget(budget.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}