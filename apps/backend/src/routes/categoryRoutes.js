import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import * as categoryController from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', authMiddleware, categoryController.createCategory);
router.get('/', authMiddleware, categoryController.getCategories);
router.get('/:id', authMiddleware, categoryController.getCategoryById);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

export default router;
