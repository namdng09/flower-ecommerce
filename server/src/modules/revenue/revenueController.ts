import { Request, Response } from 'express';
import { revenueService } from './revenueService';

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
  async getOverallRevenue(req: Request, res: Response) {
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
      res.json(revenue);
    } catch (error) {
      console.error('Error retrieving overall revenue:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  },
  async getDailyRevenue(req: Request, res: Response) {
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
      res.json(revenue);
    } catch (error) {
      console.error('Error retrieving daily revenue:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  },
  async getMonthlyRevenue(req: Request, res: Response) {
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
      res.json(revenue);
    } catch (error) {
      console.error('Error retrieving monthly revenue:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  },
  async getRevenueByShop(req: Request, res: Response) {
    try {
      const { startDate, endDate, page, limit } = req.query as QueryParams;

      const options: RevenueQueryOptions = {};

      if (startDate) options.startDate = new Date(startDate);
      if (endDate) options.endDate = new Date(endDate);
      if (page) options.page = parseInt(page);
      if (limit) options.limit = parseInt(limit);

      const revenue = await revenueService.getRevenueByShop(options);
      res.json(revenue);
    } catch (error) {
      console.error('Error retrieving revenue by shop:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  },
  async getDailyRevenueByShop(req: Request, res: Response) {
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
      res.json(revenue);
    } catch (error) {
      console.error('Error retrieving daily revenue by shop:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  },
  async getMonthlyRevenueByShop(req: Request, res: Response) {
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
      res.json(revenue);
    } catch (error) {
      console.error('Error retrieving monthly revenue by shop:', error);
      res.status(500).json({ error: 'Failed to retrieve revenue data' });
    }
  }
};
