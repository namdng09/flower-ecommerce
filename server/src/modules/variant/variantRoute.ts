import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { variantController } from './variantController';

const router: Router = express.Router();

router.get('/code/:variantCode', asyncHandler(variantController.getByCode));

router.get('/', asyncHandler(variantController.list));
router.post('/', asyncHandler(variantController.create));

router.get('/:id', asyncHandler(variantController.show));

router.put('/:id', asyncHandler(variantController.update));
router.delete('/:id', asyncHandler(variantController.remove));

export default router as Router;
