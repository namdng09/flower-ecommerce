import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import OrderModel from './orderModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

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
      const orders = await OrderModel.find();

      return res
        .status(201)
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
        user
      } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        status?: string;
        orderNumber?: string;
        user?: string;
      };

      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'totalCost',
        'totalQuantity',
        'orderNumber'
      ];

      const makeRegex = (value?: string | string[]) =>
        value ? { $regex: value, $options: 'i' } : undefined;

      const matchStage: Record<string, any> = {
        ...(orderNumber && { fullName: makeRegex(orderNumber) }),
        ...(status && { username: makeRegex(status) }),
        ...(user && { email: makeRegex(user) })
      };

      const sortField = allowedSortFields.includes(sortBy as string)
        ? sortBy
        : 'createdAt';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const aggregate = OrderModel.aggregate([
        { $match: matchStage },
        { $sort: { [sortField]: sortDirection } },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [{ $project: { password: 0 } }],
            as: 'user'
          }
        },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } }
      ]);

      const options = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10
      };

      const result = await (OrderModel as any).aggregatePaginate(
        aggregate,
        options
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

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid order id');

      const order = await OrderModel.findById(id);
      if (!order) throw createHttpError(404, 'Order not found');

      return res
        .status(200)
        .json(apiResponse.success('Order fetched successfully', order));
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
      const {
        user,
        items,
        payment,
        shipment,
        description,
        expectedDeliveryAt
      } = req.body;

      if (!Types.ObjectId.isValid(user))
        throw createHttpError(400, 'Invalid user id');

      if (!Array.isArray(items) || items.length === 0)
        throw createHttpError(400, 'Order must contain at least one item');

      for (const [index, it] of items.entries()) {
        if (!Types.ObjectId.isValid(it.variant))
          throw createHttpError(400, `Invalid variant id at index ${index}`);
        if (!it.quantity || it.quantity < 1)
          throw createHttpError(400, `Quantity must be ≥1 at index ${index}`);
        if (!it.price || it.price < 0)
          throw createHttpError(400, `Price must be ≥0 at index ${index}`);
      }

      if (expectedDeliveryAt && isNaN(Date.parse(expectedDeliveryAt))) {
        throw createHttpError(400, 'Invalid expectedDeliveryAt date');
      }

      if (!payment || !['cod', 'banking'].includes(payment.method))
        throw createHttpError(400, 'Invalid or missing payment method');

      if (payment.method === 'banking') {
        payment.status = 'awaiting_payment';
      }

      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      let totalPrice = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      totalPrice += shipment.shippingCost;

      const newOrder = await OrderModel.create({
        user,
        items,
        totalQuantity,
        totalPrice,
        payment,
        shipment,
        expectedDeliveryAt,
        description
      });

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
      const { carrier, trackingNumber, status, returnReason, notes } = req.body;

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid order id');

      const order = await OrderModel.findById(id);
      if (!order) throw createHttpError(404, 'Order not found');

      const ship = order.shipment;

      if (carrier !== undefined) ship.carrier = carrier;
      if (trackingNumber !== undefined) ship.trackingNumber = trackingNumber;
      if (status !== undefined) ship.status = status;
      if (notes !== undefined) ship.notes = notes;

      if (returnReason !== undefined) {
        order.shipment.returnReason = returnReason;
        order.shipment.isReturn = true;
      }

      if (status === 'delivered') {
        order.status = 'delivered';
      } else if (status === 'failed') {
        order.status = 'cancelled';
      }

      const updated = await order.save();

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
      const { status, description, paymentDate, gatewayRef } = req.body;

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid order id');

      const order = await OrderModel.findById(id);
      if (!order) throw createHttpError(404, 'Order not found');

      const pay = order.payment;

      if (status !== undefined) pay.status = status;
      if (description !== undefined) pay.description = description;
      if (paymentDate !== undefined) pay.paymentDate = new Date(paymentDate);
      if (gatewayRef !== undefined) pay.gatewayRef = gatewayRef;

      if (status === 'expired') {
        order.status = 'cancelled';
      }

      const updated = await order.save();

      return res
        .status(200)
        .json(apiResponse.success('Payment updated successfully', updated));
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

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid order id');

      const deleted = await OrderModel.findByIdAndDelete(id);
      if (!deleted) throw createHttpError(404, 'Order not found');

      return res
        .status(200)
        .json(apiResponse.success('Order removed successfully'));
    } catch (error) {
      next(error);
    }
  }
};
