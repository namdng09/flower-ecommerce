import { ICartItem } from './cartModel';
import { cartRepository } from './cartRepository';
import { variantRepository } from '../variant/variantRepository';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { calculateCartTotals } from '~/utils/calculateCartTotals';

export const cartService = {
  show: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const cart = await cartRepository.findByUserIdWithPopulation(userId);

    return cart;
  },

  addCartItem: async (userId: string, cartItemData: ICartItem) => {
    const { variantId, quantity } = cartItemData;

    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid itemId');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid userId');
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      throw createHttpError(400, 'Quantity must be ≥ 1');
    }

    const variant = await variantRepository.findById(variantId);
    if (!variant) throw createHttpError(404, 'Variant not found');

    let cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await cartRepository.create({
        userId: new Types.ObjectId(userId),
        items: []
      });
    }

    const existingCart = cart.items.find(item =>
      item.variantId.equals(variantId)
    );
    if (existingCart) {
      existingCart.quantity += quantity;
    } else {
      cart.items.push({
        variantId,
        quantity,
        price: variant.salePrice
      } as ICartItem);
    }

    const { totalQuantity, totalPrice } = calculateCartTotals(cart.items);

    const savedCart = await cartRepository.findByUserIdAndUpdate(userId, {
      items: cart.items,
      totalQuantity,
      totalPrice
    });

    return savedCart;
  },

  updateCartItem: async (userId: string, cartItemData: ICartItem) => {
    const { variantId, quantity } = cartItemData;

    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid itemId');
    }

    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid userId');
    }

    if (typeof quantity !== 'number' || quantity < 1) {
      throw createHttpError(400, 'Quantity must be ≥ 1');
    }

    let cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await cartRepository.create({
        userId: new Types.ObjectId(userId),
        items: []
      });
    }

    const existingCart = cart.items.find(item =>
      item.variantId.equals(variantId)
    );

    if (!existingCart) {
      throw createHttpError(404, 'Variant does not exist in cart');
    }

    existingCart.quantity = quantity;

    const { totalQuantity, totalPrice } = calculateCartTotals(cart.items);

    const savedCart = await cartRepository.findByUserIdAndUpdate(userId, {
      items: cart.items,
      totalQuantity,
      totalPrice
    });

    return savedCart;
  },

  removeCartItem: async (userId: string, cartItemData: ICartItem) => {
    const { variantId } = cartItemData;

    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid userId');
    }

    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variantId');
    }

    let cart = await cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await cartRepository.create({
        userId: new Types.ObjectId(userId),
        items: []
      });
    }

    const item = cart.items.findIndex(item => item.variantId.equals(variantId));
    if (item === -1) {
      throw createHttpError(404, 'Cart Item not found');
    }

    cart.items.splice(item, 1);

    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    cart.totalPrice = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    await cartRepository.findByUserIdAndUpdate(userId, {
      items: cart.items,
      totalQuantity: cart.totalQuantity,
      totalPrice: cart.totalPrice
    });

    return cart;
  },

  clearCart: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid userId');
    }

    const updatedCart = await cartRepository.findByUserIdAndUpdate(userId, {
      items: [],
      totalQuantity: 0,
      totalPrice: 0
    });

    return updatedCart;
  }
};
