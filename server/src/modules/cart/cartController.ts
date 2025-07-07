import { Request, Response, NextFunction } from 'express';
import { cartService } from './cartService';
import CartModel, { ICartItem } from './cartModel';
import { apiResponse } from '~/types/apiResponse';

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

      const cart = await cartService.show(userId);

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
      const cartItemData: ICartItem = req.body;

      const savedCart = await cartService.addCartItem(userId, cartItemData);

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
      const cartItemData: ICartItem = req.body;

      const savedCart = await cartService.updateCartItem(userId, cartItemData);

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
      const cardItemData: ICartItem = req.body;

      const cart = await cartService.removeCartItem(userId, cardItemData);

      return res
        .status(200)
        .json(apiResponse.success('Cart Item removed successfully', cart));
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

      const cart = await cartService.clearCart(userId);

      return res
        .status(200)
        .json(apiResponse.success('Cart cleared successfully', cart));
    } catch (err) {
      next(err);
    }
  }
};
