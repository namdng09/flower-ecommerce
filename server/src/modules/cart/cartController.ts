import { Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import CartModel, { ICartItem } from './cartModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';
import VariantModel from '../variant/variantModel';
import { calculateCartTotals } from '~/utils/calculateCartTotals';

/**
 * cartController.ts
 *
 * @description :: Server-side logic for managing carts.
 */
export const cartController = {
  /**
   * GET /carts/:userId
   * cartController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.params;

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

      return res
        .status(200)
        .json(apiResponse.success('Cart fetched successfully', cart));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /carts
   * cartController.addCartItem()
   */
  addCartItem: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.params;
      const { variantId, quantity } = req.body;

      if (!Types.ObjectId.isValid(variantId)) {
        throw createHttpError(400, 'Invalid itemId');
      }

      if (!Types.ObjectId.isValid(userId)) {
        throw createHttpError(400, 'Invalid userId');
      }

      if (typeof quantity !== 'number' || quantity < 1) {
        throw createHttpError(400, 'Quantity must be ≥ 1');
      }

      const variant =
        await VariantModel.findById(variantId).select('salePrice');
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

      return res
        .status(200)
        .json(apiResponse.success('Item added to cart', savedCart));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /carts
   * cartController.updateCartItem()
   */
  updateCartItem: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.params;
      const { variantId, quantity } = req.body;

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

      return res
        .status(200)
        .json(apiResponse.success('Cart item updated successfully', savedCart));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /carts/:userId
   * cartController.removeCartItem()
   */
  removeCartItem: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.params;
      const { variantId } = req.body;

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

      const item = cart.items.findIndex(item =>
        item.variantId.equals(variantId)
      );
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

      return res
        .status(200)
        .json(apiResponse.success('Cart Item removed successfully'));
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /carts/:userId/clear
   * cartController.clearCart()
   */
  clearCart: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { userId } = req.params;

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

      return res
        .status(200)
        .json(apiResponse.success('Cart cleared successfully'));
    } catch (err) {
      next(err);
    }
  }
};
