import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as savingsGoalController from '../controllers/savingsGoalController.js';

const router = express.Router();

router.get('/', authMiddleware, savingsGoalController.getSavingsGoals);
router.post('/', authMiddleware, savingsGoalController.createSavingsGoal);
router.put('/:id', authMiddleware, savingsGoalController.updateSavingsGoal);
router.delete('/:id', authMiddleware, savingsGoalController.deleteSavingsGoal);



export default router;