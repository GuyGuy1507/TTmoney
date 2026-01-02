import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import trực tiếp các route
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import incomeRoutes from './routes/incomeRoutes.js';
import savingsGoalRoutes from './routes/savingsGoalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://ttmoney.vercel.app',
    'https://*.vercel.app',
    'https://railway.app',
    'https://*.railway.app',
    '*'
  ],
  credentials: true
}));
app.use(express.json());

// KHAI BÁO ROUTE TẠI ĐÂY (Phải nằm TRƯỚC các middleware báo lỗi)
console.log("Registering auth routes at /api/auth");
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);

// Route kiểm tra nhanh - không cần database
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware xử lý lỗi 404 (Trả về JSON thay vì HTML để tránh lỗi Unexpected token)
app.use((req, res) => {
  res.status(404).json({ error: 'Đường dẫn không tồn tại trên Server' });
});

// Test database connection trước khi start server
import db from './config/database.js';

console.log('🔄 Testing database connection...');
db.query('SELECT 1')
  .then(() => {
    console.log('✅ Database connection successful');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔌 Database: Connected`);
    });
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.log('⚠️ Starting server anyway for healthcheck...');
    // Vẫn start server để healthcheck pass
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️ Backend đang chạy nhưng database lỗi tại http://localhost:${PORT}`);
    });
  });
