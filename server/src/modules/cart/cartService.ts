import CartModel, { ICart, ICartItem } from './cartModel';
import VariantModel from '../variant/variantModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { calculateCartTotals } from '~/utils/calculateCartTotals';

export const cartService = {
  show: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    const cart = await CartModel.findOne({ userId })
      .populate({
        path: 'items.variantId',
        select: 'variantCode title salePrice listPrice image product',
        populate: {
          path: 'product',
          select: 'title skuCode thumbnailImage -variants'
        }
      })
      .lean();

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

    const variant = await VariantModel.findById(variantId).select('salePrice');
    if (!variant) throw createHttpError(404, 'Variant not found');

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
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
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;

    const savedCart = await cart.save();

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

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
    }

    const existingCart = cart.items.find(item =>
      item.variantId.equals(variantId)
    );

    if (!existingCart) {
      throw createHttpError(404, 'Variant does not exist in cart');
    }

    existingCart.quantity = quantity;

    const { totalQuantity, totalPrice } = calculateCartTotals(cart.items);
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;

    const savedCart = await cart.save();

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

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
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

    await cart.save();

    return cart;
  },

  clearCart: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid userId');
    }

    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      cart = new CartModel({ userId, items: [] });
    }

    cart.items = [];

    cart.totalQuantity = 0;
    cart.totalPrice = 0;

    await cart.save();

    return cart;
  }
};
