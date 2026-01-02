import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Income {
  static async create(userId, sourceId, amount, description, date, recurring = false) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO incomes (id, user_id, source_id, amount, description, date, is_recurring) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, userId, sourceId, amount, description, date, recurring]
    );
    return result.rows[0];
  }

  static async findById(id, userId) {
    const result = await db.query('SELECT * FROM incomes WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  static async findByUserId(userId, limit = 50, offset = 0) {
    const result = await db.query(
      `SELECT i.*, s.name as source_name, s.color as source_color, s.icon as source_icon
       FROM incomes i
       JOIN income_sources s ON i.source_id = s.id
       WHERE i.user_id = $1
       ORDER BY i.date DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async findByMonth(userId, year, month) {
    const result = await db.query(
      `SELECT i.*, s.name as source_name, s.color as source_color, s.icon as source_icon
       FROM incomes i
       JOIN income_sources s ON i.source_id = s.id
       WHERE i.user_id = $1
       AND EXTRACT(YEAR FROM i.date) = $2
       AND EXTRACT(MONTH FROM i.date) = $3
       ORDER BY i.date DESC`,
      [userId, year, month]
    );
    return result.rows;
  }

  static async update(id, userId, data) {
    const { amount, description, date, sourceId } = data;
    const result = await db.query(
      `UPDATE incomes
       SET amount = COALESCE($3, amount),
           description = COALESCE($4, description),
           date = COALESCE($5, date),
           source_id = COALESCE($6, source_id)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, amount, description, date, sourceId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query('DELETE FROM incomes WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    return result.rows[0];
  }

  static async getTotalBySource(userId, year, month) {
    const result = await db.query(
      `SELECT s.id, s.name, s.color, SUM(i.amount) as total
       FROM incomes i
       JOIN income_sources s ON i.source_id = s.id
       WHERE i.user_id = $1
       AND EXTRACT(YEAR FROM i.date) = $2
       AND EXTRACT(MONTH FROM i.date) = $3
       GROUP BY s.id, s.name, s.color
       ORDER BY total DESC`,
      [userId, year, month]
    );
    return result.rows;
  }

  static async getMonthlyTotal(userId, year, month) {
    const result = await db.query(
      `SELECT SUM(amount) as total FROM incomes
       WHERE user_id = $1
       AND EXTRACT(YEAR FROM date) = $2
       AND EXTRACT(MONTH FROM date) = $3`,
      [userId, year, month]
    );
    return result.rows[0]?.total || 0;
  }
}

export default Income;