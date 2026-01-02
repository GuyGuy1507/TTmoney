import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class IncomeSource {
  static async create(userId, name, color = '#10b981', icon = '💰') {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO income_sources (id, user_id, name, color, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, userId, name, color, icon]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query('SELECT * FROM income_sources WHERE user_id = $1 ORDER BY name', [userId]);
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await db.query('SELECT * FROM income_sources WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const { name, color, icon } = data;
    const result = await db.query(
      `UPDATE income_sources
       SET name = COALESCE($3, name),
           color = COALESCE($4, color),
           icon = COALESCE($5, icon)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, name, color, icon]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query('DELETE FROM income_sources WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    return result.rows[0];
  }
}

export default IncomeSource;