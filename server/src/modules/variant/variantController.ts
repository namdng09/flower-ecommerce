import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { IVariant } from './variantModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';
import { variantService } from './variantService';

/**
 * variantController.ts
 *
 * @description :: Server-side logic for managing variants.
 */
export const variantController = {
  /*
   * GET /variants
   * variantController.list()
   */
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const variants = await variantService.list();

      return res
        .status(200)
        .json(apiResponse.success('Variants listed successfully', variants));
    } catch (error) {
      next(error);
    }
  },

  /*
   * GET /variants/:id
   * variantController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { variantId } = req.params;

      const variant = await variantService.show(variantId);

      return res
        .status(200)
        .json(apiResponse.success('Variant fetched successfully', variant));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /variants/code/:variantCode
   * variantController.getByCode()
   */
  getByCode: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { variantCode } = req.params;

      const variant = await variantService.getByCode(variantCode);

      return res
        .status(200)
        .json(apiResponse.success('Variant fetched successfully', variant));
    } catch (error) {
      next(error);
    }
  },

  /*
   * POST /variants
   * variantController.create()
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const variantData: IVariant = req.body;

      const variant = await variantService.create(variantData);

      return res
        .status(201)
        .json(apiResponse.success('Variant created successfully', variant));
    } catch (error) {
      next(error);
    }
  },

  /*
   * PUT /variants/:id
   * variantController.update()
   */
  update: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { variantId } = req.params;
      const variantData: IVariant = req.body;

      const updatedVariant = await variantService.update(variantId, variantData);

      return res
        .status(200)
        .json(
          apiResponse.success('Variant updated successfully', updatedVariant)
        );
    } catch (error) {
      next(error);
    }
  },

  /*
   * DELETE /variants/:id
   * variantController.remove()
   */
  remove: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { variantId } = req.params;

      await variantService.delete(variantId);

      return res
        .status(200)
        .json(apiResponse.success('Variant removed successfully'));
    } catch (error) {
      next(error);
    }
  }
};
