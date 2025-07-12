import { NextFunction, Request, Response } from 'express';
import { apiResponse } from '~/types/apiResponse';
import { paymentService } from './paymentService';

export const paymentController = {
  /**
   * GET /orders
   * orderController.list()
   */
  createPayment: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { amount, description, returnUrl, cancelUrl } = req.body;

      const checkoutUrl = await paymentService.createPayment(
        Number(amount),
        description,
        returnUrl,
        cancelUrl
      );

      return res.redirect(checkoutUrl);
    } catch (error) {
      next(error);
    }
  }
};
