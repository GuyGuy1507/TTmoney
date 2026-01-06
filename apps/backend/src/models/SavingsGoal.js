import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class SavingsGoal {
  static async create(userId, data) {
    const id = uuidv4();
    const { name, targetAmount, targetDate, priority } = data;
    const result = await db.query(
      'INSERT INTO savings_goals (id, user_id, name, target_amount, target_date, priority, current_amount) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [id, userId, name, targetAmount, targetDate, priority, 0]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    // Calculate total balance (all-time income - all-time expenses)
    const balanceResult = await db.query(`
      SELECT
        COALESCE((SELECT SUM(amount) FROM incomes WHERE user_id = $1), 0) -
        COALESCE((SELECT SUM(amount) FROM expenses WHERE user_id = $1), 0) as total_balance
    `, [userId]);

    const totalBalance = parseFloat(balanceResult.rows[0].total_balance) || 0;

    const result = await db.query('SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

    // Add calculated current_amount based on total balance
    const goals = result.rows.map(goal => ({
      ...goal,
      current_amount: totalBalance,
      progress_percentage: goal.target_amount > 0 ? Math.min((totalBalance / goal.target_amount) * 100, 100) : 0
    }));

    return goals;
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


}

export default SavingsGoal;