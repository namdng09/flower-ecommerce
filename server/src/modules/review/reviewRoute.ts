import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { reviewController } from './reviewController';

const router: Router = express.Router();

router.get('/', asyncHandler(reviewController.list));
router.post('/', asyncHandler(reviewController.create));

router.get('/:reviewId', asyncHandler(reviewController.show));
router.put('/:reviewId', asyncHandler(reviewController.update));
router.delete('/:reviewId', asyncHandler(reviewController.delete));

export default router as Router;
