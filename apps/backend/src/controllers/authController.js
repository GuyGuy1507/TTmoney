import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Category from '../models/Category.js';
import IncomeSource from '../models/IncomeSource.js';

// Default categories for new users
const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍽️', color: '#ff6b6b', isDefault: true },
  { name: 'Transportation', icon: '🚗', color: '#4ecdc4', isDefault: true },
  { name: 'Shopping', icon: '🛍️', color: '#ffe66d', isDefault: true },
  { name: 'Entertainment', icon: '🎬', color: '#95e1d3', isDefault: true },
  { name: 'Bills & Utilities', icon: '📄', color: '#c7ceea', isDefault: true },
  { name: 'Health & Medical', icon: '⚕️', color: '#ff9ff3', isDefault: true },
  { name: 'Other', icon: '📌', color: '#gray', isDefault: true },
];

// Default income sources for new users
const DEFAULT_INCOME_SOURCES = [
  { name: 'Salary', icon: '💼', color: '#10b981' },
  { name: 'Freelance', icon: '💻', color: '#3b82f6' },
  { name: 'Investment', icon: '📈', color: '#f59e0b' },
  { name: 'Business', icon: '🏢', color: '#8b5cf6' },
  { name: 'Other', icon: '💰', color: '#gray' },
];

export const register = async (req, res) => {
  try {
    const { email, password, currency = 'USD', timezone = 'UTC' } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create(email, passwordHash, currency, timezone);

    // Create default categories for the user
    for (const cat of DEFAULT_CATEGORIES) {
      await Category.create(user.id, cat.name, cat.icon, cat.color, cat.isDefault);
    }

    // Create default income sources for the user
    for (const source of DEFAULT_INCOME_SOURCES) {
      await IncomeSource.create(user.id, source.name, source.color, source.icon);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, currency: user.currency, timezone: user.timezone },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, currency: user.currency, timezone: user.timezone },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { currency, timezone, profilePicture } = req.body;
    const user = await User.updateProfile(req.userId, { currency, timezone, profilePicture });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
