import OrderModel, { IOrder } from './orderModel';
import { FilterQuery, Types } from 'mongoose';

export const orderRepository = {
  findAll: async () => {
    return await OrderModel.find().populate('address');
  },

  findById: async (orderId: string | Types.ObjectId) => {
    return await OrderModel.findById(orderId);
  },

  findByUserId: async (userId: string | Types.ObjectId) => {
    return await OrderModel.find({ user: userId }).sort({ createdAt: -1 });
  },

  findByShopId: async (shopId: string | Types.ObjectId) => {
    return await OrderModel.find({ shop: shopId });
  },

  create: async (orderData: Partial<IOrder>) => {
    return await OrderModel.create(orderData);
  },

  findByIdAndUpdate: async (
    orderId: string | Types.ObjectId,
    updateData: Partial<IOrder>
  ) => {
    return await OrderModel.findByIdAndUpdate(orderId, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (orderId: string | Types.ObjectId) => {
    return await OrderModel.findByIdAndDelete(orderId);
  },

  countDocuments: async (filter: FilterQuery<IOrder> = {}) => {
    return await OrderModel.countDocuments(filter);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregate: async (pipeline: any[]) => {
    return await OrderModel.aggregate(pipeline);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregatePaginate: async (pipeline: any[], options: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (OrderModel as any).aggregatePaginate(pipeline, options);
  },

  findWithPopulation: async (orderId: string | Types.ObjectId) => {
    return await OrderModel.findById(orderId)
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
      });
  },

  updateShipmentStatus: async (
    orderId: string | Types.ObjectId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    shipmentData: any
  ) => {
    const order = await OrderModel.findById(orderId);
    if (!order) return null;

    // Apply shipment updates
    if (shipmentData.status !== undefined) {
      order.shipment.status = shipmentData.status;

      if (shipmentData.status === 'delivered') {
        order.shipment.deliveredAt = new Date();
        order.status = 'delivered';

        if (order.payment.method === 'cod') {
          order.payment.paymentDate = order.shipment.deliveredAt;
          order.payment.status = 'paid';
        }
      } else if (shipmentData.status === 'failed') {
        order.status = 'cancelled';
      }
    }

    if (shipmentData.carrier !== undefined) {
      order.shipment.carrier = shipmentData.carrier;
    }
    if (shipmentData.trackingNumber !== undefined) {
      order.shipment.trackingNumber = shipmentData.trackingNumber;
    }
    if (shipmentData.returnReason !== undefined) {
      order.shipment.returnReason = shipmentData.returnReason;
    }

    return await order.save();
  },

  updatePaymentStatus: async (
    orderId: string | Types.ObjectId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentData: any
  ) => {
    const order = await OrderModel.findById(orderId);
    if (!order) return null;

    // Apply payment updates
    if (paymentData.status !== undefined) {
      order.payment.status = paymentData.status;
    }
    if (paymentData.description !== undefined) {
      order.payment.description = paymentData.description;
    }
    if (paymentData.paymentDate !== undefined) {
      order.payment.paymentDate = new Date(paymentData.paymentDate);
    }
    if (paymentData.gatewayRef !== undefined) {
      order.payment.gatewayRef = paymentData.gatewayRef;
    }

    if (paymentData.status === 'expired') {
      order.status = 'cancelled';
    }

    return await order.save();
  },

  updateOrderStatus: async (
    orderId: string | Types.ObjectId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderData: any
  ) => {
    const order = await OrderModel.findById(orderId);
    if (!order) return null;

    if (orderData.status !== undefined) order.status = orderData.status;
    if (orderData.description !== undefined) {
      order.description = orderData.description;
    }

    if (orderData.expectedDeliveryAt !== undefined) {
      const dateObj = new Date(orderData.expectedDeliveryAt);
      if (!isNaN(dateObj.getTime())) {
        order.expectedDeliveryAt = dateObj;
      }
    }

    if (orderData.status === 'delivered' && !order.shipment.deliveredAt) {
      order.shipment.deliveredAt = new Date();
    }

    return await order.save();
  },

  // Complex aggregation for filtering orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findWithFilters: async (matchStage: any, sortStage: any) => {
    const pipeline = [
      { $match: matchStage },
      { $sort: sortStage },
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

    return pipeline;
  },

  // Aggregation for detailed order view
  findByIdWithDetails: async (orderId: string | Types.ObjectId) => {
    const pipeline = [
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

    const results = await OrderModel.aggregate(pipeline);
    return results[0] || null;
  }
};

export default orderRepository;
