import db from '../config/database.js';

class User {
  static async create(email, passwordHash, currency = 'USD', timezone = 'UTC') {
    const result = await db.query(
      'INSERT INTO users (email, password_hash, currency, timezone) VALUES ($1, $2, $3, $4) RETURNING id, email, currency, timezone',
      [email, passwordHash, currency, timezone]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query('SELECT id, email, currency, timezone, profile_picture FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateProfile(id, data) {
    const { currency, timezone, profilePicture } = data;
    const result = await db.query(
      'UPDATE users SET currency = COALESCE($2, currency), timezone = COALESCE($3, timezone), profile_picture = COALESCE($4, profile_picture) WHERE id = $1 RETURNING id, email, currency, timezone',
      [id, currency, timezone, profilePicture]
    );
    return result.rows[0];
  }
}

export default User;
