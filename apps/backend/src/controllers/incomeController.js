import Income from '../models/Income.js';
import IncomeSource from '../models/IncomeSource.js';

export const getIncomes = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const incomes = await Income.findByUserId(req.userId, parseInt(limit), parseInt(offset));
    res.json({ incomes });
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIncome = async (req, res) => {
  try {
    const { sourceId, amount, description, date } = req.body;

    if (!sourceId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Source, amount are required and amount must be positive' });
    }

    const income = await Income.create(req.userId, sourceId, amount, description || '', date);
    res.status(201).json({ income });
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { sourceId, amount, description, date } = req.body;

    if (amount && amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    const income = await Income.update(id, req.userId, { sourceId, amount, description, date });
    if (!income) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ income });
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Income.delete(id, req.userId);
    if (!result) {
      return res.status(404).json({ error: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const DEFAULT_INCOME_SOURCES = [
  { name: 'Salary', icon: '💼', color: '#10b981' },
  { name: 'Freelance', icon: '💻', color: '#3b82f6' },
  { name: 'Investment', icon: '📈', color: '#f59e0b' },
  { name: 'Business', icon: '🏢', color: '#8b5cf6' },
  { name: 'Other', icon: '💰', color: '#gray' },
];

export const getIncomeSources = async (req, res) => {
  try {
    let sources = await IncomeSource.findByUserId(req.userId);

    // If no sources exist, create defaults
    if (sources.length === 0) {
      console.log(`Creating default income sources for user ${req.userId}`);
      for (const source of DEFAULT_INCOME_SOURCES) {
        await IncomeSource.create(req.userId, source.name, source.color, source.icon);
      }
      sources = await IncomeSource.findByUserId(req.userId);
    }

    res.json({ sources });
  } catch (error) {
    console.error('Get income sources error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIncomeSource = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const source = await IncomeSource.create(req.userId, name, color, icon);
    res.status(201).json({ source });
  } catch (error) {
    console.error('Create income source error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateIncomeSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, icon } = req.body;

    const source = await IncomeSource.update(id, req.userId, { name, color, icon });
    if (!source) {
      return res.status(404).json({ error: 'Income source not found' });
    }

    res.json({ source });
  } catch (error) {
    console.error('Update income source error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteIncomeSource = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await IncomeSource.delete(id, req.userId);
    if (!result) {
      return res.status(404).json({ error: 'Income source not found' });
    }

    res.json({ message: 'Income source deleted successfully' });
  } catch (error) {
    console.error('Delete income source error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};