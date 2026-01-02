import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as budgetController from '../controllers/budgetController.js';

const router = express.Router();

router.post('/', authMiddleware, budgetController.createBudget);
router.get('/', authMiddleware, budgetController.getBudgets);
router.get('/status', authMiddleware, budgetController.getBudgetStatus);
router.get('/overall/status', authMiddleware, budgetController.getOverallBudgetStatus);
router.get('/:id', authMiddleware, budgetController.getBudgetById);
router.put('/:id', authMiddleware, budgetController.updateBudget);
router.delete('/:id', authMiddleware, budgetController.deleteBudget);

export default router;
