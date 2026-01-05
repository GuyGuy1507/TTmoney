'use client';

import { useState, useEffect } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import apiClient from '@/lib/apiClient';
import { FiTarget, FiPlus, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface SavingsGoal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

interface Contribution {
  id: string;
  amount: number;
  description?: string;
  contribution_date: string;
  created_at: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddContribution, setShowAddContribution] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newGoal, setNewGoal] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'general',
    priority: 'medium'
  });

  const [newContribution, setNewContribution] = useState({
    amount: '',
    description: '',
    contributionDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await apiClient.get('/api/savings-goals');
      setGoals(response.data.goals);
    } catch (error) {
      console.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  const loadContributions = async (goalId: string) => {
    try {
      const response = await apiClient.get(`/api/savings-goals/${goalId}/contributions`);
      setContributions(response.data.contributions);
    } catch (error) {
      console.error('Failed to load contributions');
    }
  };

  const addGoal = async () => {
    if (!newGoal.name || !newGoal.targetAmount) return;

    try {
      await apiClient.post('/api/savings-goals', {
        name: newGoal.name,
        targetAmount: parseFloat(newGoal.targetAmount),
        targetDate: newGoal.targetDate || null,
        priority: newGoal.priority
      });

      setNewGoal({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        category: 'general',
        priority: 'medium'
      });
      setShowAddGoal(false);
      loadGoals();
    } catch (error) {
      console.error('Failed to add goal');
    }
  };

  const addContribution = async () => {
    if (!selectedGoal || !newContribution.amount) return;

    try {
      await apiClient.post(`/api/savings-goals/${selectedGoal.id}/contributions`, {
        amount: parseFloat(newContribution.amount),
        description: newContribution.description,
        contributionDate: newContribution.contributionDate
      });

      setNewContribution({
        amount: '',
        description: '',
        contributionDate: new Date().toISOString().split('T')[0]
      });
      setShowAddContribution(false);
      loadGoals();
      loadContributions(selectedGoal.id);
    } catch (error) {
      console.error('Failed to add contribution');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;

    try {
      await apiClient.delete(`/api/savings-goals/${goalId}`);
      loadGoals();
      if (selectedGoal?.id === goalId) {
        setSelectedGoal(null);
      }
    } catch (error) {
      console.error('Failed to delete goal');
    }
  };

  const selectGoal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    loadContributions(goal.id);
  };

  const getProgressPercentage = (goal: SavingsGoal) => {
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading goals...</div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Savings Goals</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Set and track your financial goals</p>
          </div>
          <button
            onClick={() => setShowAddGoal(true)}
            className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition self-start sm:self-auto"
          >
            <FiPlus size={18} />
            <span>Add Goal</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List */}
          <div className="lg:col-span-2 space-y-4">
            {goals.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FiTarget size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
                <p className="text-gray-600 mb-4">Create your first savings goal to start building wealth</p>
                <button
                  onClick={() => setShowAddGoal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Create Your First Goal
                </button>
              </div>
            ) : (
              goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-lg shadow p-6 cursor-pointer transition ${
                    selectedGoal?.id === goal.id ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'
                  }`}
                  onClick={() => selectGoal(goal)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-start space-x-3">
                      <FiTarget size={24} className="text-blue-500 mt-1" />
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{goal.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{goal.description}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium self-start ${
                      goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                      goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {goal.priority}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">${Number(goal.current_amount || 0).toFixed(2)} / ${Number(goal.target_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage(goal)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{getProgressPercentage(goal).toFixed(1)}% complete</span>
                      {goal.target_date && (
                        <span className="flex items-center space-x-1">
                          <FiCalendar size={14} />
                          <span>{getDaysRemaining(goal.target_date)} days left</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Goal Details */}
          <div className="space-y-4">
            {selectedGoal ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Goal Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Target Amount</span>
                      <span className="font-medium">${Number(selectedGoal.target_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Amount</span>
                      <span className="font-medium">${Number(selectedGoal.current_amount || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span className="font-medium">${(Number(selectedGoal.target_amount || 0) - Number(selectedGoal.current_amount || 0)).toFixed(2)}</span>
                    </div>
                    {selectedGoal.target_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target Date</span>
                        <span className="font-medium">{new Date(selectedGoal.target_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => setShowAddContribution(true)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition"
                    >
                      Add Contribution
                    </button>
                    <button
                      onClick={() => deleteGoal(selectedGoal.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm transition"
                    >
                      Delete Goal
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Contributions</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {contributions.length === 0 ? (
                      <p className="text-gray-600 text-sm">No contributions yet</p>
                    ) : (
                      contributions.slice(0, 5).map((contribution) => (
                        <div key={contribution.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                          <div>
                            <p className="font-medium">${Number(contribution.amount || 0).toFixed(2)}</p>
                            <p className="text-sm text-gray-600">{contribution.description || 'No description'}</p>
                          </div>
                          <span className="text-sm text-gray-500">{new Date(contribution.contribution_date).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <FiTrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Goal</h3>
                <p className="text-gray-600">Click on a savings goal to view details and add contributions</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Goal Modal */}
        {showAddGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Savings Goal</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Goal name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <input
                  type="number"
                  placeholder="Target amount"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={addGoal}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                >
                  Add Goal
                </button>
                <button
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Contribution Modal */}
        {showAddContribution && selectedGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add Contribution to {selectedGoal.name}</h3>
              <div className="space-y-4">
                <input
                  type="number"
                  placeholder="Contribution amount"
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({ ...newContribution, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newContribution.description}
                  onChange={(e) => setNewContribution({ ...newContribution, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <input
                  type="date"
                  value={newContribution.contributionDate}
                  onChange={(e) => setNewContribution({ ...newContribution, contributionDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={addContribution}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                >
                  Add Contribution
                </button>
                <button
                  onClick={() => setShowAddContribution(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}