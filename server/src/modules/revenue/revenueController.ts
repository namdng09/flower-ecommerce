import { Request, Response, NextFunction } from 'express';
import { revenueService } from './revenueService';
import { apiResponse } from '~/types/apiResponse';

interface QueryParams {
  startDate?: string;
  endDate?: string;
  shopId?: string;
  groupBy?: 'day' | 'month' | 'year';
  page?: string;
  limit?: string;
}

interface RevenueQueryOptions {
  startDate?: Date;
  endDate?: Date;
  shopId?: string;
  page?: number;
  limit?: number;
}

interface TimeframeOptions extends RevenueQueryOptions {
  groupBy: 'day' | 'month' | 'year';
}

export const revenueController = {
  async getOverallRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, shopId, page, limit } =
        req.query as QueryParams;

      const options: RevenueQueryOptions = {};

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (shopId) options.shopId = shopId;
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getOverallRevenue(options);
      return res
        .status(200)
        .json(
          apiResponse.success('Overall revenue retrieved successfully', revenue)
        );
    } catch (error) {
      next(error);
    }
  },
  async getDailyRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, shopId, page, limit } =
        req.query as QueryParams;

      const options: TimeframeOptions = { groupBy: 'day' };

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (shopId) options.shopId = shopId;
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getRevenueByTimeframe(options);
      return res
        .status(200)
        .json(
          apiResponse.success('Daily revenue retrieved successfully', revenue)
        );
    } catch (error) {
      next(error);
    }
  },
  async getMonthlyRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, shopId, page, limit } =
        req.query as QueryParams;

      const options: TimeframeOptions = { groupBy: 'month' };

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (shopId) options.shopId = shopId;
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getRevenueByTimeframe(options);
      return res
        .status(200)
        .json(
          apiResponse.success('Monthly revenue retrieved successfully', revenue)
        );
    } catch (error) {
      next(error);
    }
  },
  async getRevenueByShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, page, limit } = req.query as QueryParams;

      const options: RevenueQueryOptions = {};

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getRevenueByShop(options);
      return res
        .status(200)
        .json(
          apiResponse.success('Revenue by shop retrieved successfully', revenue)
        );
    } catch (error) {
      next(error);
    }
  },
  async getDailyRevenueByShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, shopId, page, limit } =
        req.query as QueryParams;

      const options: TimeframeOptions = { groupBy: 'day' };

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (shopId) options.shopId = shopId;
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getRevenueByShopTimeframe(options);
      return res
        .status(200)
        .json(
          apiResponse.success(
            'Daily revenue by shop retrieved successfully',
            revenue
          )
        );
    } catch (error) {
      next(error);
    }
  },
  async getMonthlyRevenueByShop(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { startDate, endDate, shopId, page, limit } =
        req.query as QueryParams;

      const options: TimeframeOptions = { groupBy: 'month' };

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (shopId) options.shopId = shopId;
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getRevenueByShopTimeframe(options);
      return res
        .status(200)
        .json(
          apiResponse.success(
            'Monthly revenue by shop retrieved successfully',
            revenue
          )
        );
    } catch (error) {
      next(error);
    }
  }
};
