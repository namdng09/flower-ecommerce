import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { paymentController } from './paymentController';

const router: Router = express.Router();

router.post('/create-payment-link', asyncHandler(paymentController.createPayment));

export default router as Router;
