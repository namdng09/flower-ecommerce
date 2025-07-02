import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { orderController } from './orderController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(orderController.filterOrder));
router.get('/', asyncHandler(orderController.list));
router.get('/:id', asyncHandler(orderController.show));

router.post('/', asyncHandler(orderController.create));

router.delete('/:id', asyncHandler(orderController.remove));

export default router as Router;
