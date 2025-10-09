import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { voucherController } from './voucherController';

const router: Router = express.Router();

router.get('/', asyncHandler(voucherController.list));
router.post('/', asyncHandler(voucherController.create));
router.get('/:id', asyncHandler(voucherController.show));
router.put('/:id', asyncHandler(voucherController.update));
router.delete('/:id', asyncHandler(voucherController.remove));

export default router as Router;
