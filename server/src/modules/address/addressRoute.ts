import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { addressController } from './addressController';

const router: Router = express.Router();

router.get('/:userId/user', asyncHandler(addressController.list));
router.get('/:id', asyncHandler(addressController.show));

router.post('/', asyncHandler(addressController.create));
router.put('/:id', asyncHandler(addressController.update));
router.delete('/:id', asyncHandler(addressController.delete));

export default router as Router;
