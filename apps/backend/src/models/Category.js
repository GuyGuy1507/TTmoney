import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Category {
  static async create(userId, name, icon, color, isDefault = false) {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO categories (id, user_id, name, icon, color, is_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, userId, name, icon, color, isDefault]
    );
    return result.rows[0];
  }

  static async findById(id, userId) {
    const result = await db.query('SELECT * FROM categories WHERE id = $1 AND user_id = $2', [id, userId]);
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM categories WHERE user_id = $1 ORDER BY is_default DESC, name ASC',
      [userId]
    );
    return result.rows;
  }

  static async update(id, userId, data) {
    const { name, icon, color } = data;
    const result = await db.query(
      `UPDATE categories 
       SET name = COALESCE($3, name),
           icon = COALESCE($4, icon),
           color = COALESCE($5, color)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId, name, icon, color]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await db.query('DELETE FROM categories WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    return result.rows[0];
  }

  static async getDefaultCategories(userId) {
    const result = await db.query('SELECT * FROM categories WHERE user_id = $1 AND is_default = true', [userId]);
    return result.rows;
  }
}

export default Category;
