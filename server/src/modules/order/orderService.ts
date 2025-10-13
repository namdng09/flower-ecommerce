import OrderModel, { IOrder, IPayment, IShipment } from './orderModel';
import { OrderStatus, PaymentStatus, ShipmentStatus } from './orderModel';
import VariantRepository from '../variant/variantRepository';
import UserRepository from '../user/userRepository';
import AddressModel from '../address/addressModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import ProductRepository from '../product/productRepository';
import { mailService } from '../email/emailService';
import VoucherRepository from '~/modules/voucher/voucherRepository';
import { voucherService } from '~/modules/voucher/voucherService';

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
    shop?: string,
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

    if (shop) {
      if (!Types.ObjectId.isValid(shop)) {
        throw createHttpError(400, 'Invalid shop id');
      }
      matchStage.shop = new Types.ObjectId(shop);
    }

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
          localField: 'shop',
          foreignField: '_id',
          pipeline: [{ $project: { password: 0 } }],
          as: 'shop'
        }
      },
      { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },

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
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },

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
    if (!Types.ObjectId.isValid(orderId)) {
      throw createHttpError(400, 'Invalid order id');
    }

    const aggregate = [
      { $match: { _id: new Types.ObjectId(orderId) } },

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
          from: 'users',
          localField: 'shop',
          foreignField: '_id',
          pipeline: [{ $project: { password: 0 } }],
          as: 'shop'
        }
      },
      { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: 'addresses',
          localField: 'address',
          foreignField: '_id',
          as: 'address'
        }
      },
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },

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
          'items.variant.product': { $arrayElemAt: ['$productInfo', 0] }
        }
      },
      { $project: { productInfo: 0 } },

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

    const results = await OrderModel.aggregate(aggregate);
    const order = results[0];

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

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

  getByShopId: async (shopId: string) => {
    if (!Types.ObjectId.isValid(shopId))
      throw createHttpError(400, 'Invalid shop id');

    const orders = await OrderModel.find({ shop: shopId }).sort({
      createdAt: -1
    });

    return orders;
  },

  create: async (orderData: IOrder) => {
    const { user, address, items, payment, shipment, customization, metadata } =
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
      )
        throw createHttpError(400, 'Invalid giftMessage');

      if (
        customization.isAnonymous !== undefined &&
        typeof customization.isAnonymous !== 'boolean'
      )
        throw createHttpError(400, 'Invalid isAnonymous value');

      if (
        customization.deliveryTimeRequested &&
        isNaN(new Date(customization.deliveryTimeRequested).getTime())
      )
        throw createHttpError(400, 'Invalid deliveryTimeRequested');
    }

    if (!Array.isArray(items) || items.length === 0)
      throw createHttpError(400, 'Order must contain at least one item');

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
    if (shipment.status && !allowedShipmentStatus.includes(shipment.status))
      throw createHttpError(400, 'Invalid shipment status');

    if (!payment || !['cod', 'banking'].includes(payment.method))
      throw createHttpError(400, 'Invalid or missing payment method');

    const paymentStatus: PaymentStatus =
      payment.method === 'banking' ? 'awaiting_payment' : 'unpaid';

    const [existingUser, existingAddress] = await Promise.all([
      UserRepository.findById(user),
      AddressModel.findById(address)
    ]);
    if (!existingUser) throw createHttpError(404, 'User not found');
    if (!existingAddress) throw createHttpError(404, 'Address not found');

    const variantChecks = items.map(async (item, index) => {
      if (!Types.ObjectId.isValid(item.variant))
        throw createHttpError(400, `Invalid variant id at index ${index}`);
      if (!item.quantity || item.quantity < 1)
        throw createHttpError(400, `Quantity must be ≥1 at index ${index}`);
      if (!item.price || item.price < 0)
        throw createHttpError(400, `Price must be ≥0 at index ${index}`);

      const [variantDoc, product] = await Promise.all([
        VariantRepository.findById(item.variant),
        ProductRepository.findOne({ variants: item.variant }).select('shop')
      ]);

      if (!variantDoc)
        throw createHttpError(400, `Variant not found at index ${index}`);
      if (!product)
        throw createHttpError(
          400,
          `Shop not found for variant at index ${index}`
        );

      return {
        ...item,
        shopId: product.shop.toString()
      };
    });

    const validatedItems = await Promise.all(variantChecks);

    const shopItemMap = new Map<string, typeof validatedItems>();
    for (const item of validatedItems) {
      if (!shopItemMap.has(item.shopId)) shopItemMap.set(item.shopId, []);
      shopItemMap.get(item.shopId)!.push(item);
    }

    const orders: IOrder[] = [];

    for (const [shopId, groupedItems] of shopItemMap.entries()) {
      const totalQuantity = groupedItems.reduce(
        (sum, it) => sum + it.quantity,
        0
      );
      const itemsTotal = groupedItems.reduce(
        (sum, it) => sum + it.quantity * it.price,
        0
      );
      const totalBeforeDiscount = itemsTotal + shipment.shippingCost;

      let discountAmount = 0;
      if (metadata?.voucherData && metadata?.voucherData.code) {
        const voucher = await VoucherRepository.findById(
          metadata?.voucherData.id
        );
        if (!voucher) throw createHttpError(404, 'Voucher not found');
        if (voucher.status === 'expired')
          throw createHttpError(400, 'Voucher expired');
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit)
          throw createHttpError(400, 'Voucher usage limit reached');

        if (voucher.discountType === 'percentage') {
          discountAmount =
            (totalBeforeDiscount * Math.abs(voucher.discountValue)) / 100;
        } else if (voucher.discountType === 'fixed') {
          discountAmount = Math.abs(voucher.discountValue);
        }

        if (discountAmount > totalBeforeDiscount)
          discountAmount = totalBeforeDiscount;
      }
      const finalTotal = parseFloat(
        Math.max(totalBeforeDiscount - discountAmount, 0).toFixed(3)
      );

      const order = await OrderModel.create({
        user,
        shop: shopId,
        address,
        items: groupedItems.map(({ shopId, ...rest }) => rest),
        totalQuantity,
        totalPrice: finalTotal,
        payment: {
          amount: finalTotal,
          method: payment.method,
          status: paymentStatus,
          description: payment.description,
          gatewayRef: payment.gatewayRef,
          paymentDate: payment.paymentDate
        },
        shipment,
        customization,
        metadata
      });
      if (order)
        await voucherService.updateUsedCount(
          metadata?.voucherData?.id as string
        );
      orders.push(order);
    }

    await Promise.all(
      orders.map(async order => {
        const populatedOrder = await OrderModel.findById(order._id)
          .populate('address user shop')
          .populate({
            path: 'items.variant',
            populate: {
              path: 'product',
              select: 'title skuCode thumbnailImage shop'
            }
          });

        const plainOrder = populatedOrder?.toObject();
        if (plainOrder?.shop?.email)
          await mailService.sendOrderSuccessToShop(
            plainOrder,
            plainOrder.shop.email
          );
        if (existingUser?.email)
          await mailService.sendOrderSuccessToCustomer(
            plainOrder,
            existingUser.email
          );
      })
    );

    return orders;
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
