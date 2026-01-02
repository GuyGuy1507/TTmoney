import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Budget {
  static async create(userId, categoryId, amount, period = 'monthly', alertThreshold = 0.80, startDate = null) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO budgets (id, user_id, category_id, amount, period, start_date, alert_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, userId, categoryId, amount, period, startDate, alertThreshold]
    );
    return result.rows[0];
  }

  static async findById(id, userId) {
    const result = await db.query('SELECT * FROM budgets WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      `SELECT b.*, c.name as category_name, c.color as category_color
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  static async update(id, userId, data) {
    const { amount, period, alertThreshold } = data;
    const result = await db.query(
      `UPDATE budgets 
       SET amount = COALESCE($3, amount),
           period = COALESCE($4, period),
           alert_threshold = COALESCE($5, alert_threshold)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, amount, period, alertThreshold]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query('DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    return result.rows[0];
  }

  static async getBudgetStatus(userId, categoryId, year, month) {
    const budget = await db.query(
      'SELECT amount FROM budgets WHERE user_id = $1 AND category_id = $2',
      [userId, categoryId]
    );

    const spent = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses 
       WHERE user_id = $1 AND category_id = $2
       AND EXTRACT(YEAR FROM date) = $3 AND EXTRACT(MONTH FROM date) = $4`,
      [userId, categoryId, year, month]
    );

    if (budget.rows.length === 0) {
      return { budgeted: null, spent: spent.rows[0].total, remaining: null, percentage: null };
    }

    const budgeted = budget.rows[0].amount;
    const spentAmount = spent.rows[0].total;
    const remaining = budgeted - spentAmount;
    const percentage = Math.round((spentAmount / budgeted) * 100);

    return { budgeted, spent: spentAmount, remaining, percentage };
  }

  static async getTotalMonthlyBudget(userId, year, month) {
    const result = await db.query(
      'SELECT COALESCE(SUM(amount), 0) as total FROM budgets WHERE user_id = $1',
      [userId]
    );
    return result.rows[0].total;
  }
}

export default Budget;
