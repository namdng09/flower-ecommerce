import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { reviewController } from './reviewController';

const router: Router = express.Router();

router.get('/', asyncHandler(reviewController.list));
router.post('/', asyncHandler(reviewController.create));

router.get('/product/:productId', asyncHandler(reviewController.getByProduct));
router.get('/:reviewId', asyncHandler(reviewController.show));
router.patch('/:reviewId', asyncHandler(reviewController.update));
router.delete('/:reviewId', asyncHandler(reviewController.delete));

export default router as Router;
