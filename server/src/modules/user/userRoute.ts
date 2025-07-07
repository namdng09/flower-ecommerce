import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { userController } from './userController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(userController.filterUsers));
router.patch('/avatar/:userId', asyncHandler(userController.updateAvatarUrl));
router.patch('/cover/:userId', asyncHandler(userController.updateCoverUrl));
router.patch(
  '/reset-password/:email',
  asyncHandler(userController.updatePassword)
);

router.get('/', asyncHandler(userController.list));
router.get('/:userId', asyncHandler(userController.show));

router.post('/', asyncHandler(userController.create));
router.put('/:userId', asyncHandler(userController.update));
router.delete('/:userId', asyncHandler(userController.remove));

export default router as Router;
