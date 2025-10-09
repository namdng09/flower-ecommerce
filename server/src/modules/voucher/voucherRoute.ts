import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { voucherController } from './voucherController';
import jwtAuth from '~/middleware/jwtAuth';
import { authorize } from '~/middleware/authorize';

const router: Router = express.Router();

router.get('/', asyncHandler(voucherController.list));
router.post(
  '/',
  jwtAuth,
  authorize('admin'),
  asyncHandler(voucherController.create)
);
router.get('/:id', asyncHandler(voucherController.show));
router.put(
  '/:id',
  jwtAuth,
  authorize('admin'),
  asyncHandler(voucherController.update)
);
router.delete(
  '/:id',
  jwtAuth,
  authorize('admin'),
  asyncHandler(voucherController.remove)
);

export default router as Router;
