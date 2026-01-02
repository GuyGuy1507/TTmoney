import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as reportController from '../controllers/reportController.js';

const router = express.Router();

router.get('/monthly', authMiddleware, reportController.getMonthlyReport);
router.get('/trends', authMiddleware, reportController.getCategoryTrends);
router.get('/expense-trends', authMiddleware, reportController.getExpenseTrends);
router.get('/category-analytics', authMiddleware, reportController.getCategoryAnalytics);
router.get('/monthly-comparison', authMiddleware, reportController.getMonthlyComparison);
router.get('/summary', authMiddleware, reportController.getSummary);

export default router;
