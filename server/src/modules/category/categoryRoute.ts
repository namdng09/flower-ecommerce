import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { categoryController } from './categoryController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(categoryController.filterCategories));

router.get('/', asyncHandler(categoryController.list));
router.post('/', asyncHandler(categoryController.create));

router.get('/:id', asyncHandler(categoryController.show));
router.put('/:id', asyncHandler(categoryController.update));
router.delete('/:id', asyncHandler(categoryController.remove));

export default router as Router;
