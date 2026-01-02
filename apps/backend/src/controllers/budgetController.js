import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';

export const createBudget = async (req, res) => {
  try {
    const { categoryId, amount, period = 'monthly', start_date, alertThreshold = 0.80 } = req.body;

    if (!categoryId || !amount) {
      return res.status(400).json({ error: 'categoryId and amount are required' });
    }

    // Verify category belongs to user
    const category = await Category.findById(categoryId, req.userId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const budget = await Budget.create(req.userId, categoryId, amount, period, alertThreshold, start_date);

    res.status(201).json({
      message: 'Budget created successfully',
      budget: { ...budget, category_name: category.name, category_color: category.color },
    });
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findByUserId(req.userId);
    res.json({ budgets, count: budgets.length });
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await Budget.findById(id, req.userId);

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const budget = await Budget.findById(id, req.userId);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    const updatedBudget = await Budget.update(id, req.userId, data);
    res.json({
      message: 'Budget updated successfully',
      budget: updatedBudget,
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const budget = await Budget.findById(id, req.userId);
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    await Budget.delete(id, req.userId);
    res.json({ message: 'Budget deleted successfully', id });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBudgetStatus = async (req, res) => {
  try {
    const { categoryId, year, month } = req.query;

    if (!categoryId || !year || !month) {
      return res.status(400).json({ error: 'categoryId, year, and month are required' });
    }

    const status = await Budget.getBudgetStatus(req.userId, categoryId, parseInt(year), parseInt(month));
    res.json(status);
  } catch (error) {
    console.error('Get budget status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getOverallBudgetStatus = async (req, res) => {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const totalBudgeted = await Budget.getTotalMonthlyBudget(req.userId, year, month);
    const totalSpent = await Expense.getMonthlyTotal(req.userId, year, month);
    const remaining = totalBudgeted - totalSpent;
    const percentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    res.json({
      budgeted: totalBudgeted,
      spent: totalSpent,
      remaining,
      percentage: Math.round(percentage * 100) / 100,
    });
  } catch (error) {
    console.error('Get overall budget status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
