import SavingsGoal from '../models/SavingsGoal.js';

export const getSavingsGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.findByUserId(req.userId);
    res.json({ goals });
  } catch (error) {
    console.error('Get savings goals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSavingsGoal = async (req, res) => {
  try {
    const { name, targetAmount, targetDate, priority } = req.body;

    if (!name || !targetAmount) {
      return res.status(400).json({ error: 'Name and target amount are required' });
    }

    if (targetAmount <= 0) {
      return res.status(400).json({ error: 'Target amount must be positive' });
    }

    const goal = await SavingsGoal.create(req.userId, {
      name,
      targetAmount,
      targetDate,
      priority
    });

    res.status(201).json({ goal });
  } catch (error) {
    console.error('Create savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const goal = await SavingsGoal.update(id, req.userId, data);
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    res.json({ goal });
  } catch (error) {
    console.error('Update savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await SavingsGoal.delete(id, req.userId);
    if (!result) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    res.json({ message: 'Savings goal deleted successfully' });
  } catch (error) {
    console.error('Delete savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addContribution = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description, contributionDate } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // Check if goal exists and belongs to user
    const goal = await SavingsGoal.findById(id, req.userId);
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const contribution = await SavingsGoal.addContribution(id, amount, description, contributionDate);
    res.status(201).json({ contribution });
  } catch (error) {
    console.error('Add contribution error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContributions = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if goal exists and belongs to user
    const goal = await SavingsGoal.findById(id, req.userId);
    if (!goal) {
      return res.status(404).json({ error: 'Savings goal not found' });
    }

    const contributions = await SavingsGoal.getContributions(id);
    res.json({ contributions });
  } catch (error) {
    console.error('Get contributions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};