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

app.use(cors());
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

// Route kiểm tra nhanh
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is ready' });
});

// Middleware xử lý lỗi 404 (Trả về JSON thay vì HTML để tránh lỗi Unexpected token)
app.use((req, res) => {
  res.status(404).json({ error: 'Đường dẫn không tồn tại trên Server' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend đang chạy tại http://localhost:${PORT}`);
});
