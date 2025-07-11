import { IOrder, IPayment, IShipment } from './orderModel';
import { OrderStatus, PaymentStatus, ShipmentStatus } from './orderModel';
import orderRepository from './orderRepository';
import { variantRepository } from '../variant/variantRepository';
import { userRepository } from '../user/userRepository';
import addressRepository from '../address/addressRepository';
import { productRepository } from '../product/productRepository';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { mailService } from '../email/emailService';

export const orderService = {
  list: async () => {
    const orders = await orderRepository.findAll();
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const aggregate = await orderRepository.findWithFilters(matchStage, {
      [sortField as string]: sortDirection
    });

    const options = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10
    };

    const result = await orderRepository.aggregatePaginate(aggregate, options);

    return result;
  },

  show: async (orderId: string) => {
    if (!Types.ObjectId.isValid(orderId)) {
      throw createHttpError(400, 'Invalid order id');
    }

    const order = await orderRepository.findByIdWithDetails(orderId);

    if (!order) {
      throw createHttpError(404, 'Order not found');
    }

    return order;
  },

  getByUserId: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId))
      throw createHttpError(400, 'Invalid user id');

    const orders = await orderRepository.findByUserId(userId);

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

    const existingUser = await userRepository.findById(user.toString());
    if (!existingUser) throw createHttpError(404, 'User not found');

    const existingAddress = await addressRepository.findById(address);
    if (!existingAddress) throw createHttpError(404, 'Address not found');

    if (!Array.isArray(items) || items.length === 0)
      throw createHttpError(400, 'Order must contain at least one item');

    const shopItemMap = new Map<string, typeof items>();

    for (const [index, item] of items.entries()) {
      if (!Types.ObjectId.isValid(item.variant))
        throw createHttpError(400, `Invalid variant id at index ${index}`);

      const variantDoc = await variantRepository.findById(item.variant);
      if (!variantDoc)
        throw createHttpError(400, `Variant not found at index ${index}`);

      if (!item.quantity || item.quantity < 1)
        throw createHttpError(400, `Quantity must be ≥1 at index ${index}`);

      if (!item.price || item.price < 0)
        throw createHttpError(400, `Price must be ≥0 at index ${index}`);

      // Find product that contains this variant to get shop info
      const products = await productRepository.findAll();
      const shopProduct = products.find(p =>
        p.variants.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (v: any) => v._id.toString() === item.variant.toString()
        )
      );
      if (!shopProduct)
        throw createHttpError(
          400,
          `Shop not found for variant at index ${index}`
        );

      const key = shopProduct.shop.toString();

      if (!shopItemMap.has(key)) {
        shopItemMap.set(key, []);
      }

      shopItemMap.get(key)!.push(item);
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

    const paymentStatus: PaymentStatus =
      payment.method === 'banking' ? 'awaiting_payment' : 'unpaid';

    const orders = [];

    for (const [shopId, groupedItems] of shopItemMap.entries()) {
      const totalQuantity = groupedItems.reduce(
        (sum, it) => sum + it.quantity,
        0
      );
      const itemsTotal = groupedItems.reduce(
        (sum, it) => sum + it.quantity * it.price,
        0
      );
      const totalPrice = itemsTotal + shipment.shippingCost;

      const order = await orderRepository.create({
        user,
        shop: new Types.ObjectId(shopId),
        address,
        items: groupedItems,
        totalQuantity,
        totalPrice,
        payment: {
          amount: totalPrice,
          method: payment.method,
          status: paymentStatus,
          description: payment.description,
          gatewayRef: payment.gatewayRef,
          paymentDate: payment.paymentDate
        },
        shipment,
        customization
      });

      orders.push(order);
    }

    // Helper function to send email notifications to shops
    async function sendEmailNotifications(orders: IOrder[]) {
      for (const order of orders) {
        const populatedOrder = await orderRepository.findWithPopulation(
          order._id as Types.ObjectId
        );

        const plainPopulatedOrder = populatedOrder?.toObject();

        // Check if shop has email (assuming shop is populated with user data)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const shopEmail = (plainPopulatedOrder?.shop as any)?.email;
        if (shopEmail) {
          // Note: Using sendOrderSuccessToCustomer as a generic send method
          // You may need to implement a specific shop notification method
          await mailService.sendOrderSuccessToCustomer(
            plainPopulatedOrder,
            shopEmail
          );
        }
      }
    }

    // Call the helper function after creating orders
    await sendEmailNotifications(orders);
    //
    // if (plainPopulatedOrder) {
    //   await mailService.sendOrderSuccessToCustomer(
    //     plainPopulatedOrder,
    //     existingUser.email
    //   );
    // }

    return orders;
  },

  updateShipment: async (orderId: string, shipmentData: IShipment) => {
    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const order = await orderRepository.findById(orderId);
    if (!order) throw createHttpError(404, 'Order not found');

    const allowedShipmentStatus: ShipmentStatus[] = [
      'pending',
      'picking_up',
      'out_for_delivery',
      'delivered',
      'failed'
    ];

    if (
      shipmentData.status &&
      !allowedShipmentStatus.includes(shipmentData.status as ShipmentStatus)
    ) {
      throw createHttpError(400, 'Invalid shipment status');
    }

    const updated = await orderRepository.updateShipmentStatus(
      orderId,
      shipmentData
    );

    return updated;
  },

  updatePayment: async (orderId: string, paymentData: IPayment) => {
    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const order = await orderRepository.findById(orderId);
    if (!order) throw createHttpError(404, 'Order not found');

    const allowedPaymentStatus: PaymentStatus[] = [
      'awaiting_payment',
      'unpaid',
      'paid',
      'expired',
      'refunded'
    ];

    if (
      paymentData.status &&
      !allowedPaymentStatus.includes(paymentData.status as PaymentStatus)
    ) {
      throw createHttpError(400, 'Invalid payment status');
    }

    const updated = await orderRepository.updatePaymentStatus(
      orderId,
      paymentData
    );

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

    const order = await orderRepository.findById(orderId);
    if (!order) throw createHttpError(404, 'Order not found');

    const updated = await orderRepository.updateOrderStatus(orderId, {
      status,
      description,
      expectedDeliveryAt
    });

    return updated;
  },

  remove: async (orderId: string) => {
    if (!Types.ObjectId.isValid(orderId))
      throw createHttpError(400, 'Invalid order id');

    const deleted = await orderRepository.findByIdAndDelete(orderId);
    if (!deleted) throw createHttpError(404, 'Order not found');

    return deleted;
  }
};
