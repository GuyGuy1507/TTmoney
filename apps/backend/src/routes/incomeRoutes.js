import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as incomeController from '../controllers/incomeController.js';

const router = express.Router();

router.get('/', authMiddleware, incomeController.getIncomes);
router.post('/', authMiddleware, incomeController.createIncome);
router.put('/:id', authMiddleware, incomeController.updateIncome);
router.delete('/:id', authMiddleware, incomeController.deleteIncome);

router.get('/sources', authMiddleware, incomeController.getIncomeSources);
router.post('/sources', authMiddleware, incomeController.createIncomeSource);
router.put('/sources/:id', authMiddleware, incomeController.updateIncomeSource);
router.delete('/sources/:id', authMiddleware, incomeController.deleteIncomeSource);

export default router;