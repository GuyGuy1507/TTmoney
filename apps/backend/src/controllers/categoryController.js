import Category from '../models/Category.js';

export const createCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;

    if (!name || !icon || !color) {
      return res.status(400).json({ error: 'name, icon, and color are required' });
    }

    const category = await Category.create(req.userId, name, icon, color, false);

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req, res) => {
  try {
    let categories = await Category.findByUserId(req.userId);

    // If no categories exist, create default ones
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Food & Dining', icon: '🍽️', color: '#ff6b6b', isDefault: true },
        { name: 'Transportation', icon: '🚗', color: '#4ecdc4', isDefault: true },
        { name: 'Shopping', icon: '🛍️', color: '#ffe66d', isDefault: true },
        { name: 'Entertainment', icon: '🎬', color: '#95e1d3', isDefault: true },
        { name: 'Bills & Utilities', icon: '📄', color: '#c7ceea', isDefault: true },
        { name: 'Health & Medical', icon: '⚕️', color: '#ff9ff3', isDefault: true },
        { name: 'Other', icon: '📌', color: '#a4b0be', isDefault: true },
      ];

      for (const cat of defaultCategories) {
        await Category.create(req.userId, cat.name, cat.icon, cat.color, cat.isDefault);
      }

      categories = await Category.findByUserId(req.userId);
    }

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id, req.userId);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const category = await Category.findById(id, req.userId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Prevent updating default categories
    if (category.is_default && data.name) {
      return res.status(403).json({ error: 'Cannot modify default categories' });
    }

    const updatedCategory = await Category.update(id, req.userId, data);
    res.json({
      message: 'Category updated successfully',
      category: updatedCategory,
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id, req.userId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category.is_default) {
      return res.status(403).json({ error: 'Cannot delete default categories' });
    }

    await Category.delete(id, req.userId);
    res.json({ message: 'Category deleted successfully', id });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
