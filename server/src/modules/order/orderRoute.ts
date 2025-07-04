import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { orderController } from './orderController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(orderController.filterOrder));
router.get('/', asyncHandler(orderController.list));
router.get('/:id', asyncHandler(orderController.show));

router.post('/', asyncHandler(orderController.create));

router.put('/:id/shipment', asyncHandler(orderController.updateShipment));
router.put('/:id/payment', asyncHandler(orderController.updatePayment));
router.put('/:id', asyncHandler(orderController.updateOrder));

router.delete('/:id', asyncHandler(orderController.remove));

export default router as Router;
