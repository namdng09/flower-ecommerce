import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { addressController } from './addressController';

const router: Router = express.Router();

router.get('/', asyncHandler(addressController.list));
router.post('/', asyncHandler(addressController.create));

router.get('/:id', asyncHandler(addressController.show));
router.put('/:id', asyncHandler(addressController.update));
router.delete('/:id', asyncHandler(addressController.remove));

export default router as Router;
