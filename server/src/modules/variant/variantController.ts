import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import VariantModel from './variantModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';
import { generateSKU } from '~/utils/generateSKU';

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
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const variants = await VariantModel.find();

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
  show: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid variant id');
      }

      const variant = await VariantModel.findById(id);
      if (!variant) {
        throw createHttpError(404, 'Variant not found');
      }

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
  getByCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { variantCode } = req.params;

      if (!variantCode || variantCode.trim() === '') {
        throw createHttpError(400, 'Variant Code is required');
      }

      const variant = await VariantModel.findOne({
        variantCode: variantCode.trim()
      });

      if (!variant) {
        throw createHttpError(404, 'Variant not found');
      }

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
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        attributes,
        listPrice,
        salePrice,
        image,
        inventory = 0
      } = req.body;

      if (
        !attributes ||
        typeof attributes !== 'object' ||
        Object.keys(attributes).length === 0
      ) {
        throw createHttpError(400, 'Attributes map is required');
      }

      if (salePrice > listPrice) {
        throw createHttpError(400, 'Sale Price cannot exceed List Price');
      }

      let variantCode = generateSKU();

      let existing = await VariantModel.findOne({ variantCode });
      while (existing) {
        variantCode = generateSKU();
        existing = await VariantModel.findOne({ variantCode });
      }

      const variant = await VariantModel.create({
        variantCode,
        attributes,
        listPrice,
        salePrice,
        image,
        inventory
      });

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
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { attributes, listPrice, salePrice, image, inventory } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid variant id');
      }

      const variant = await VariantModel.findById(id);
      if (!variant) {
        throw createHttpError(404, 'Variant not found');
      }

      if (
        salePrice !== undefined &&
        listPrice !== undefined &&
        salePrice > listPrice
      ) {
        throw createHttpError(400, 'Sale Price cannot exceed List Price');
      }

      if (attributes !== undefined) variant.attributes = attributes;
      if (listPrice !== undefined) variant.listPrice = listPrice;
      if (salePrice !== undefined) variant.salePrice = salePrice;
      if (image !== undefined) variant.image = image;
      if (inventory !== undefined) variant.inventory = inventory;

      const updatedVariant = await variant.save();
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
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid variant id');
      }

      const deleted = await VariantModel.findByIdAndDelete(id);
      if (!deleted) {
        throw createHttpError(404, 'Variant not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Variant removed successfully'));
    } catch (error) {
      next(error);
    }
  }
};
