import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { favouriteController } from './favouriteController';
const router: Router = express.Router();
router.get('/', asyncHandler(favouriteController.list));
router.post('/', asyncHandler(favouriteController.create));
// router.get('/:id', asyncHandler(favouriteController.show));
router.delete('/:id', asyncHandler(favouriteController.remove));

export default router as Router;