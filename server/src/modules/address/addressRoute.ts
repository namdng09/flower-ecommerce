import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { addressController } from './addressController';

const router: Router = express.Router();

router.get('/', asyncHandler(addressController.list));
router.post('/', asyncHandler(addressController.create));

router.get('/:addressId', asyncHandler(addressController.show));
router.put('/:addressId', asyncHandler(addressController.update));
router.delete('/:addressId', asyncHandler(addressController.delete));

export default router as Router;
