import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { favouriteController } from './favouriteController';

const router: Router = express.Router();

router.get('/:userId', asyncHandler(favouriteController.listByUser));
router.post(
  '/:userId/items',
  asyncHandler(favouriteController.addFavouriteItem)
);
router.delete(
  '/:userId/items',
  asyncHandler(favouriteController.removeFavourityItem)
);

export default router as Router;
