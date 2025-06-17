import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { cartController } from './cartController';

const router: Router = express.Router();

router.get('/:userId', asyncHandler(cartController.show));
router.post('/:userId/items', asyncHandler(cartController.addCartItem));
router.put('/:userId/items', asyncHandler(cartController.updateCartItem));
router.delete('/:userId/items', asyncHandler(cartController.removeCartItem));

export default router as Router;
