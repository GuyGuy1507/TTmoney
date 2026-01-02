import Expense from '../models/Expense.js';
import Category from '../models/Category.js';

export const createExpense = async (req, res) => {
  try {
    const { categoryId, amount, description, date, paymentMethod = 'cash', recurring = false } = req.body;

    if (!categoryId || !amount || !date) {
      return res.status(400).json({ error: 'categoryId, amount, and date are required' });
    }

    // Verify category belongs to user
    const category = await Category.findById(categoryId, req.userId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const expense = await Expense.create(
      req.userId,
      categoryId,
      amount,
      description || null,
      date,
      paymentMethod,
      recurring
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: { ...expense, category_name: category.name, category_color: category.color },
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const expenses = await Expense.findByUserId(req.userId, parseInt(limit), parseInt(offset));

    res.json({
      expenses,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpensesByMonth = async (req, res) => {
  try {
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'year and month are required' });
    }

    const expenses = await Expense.findByMonth(req.userId, parseInt(year), parseInt(month));
    const categoryTotals = await Expense.getTotalByCategory(req.userId, parseInt(year), parseInt(month));
    const monthlyTotal = await Expense.getMonthlyTotal(req.userId, parseInt(year), parseInt(month));

    res.json({
      expenses,
      categoryTotals,
      monthlyTotal,
      count: expenses.length,
    });
  } catch (error) {
    console.error('Get expenses by month error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findById(id, req.userId);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const expense = await Expense.findById(id, req.userId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // If updating category, verify it belongs to user
    if (data.categoryId) {
      const category = await Category.findById(data.categoryId, req.userId);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const updatedExpense = await Expense.update(id, req.userId, data);
    res.json({
      message: 'Expense updated successfully',
      expense: updatedExpense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findById(id, req.userId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    await Expense.delete(id, req.userId);
    res.json({ message: 'Expense deleted successfully', id });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
