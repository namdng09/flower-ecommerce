import { NextFunction, Request, Response } from 'express';
import OrderModel, { IPayment, IOrder, IShipment } from './orderModel';
import { apiResponse } from '~/types/apiResponse';
import { orderService } from './orderService';

export const orderController = {
  /**
   * GET /orders
   * orderController.list()
   */
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const orders = await orderService.list();
      return res
        .status(200)
        .json(apiResponse.success('Orders listed successfully', orders));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders
   * orderController.filterOrder()
   */
  filterOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status,
        orderNumber,
        shop,
        user
      } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        status?: string;
        orderNumber?: string;
        shop?: string;
        user?: string;
      };

      const result = await orderService.filterOrder(
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        orderNumber,
        shop,
        user
      );

      return res.status(200).json(
        apiResponse.success('Orders listed successfully', {
          result
        })
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders/:id
   * orderController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      const order = await orderService.show(id);

      return res
        .status(200)
        .json(apiResponse.success('Order fetched successfully', order));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders/:userId/user
   * orderController.getByUserId()
   */
  getByUserId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.params;

      const orders = await orderService.getByUserId(userId);

      return res
        .status(200)
        .json(apiResponse.success('Order fetched successfully', orders));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /orders/:shopId/shop
   * orderController.getByShopId()
   */
  getByShopId: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { shopId } = req.params;

      const orders = await orderService.getByShopId(shopId);

      return res
        .status(200)
        .json(apiResponse.success('Order created successfully', orders));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /orders
   * orderController.create()
   *
   * Expected body:
   *   user, items[], payment, shipment, description?
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const orderData: IOrder = req.body;

      const newOrder = await orderService.create(orderData);

      return res
        .status(201)
        .json(apiResponse.success('Order created successfully', newOrder));
    } catch (error) {
      next(error);
    }
  },

  updateShipment: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const shipmentData: IShipment = req.body;

      const updated = await orderService.updateShipment(id, shipmentData);

      return res
        .status(200)
        .json(apiResponse.success('Shipment updated successfully', updated));
    } catch (error) {
      next(error);
    }
  },

  updatePayment: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const paymentData: IPayment = req.body;

      const updated = await orderService.updatePayment(id, paymentData);

      return res
        .status(200)
        .json(apiResponse.success('Payment updated successfully', updated));
    } catch (error) {
      next(error);
    }
  },

  updateOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const orderData: IOrder = req.body;

      const updated = await orderService.updateOrder(id, orderData);

      return res
        .status(200)
        .json(apiResponse.success('Order updated successfully', updated));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /orders/:id
   * orderController.remove()
   */
  remove: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      const deleted = await orderService.remove(id);

      return res
        .status(200)
        .json(apiResponse.success('Order removed successfully', deleted));
    } catch (error) {
      next(error);
    }
  }
};
