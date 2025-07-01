import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { productController } from './productController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(productController.filterProducts));
router.get('/', asyncHandler(productController.list));
router.get('/:id', asyncHandler(productController.show));
router.get(
  '/category/:categoryId',
  asyncHandler(productController.getByCategory)
);
router.get('/shop/:shopId', asyncHandler(productController.getByShop));

router.post('/', asyncHandler(productController.create));
router.put('/:id', asyncHandler(productController.update));

router.delete('/:id', asyncHandler(productController.remove));

export default router as Router;
