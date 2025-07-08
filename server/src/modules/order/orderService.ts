import OrderModel, { IOrder, IPayment, IShipment } from './orderModel';
import { OrderStatus, PaymentStatus, ShipmentStatus } from './orderModel';
import VariantModel from '../variant/variantModel';
import UserModel from '../user/userModel';
import AddressModel from '../address/addressModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { mailService } from '../email/emailService';

export const orderService = {
  list: async () => {
    const orders = await OrderModel.find().populate('address');

    return orders;
  },

  filterOrder: async (
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    status?: string,
    orderNumber?: string,
    user?: string
  ) => {
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
        throw createHttpError(400, 'Invalid user id');
      }
      matchStage.user = new Types.ObjectId(user);
    }

    const sortField = allowedSortFields.includes(sortBy as string)
      ? sortBy
      : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const aggregate = [
      { $match: matchStage },
      { $sort: { [sortField as string]: sortDirection } },
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
      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'address'
        }
      },
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
          pipeline: [{ $project: { title: 1, skuCode: 1, thumbnailImage: 1 } }],
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

    return result;
  },

  show: async (orderId: string) => {
    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const order = await OrderModel.findById(orderId).populate('address');
    if (!order) throw createHttpError(404, 'Order not found');

    return order;
  },

  getByUserId: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId))
      throw createHttpError(400, 'Invalid user id');

    const orders = await OrderModel.find({ user: userId }).sort({
      createdAt: -1
    });

    return orders;
  },

  create: async (orderData: IOrder) => {
    const { user, address, items, payment, shipment, customization } =
      orderData;

    if (!Types.ObjectId.isValid(user))
      throw createHttpError(400, 'Invalid user id');

    if (!Types.ObjectId.isValid(address))
      throw createHttpError(400, 'Invalid address id');

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
        isNaN(new Date(customization.deliveryTimeRequested).getTime())
      ) {
        throw createHttpError(400, 'Invalid deliveryTimeRequested');
      }
    }

    const existingUser = await UserModel.findById(user);
    if (!existingUser) throw createHttpError(404, 'User not found');

    const existingAddress = await AddressModel.findById(address);
    if (!existingAddress) throw createHttpError(404, 'Address not found');

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

    const itemsTotal = items.reduce(
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
      address,
      items,
      totalQuantity,
      totalPrice,
      payment: paymentData,
      shipment,
      customization
    });

    // Populate để lấy được email của shops
    const populatedOrder = (await OrderModel.findById(newOrder._id)
      .populate('address')
      .populate('user')
      .populate({
        path: 'items.variant',
        populate: {
          path: 'product',
          select: 'title skuCode thumbnailImage shop',
          populate: {
            path: 'shop',
            select: 'fullName email role'
          }
        }
      })) as any;

    const plainPopulatedOrder = populatedOrder.toObject();
    console.log(plainPopulatedOrder.user.fullName);

    if (plainPopulatedOrder) {
      await mailService.sendOrderSuccessToCustomer(
        plainPopulatedOrder,
        existingUser.email
      );
    }

    return newOrder;
  },

  updateShipment: async (orderId: string, shipmentData: IShipment) => {
    const { carrier, trackingNumber, status, returnReason } = shipmentData;

    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const order = await OrderModel.findById(orderId);
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

    return updated;
  },

  updatePayment: async (orderId: string, paymentData: IPayment) => {
    const { status, description, paymentDate, gatewayRef } = paymentData;

    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const order = await OrderModel.findById(orderId);
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

    return updated;
  },

  updateOrder: async (orderId: string, orderData: IOrder) => {
    const { status, description, expectedDeliveryAt, ...rest } = orderData;

    if (!Types.ObjectId.isValid(orderId))
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

    const order = await OrderModel.findById(orderId);
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

    return updated;
  },

  remove: async (orderId: string) => {
    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const deleted = await OrderModel.findByIdAndDelete(orderId);
    if (!deleted) throw createHttpError(404, 'Order not found');

    return deleted;
  }
};
