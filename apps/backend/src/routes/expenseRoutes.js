import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as expenseController from '../controllers/expenseController.js';

const router = express.Router();

router.post('/', authMiddleware, expenseController.createExpense);
router.get('/', authMiddleware, expenseController.getExpenses);
router.get('/by-month', authMiddleware, expenseController.getExpensesByMonth);
router.get('/:id', authMiddleware, expenseController.getExpenseById);
router.put('/:id', authMiddleware, expenseController.updateExpense);
router.delete('/:id', authMiddleware, expenseController.deleteExpense);

export default router;
