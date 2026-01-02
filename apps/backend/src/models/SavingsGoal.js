import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class SavingsGoal {
  static async create(userId, data) {
    const id = uuidv4();
    const { name, targetAmount, targetDate, priority } = data;
    const result = await db.query(
      'INSERT INTO savings_goals (id, user_id, name, target_amount, target_date, priority) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, userId, name, targetAmount, targetDate, priority]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await db.query('SELECT * FROM savings_goals WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const { name, targetAmount, currentAmount, targetDate, priority, status } = data;
    const result = await db.query(
      `UPDATE savings_goals
       SET name = COALESCE($3, name),
           target_amount = COALESCE($4, target_amount),
           current_amount = COALESCE($5, current_amount),
           target_date = COALESCE($6, target_date),
           priority = COALESCE($7, priority),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, name, targetAmount, currentAmount, targetDate, priority, status]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query('DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    return result.rows[0];
  }

  static async addContribution(goalId, amount, description, contributionDate) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO goal_contributions (id, goal_id, amount, description, contribution_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, goalId, amount, description, contributionDate]
    );

    // Update current amount in savings goal
    await db.query(
      'UPDATE savings_goals SET current_amount = current_amount + $1 WHERE id = $2',
      [amount, goalId]
    );

    return result.rows[0];
  }

  static async getContributions(goalId) {
    const result = await db.query(
      'SELECT * FROM goal_contributions WHERE goal_id = $1 ORDER BY contribution_date DESC',
      [goalId]
    );
    return result.rows;
  }
}

export default SavingsGoal;