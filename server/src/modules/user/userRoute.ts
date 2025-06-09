import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { userController } from './userController';

const router: Router = express.Router();

router.get('/', asyncHandler(userController.list));
router.get('/:id', asyncHandler(userController.show));

router.post('/', asyncHandler(userController.create));

router.put('/:id', asyncHandler(userController.update));

router.patch('/password/:id', asyncHandler(userController.updatePassword));

router.patch('/avatar/:id', asyncHandler(userController.updateAvatarUrl));
router.patch('/cover/:id', asyncHandler(userController.updateCoverUrl));

router.delete('/:id', asyncHandler(userController.remove));

export default router as Router;
