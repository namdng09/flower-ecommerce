import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { reviewController } from './reviewController';
import jwtAuth from '~/middleware/jwtAuth';
import { authorize } from '~/middleware/authorize';

const router: Router = express.Router();

router.get('/', asyncHandler(reviewController.list));
router.post(
  '/',
  jwtAuth,
  authorize('customer'),
  asyncHandler(reviewController.create)
);

router.get('/product/:productId', asyncHandler(reviewController.getByProduct));
router.get('/:reviewId', asyncHandler(reviewController.show));
router.patch(
  '/:reviewId',
  jwtAuth,
  authorize('customer'),
  asyncHandler(reviewController.update)
);
router.delete(
  '/:reviewId',
  jwtAuth,
  authorize('customer', 'admin'),
  asyncHandler(reviewController.delete)
);

export default router as Router;
