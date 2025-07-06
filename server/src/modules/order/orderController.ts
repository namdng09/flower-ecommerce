import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import OrderModel, { IPayment } from './orderModel';
import UserModel from '../user/userModel';
import { OrderStatus, PaymentStatus, ShipmentStatus } from './orderModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';
import VariantModel from '../variant/variantModel';

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

      const allowedStatus: OrderStatus[] = [
        'pending',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'returned',
        'cancelled'
      ];

      if (status && !allowedStatus.includes(status as OrderStatus))
        throw createHttpError(400, 'Invalid order status');

      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'totalPrice',
        'totalQuantity',
        'orderNumber'
      ];

      const makeRegex = (value?: string | string[]) =>
        value ? { $regex: value, $options: 'i' } : undefined;

      const matchStage: Record<string, any> = {
        ...(orderNumber && { orderNumber: makeRegex(orderNumber) }),
        ...(status && { status: makeRegex(status) })
      };

      if (user) {
        if (!Types.ObjectId.isValid(user)) {
          return next(createHttpError(400, 'Invalid user id'));
        }
        matchStage.user = new Types.ObjectId(user);
      }

      const sortField = allowedSortFields.includes(sortBy as string)
        ? sortBy
        : 'createdAt';
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      const aggregate = [
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
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },

        { $unwind: '$items' },
        {
          $lookup: {
            from: 'variants',
            localField: 'items.variant',
            foreignField: '_id',
            as: 'items.variant'
          }
        },
        { $unwind: '$items.variant' },

        {
          $lookup: {
            from: 'products',
            localField: 'items.variant._id',
            foreignField: 'variants',
            pipeline: [
              { $project: { title: 1, skuCode: 1, thumbnailImage: 1 } }
            ],
            as: 'productInfo'
          }
        },

        {
          $addFields: {
            'items.variant.product': '$productInfo'
          }
        },
        { $project: { productInfo: 0 } }, // bỏ field tạm

        {
          $group: {
            _id: '$_id',
            doc: { $first: '$$ROOT' },
            items: { $push: '$items' }
          }
        },
        {
          $replaceRoot: {
            newRoot: { $mergeObjects: ['$doc', { items: '$items' }] }
          }
        }
      ];

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

      if (!Types.ObjectId.isValid(userId))
        throw createHttpError(400, 'Invalid user id');

      const orders = await OrderModel.find({ user: userId }).sort({
        createdAt: -1
      });

      return res
        .status(200)
        .json(apiResponse.success('Order fetched successfully', orders));
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
      const { user, items, payment, shipment, customization } = req.body;

      if (!Types.ObjectId.isValid(user))
        throw createHttpError(400, 'Invalid user id');

      // Validate customization object
      if (customization) {
        if (
          customization.giftMessage &&
          (typeof customization.giftMessage !== 'string' ||
            customization.giftMessage.length > 255)
        ) {
          throw createHttpError(400, 'Invalid giftMessage');
        }

        if (
          customization.isAnonymous !== undefined &&
          typeof customization.isAnonymous !== 'boolean'
        ) {
          throw createHttpError(400, 'Invalid isAnonymous value');
        }

        if (
          customization.deliveryTimeRequested &&
          isNaN(Date.parse(customization.deliveryTimeRequested))
        ) {
          throw createHttpError(400, 'Invalid deliveryTimeRequested');
        }
      }

      const existingUser = await UserModel.findById(user);
      if (!existingUser) throw createHttpError(404, 'User not found');

      if (!Array.isArray(items) || items.length === 0)
        throw createHttpError(400, 'Order must contain at least one item');

      for (const [index, it] of items.entries()) {
        if (!Types.ObjectId.isValid(it.variant))
          throw createHttpError(400, `Invalid variant id at index ${index}`);

        const variantDoc = await VariantModel.findById(it.variant);
        if (!variantDoc)
          throw createHttpError(400, `Variant not found at index ${index}`);

        if (!it.quantity || it.quantity < 1)
          throw createHttpError(400, `Quantity must be ≥1 at index ${index}`);

        if (!it.price || it.price < 0)
          throw createHttpError(400, `Price must be ≥0 at index ${index}`);
      }

      if (
        !shipment ||
        typeof shipment.shippingCost !== 'number' ||
        shipment.shippingCost < 0
      )
        throw createHttpError(400, 'Invalid or missing shippingCost');

      const allowedShipmentStatus: ShipmentStatus[] = [
        'pending',
        'picking_up',
        'out_for_delivery',
        'delivered',
        'failed'
      ];
      if (
        shipment.status &&
        !allowedShipmentStatus.includes(shipment.status as ShipmentStatus)
      ) {
        throw createHttpError(400, 'Invalid shipment status');
      }

      if (!payment || !['cod', 'banking'].includes(payment.method))
        throw createHttpError(400, 'Invalid or missing payment method');

      if (payment.method === 'banking') {
        payment.status = 'awaiting_payment';
      }

      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

      let itemsTotal = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const totalPrice = itemsTotal + shipment.shippingCost;

      const paymentStatus: PaymentStatus =
        payment.method === 'banking' ? 'awaiting_payment' : 'unpaid';

      const paymentData: IPayment = {
        amount: totalPrice,
        method: payment.method,
        status: paymentStatus,
        description: payment.description,
        gatewayRef: payment.gatewayRef,
        paymentDate: payment.paymentDate
      };

      const newOrder = await OrderModel.create({
        user,
        items,
        totalQuantity,
        totalPrice,
        payment: paymentData,
        shipment,
        customization
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
      const { carrier, trackingNumber, status, returnReason } = req.body;

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid order id');

      const order = await OrderModel.findById(id);
      if (!order) throw createHttpError(404, 'Order not found');

      const allowedShipmentStatus: ShipmentStatus[] = [
        'pending',
        'picking_up',
        'out_for_delivery',
        'delivered',
        'failed'
      ];

      if (status && !allowedShipmentStatus.includes(status as ShipmentStatus)) {
        throw createHttpError(400, 'Invalid shipment status');
      }

      const ship = order.shipment;

      if (status !== undefined) {
        ship.status = status as ShipmentStatus;

        if (status === 'delivered') {
          ship.deliveredAt = new Date();
          order.status = 'delivered';

          if (order.payment.method === 'cod') {
            order.payment.paymentDate = ship.deliveredAt;
            order.payment.status = 'paid';
          }
        } else if (status === 'failed') {
          order.status = 'cancelled';
        }
      }

      if (carrier !== undefined) ship.carrier = carrier;
      if (trackingNumber !== undefined) ship.trackingNumber = trackingNumber;
      if (returnReason !== undefined) ship.returnReason = returnReason;

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

      const allowedPaymentStatus: PaymentStatus[] = [
        'awaiting_payment',
        'unpaid',
        'paid',
        'expired',
        'refunded'
      ];

      if (status && !allowedPaymentStatus.includes(status as PaymentStatus)) {
        throw createHttpError(400, 'Invalid payment status');
      }

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

  updateOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { status, description, expectedDeliveryAt, ...rest } = req.body;

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid order id');

      if (Object.keys(rest).length > 0)
        throw createHttpError(
          400,
          'Only status, description, expectedDeliveryAt can be updated'
        );

      const allowedStatus: OrderStatus[] = [
        'pending',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'returned',
        'cancelled'
      ];

      if (status && !allowedStatus.includes(status))
        throw createHttpError(400, 'Invalid order status');

      const order = await OrderModel.findById(id);
      if (!order) throw createHttpError(404, 'Order not found');

      if (status !== undefined) order.status = status;
      if (description !== undefined) order.description = description;

      if (expectedDeliveryAt !== undefined) {
        const dateObj = new Date(expectedDeliveryAt);
        if (isNaN(dateObj.getTime()))
          throw createHttpError(400, 'Invalid expectedDeliveryAt date');
        order.expectedDeliveryAt = dateObj;
      }

      if (status === 'delivered' && !order.shipment.deliveredAt)
        order.shipment.deliveredAt = new Date();

      const updated = await order.save();

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
