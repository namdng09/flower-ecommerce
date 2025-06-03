import { Request, Response } from 'express';
import { Types } from 'mongoose';
import VariantModel from './variantModel';
import { apiResponse } from '~/types/apiResponse';

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
  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const variants = await VariantModel.find();

      return res
        .status(200)
        .json(apiResponse.success('Variants listed successfully', variants));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /*
   * GET /variants/:id
   * variantController.show()
   */
  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid variant id'));
      }

      const variant = await VariantModel.findById(id);
      if (!variant) {
        return res.status(404).json(apiResponse.error('Variant not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Variant fetched successfully', variant));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  /*
   * POST /variants
   * variantController.create()
   */
  create: async (req: Request, res: Response) => {
    try {
      const {
        variantCode,
        attributes,
        listPrice,
        salePrice,
        image,
        inventory = 0
      } = req.body;

      // Create generate SKU code function later

      if (!variantCode?.trim()) {
        return res
          .status(400)
          .json(apiResponse.error('variantCode is required'));
      }

      if (
        !attributes ||
        typeof attributes !== 'object' ||
        Object.keys(attributes).length === 0
      ) {
        return res
          .status(400)
          .json(apiResponse.error('Attributes map is required'));
      }

      if (salePrice > listPrice) {
        return res
          .status(400)
          .json(apiResponse.error('Sale Price cannot exceed List Price'));
      }

      const existing = await VariantModel.findOne({ variantCode });
      if (existing) {
        return res
          .status(409)
          .json(apiResponse.error('Variant Code already exists'));
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
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  /*
   * PUT /variants/:id
   * variantController.update()
   */
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { attributes, listPrice, salePrice, image, inventory } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid variant id'));
      }

      const variant = await VariantModel.findById(id);
      if (!variant) {
        return res.status(404).json(apiResponse.error('Variant not found'));
      }

      if (
        salePrice !== undefined &&
        listPrice !== undefined &&
        salePrice > listPrice
      ) {
        return res
          .status(400)
          .json(apiResponse.error('Sale Price cannot exceed List Price'));
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
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  /*
   * DELETE /variants/:id
   * variantController.remove()
   */
  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid variant id'));
      }

      const deleted = await VariantModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json(apiResponse.error('Variant not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Variant removed successfully'));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },
};
