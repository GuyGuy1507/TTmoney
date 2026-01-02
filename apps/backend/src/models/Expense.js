import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Expense {
  static async create(userId, categoryId, amount, description, date, paymentMethod = 'cash', recurring = false) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO expenses (id, user_id, category_id, amount, description, date, payment_method, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [id, userId, categoryId, amount, description, date, paymentMethod, recurring]
    );
    return result.rows[0];
  }

  static async findById(id, userId) {
    const result = await db.query('SELECT * FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT e.*, c.name as category_name, c.color as category_color 
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.date DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async findByMonth(userId, year, month) {
    const result = await db.query(
      `SELECT e.*, c.name as category_name, c.color as category_color 
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1 
       AND EXTRACT(YEAR FROM e.date) = $2 
       AND EXTRACT(MONTH FROM e.date) = $3
       ORDER BY e.date DESC`,
      [userId, year, month]
    );
    return result.rows;
  }

  static async update(id, userId, data) {
    const { amount, description, date, categoryId, paymentMethod } = data;
    const result = await db.query(
      `UPDATE expenses 
       SET amount = COALESCE($3, amount), 
           description = COALESCE($4, description),
           date = COALESCE($5, date),
           category_id = COALESCE($6, category_id),
           payment_method = COALESCE($7, payment_method)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, amount, description, date, categoryId, paymentMethod]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    return result.rows[0];
  }

  static async getTotalByCategory(userId, year, month) {
    const result = await db.query(
      `SELECT c.id, c.name, c.color, SUM(e.amount) as total
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       AND EXTRACT(YEAR FROM e.date) = $2
       AND EXTRACT(MONTH FROM e.date) = $3
       GROUP BY c.id, c.name, c.color
       ORDER BY total DESC`,
      [userId, year, month]
    );
    return result.rows;
  }

  static async getMonthlyTotal(userId, year, month) {
    const result = await db.query(
      `SELECT SUM(amount) as total FROM expenses 
       WHERE user_id = $1 
       AND EXTRACT(YEAR FROM date) = $2 
       AND EXTRACT(MONTH FROM date) = $3`,
      [userId, year, month]
    );
    return result.rows[0]?.total || 0;
  }
}

export default Expense;
