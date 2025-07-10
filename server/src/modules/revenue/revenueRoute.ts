import express, { Router } from 'express';
import asyncHandler from '~/utils/asyncHandler';
import { revenueController } from './revenueController';

const router: Router = express.Router();

// Overall revenue endpoints
router.get('/', asyncHandler(revenueController.getOverallRevenue));
router.get('/daily', asyncHandler(revenueController.getDailyRevenue));
router.get('/monthly', asyncHandler(revenueController.getMonthlyRevenue));

// Revenue by shop endpoints
router.get('/by-shop', asyncHandler(revenueController.getRevenueByShop));
router.get(
  '/by-shop/daily',
  asyncHandler(revenueController.getDailyRevenueByShop)
);
router.get(
  '/by-shop/monthly',
  asyncHandler(revenueController.getMonthlyRevenueByShop)
);

export default router as Router;
