import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { userController } from './userController';

const router: Router = express.Router();

router.get('/filter', asyncHandler(userController.filterUsers));
router.patch(
  '/reset-password/:email',
  asyncHandler(userController.updatePassword)
);

router.get('/', asyncHandler(userController.list));
router.get('/:userId', asyncHandler(userController.show));

router.post('/', asyncHandler(userController.create));
router.patch('/:userId/avatar', asyncHandler(userController.updateAvatarUrl));
router.patch('/:userId/cover', asyncHandler(userController.updateCoverUrl));
router.put('/:userId', asyncHandler(userController.update));
router.put(
  '/:userId/change-password',
  asyncHandler(userController.changePassword)
);
router.delete('/:userId', asyncHandler(userController.remove));

export default router as Router;
