import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { addressController } from './addressController';

const router: Router = express.Router();

router.get('/userId/user', asyncHandler(addressController.list));
router.get('/:addressId/address', asyncHandler(addressController.show));

router.post('/', asyncHandler(addressController.create));
router.put('/:addressId', asyncHandler(addressController.update));
router.delete('/:addressId', asyncHandler(addressController.delete));

export default router as Router;
