import db from '../src/config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const userResult = await db.query(
      'INSERT INTO users (email, password_hash, currency, timezone) VALUES ($1, $2, $3, $4) RETURNING id',
      ['test@example.com', hashedPassword, 'USD', 'UTC']
    );
    const userId = userResult.rows[0].id;
    console.log('Created test user');

    // Create default categories
    const categories = [
      { name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
      { name: 'Transportation', icon: '🚗', color: '#3b82f6' },
      { name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
      { name: 'Shopping', icon: '🛍️', color: '#f59e0b' },
      { name: 'Bills & Utilities', icon: '💡', color: '#10b981' },
      { name: 'Healthcare', icon: '🏥', color: '#ec4899' },
    ];

    for (const cat of categories) {
      await db.query(
        'INSERT INTO categories (user_id, name, icon, color) VALUES ($1, $2, $3, $4)',
        [userId, cat.name, cat.icon, cat.color]
      );
    }
    console.log('Created default categories');

    // Create income sources
    const incomeSources = [
      { name: 'Salary', icon: '💼', color: '#22c55e' },
      { name: 'Freelance', icon: '💻', color: '#3b82f6' },
      { name: 'Investments', icon: '📈', color: '#f59e0b' },
    ];

    for (const source of incomeSources) {
      await db.query(
        'INSERT INTO income_sources (user_id, name, icon, color) VALUES ($1, $2, $3, $4)',
        [userId, source.name, source.icon, source.color]
      );
    }
    console.log('Created income sources');

    // Create some sample expenses
    const expenses = [
      { categoryIndex: 0, amount: 45.50, description: 'Lunch at restaurant', date: '2024-01-15' },
      { categoryIndex: 1, amount: 25.00, description: 'Bus fare', date: '2024-01-14' },
      { categoryIndex: 2, amount: 12.99, description: 'Movie ticket', date: '2024-01-13' },
      { categoryIndex: 3, amount: 89.99, description: 'New shoes', date: '2024-01-12' },
    ];

    const categoryResults = await db.query('SELECT id FROM categories WHERE user_id = $1 ORDER BY name', [userId]);

    for (let i = 0; i < expenses.length; i++) {
      const expense = expenses[i];
      const categoryId = categoryResults.rows[expense.categoryIndex].id;
      await db.query(
        'INSERT INTO expenses (user_id, category_id, amount, description, date) VALUES ($1, $2, $3, $4, $5)',
        [userId, categoryId, expense.amount, expense.description, expense.date]
      );
    }
    console.log('Created sample expenses');

    // Ensure new tables exist (in case they weren't created)
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS income_sources (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           name VARCHAR(100) NOT NULL,
           icon VARCHAR(50),
           color VARCHAR(7),
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           UNIQUE(user_id, name)
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS incomes (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
           source_id UUID NOT NULL REFERENCES income_sources(id) ON DELETE CASCADE,
           amount DECIMAL(12, 2) NOT NULL,
           description TEXT,
           date DATE NOT NULL,
           is_recurring BOOLEAN DEFAULT FALSE,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS goal_contributions (
           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
           goal_id UUID NOT NULL REFERENCES savings_goals(id) ON DELETE CASCADE,
           amount DECIMAL(10, 2) NOT NULL,
           description TEXT,
           contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('Ensured database tables exist');
    } catch (tableError) {
      console.log('Some tables might already exist, continuing...');
    }

    // Create sample income
    try {
      const incomeResults = await db.query('SELECT id FROM income_sources WHERE user_id = $1 ORDER BY name', [userId]);
      if (incomeResults.rows.length === 0) {
        // Create income sources if they don't exist
        const sources = [
          { name: 'Salary', icon: '💼', color: '#22c55e' },
          { name: 'Freelance', icon: '💻', color: '#3b82f6' },
        ];
        for (const source of sources) {
          await db.query(
            'INSERT INTO income_sources (user_id, name, icon, color) VALUES ($1, $2, $3, $4)',
            [userId, source.name, source.icon, source.color]
          );
        }
        console.log('Created income sources');
      }

      const finalIncomeResults = await db.query('SELECT id FROM income_sources WHERE user_id = $1 ORDER BY name', [userId]);
      await db.query(
        'INSERT INTO incomes (user_id, source_id, amount, description, date) VALUES ($1, $2, $3, $4, $5)',
        [userId, finalIncomeResults.rows[0].id, 3000.00, 'Monthly salary', '2024-01-01']
      );
      console.log('Created sample income');
    } catch (incomeError) {
      console.log('Income creation failed, skipping...');
    }

    // Create a budget
    const budgetCategoryId = categoryResults.rows[0].id; // Food category
    await db.query(
      'INSERT INTO budgets (user_id, category_id, amount, period, alert_threshold) VALUES ($1, $2, $3, $4, $5)',
      [userId, budgetCategoryId, 500.00, 'monthly', 80]
    );
    console.log('Created sample budget');

    console.log('Database seeding completed successfully!');
    console.log('Test user: test@example.com / password123');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    process.exit();
  }
}

seed();