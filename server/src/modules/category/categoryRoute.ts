import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { categoryController } from './categoryController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(categoryController.filterCategories));

router.get('/', asyncHandler(categoryController.list));
router.post('/', asyncHandler(categoryController.create));

router.get('/:categoryId', asyncHandler(categoryController.show));
router.put('/:categoryId', asyncHandler(categoryController.update));
router.delete('/:categoryId', asyncHandler(categoryController.delete));

export default router as Router;
