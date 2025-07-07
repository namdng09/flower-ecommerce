import VariantModel, { IVariant } from './variantModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';

export const variantService = {
  list: async () => {
    const variants = await VariantModel.find()
      .populate({
        path: 'product',
        select: 'title skuCode thumbnailImage'
      })
      .lean();

    if (!variants || variants.length === 0) {
      throw createHttpError(404, 'No variant found');
    }
    return variants;
  },

  show: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const variant = await VariantModel.findById(variantId);
    if (!variant) {
      throw createHttpError(404, 'Variant not found');
    }

    return variant;
  },

  getByCode: async (variantCode: string) => {
    if (!variantCode || variantCode.trim() === '') {
      throw createHttpError(400, 'Variant Code is required');
    }

    const variant = await VariantModel.findOne({
      variantCode: variantCode.trim()
    });

    if (!variant) {
      throw createHttpError(404, 'Variant not found');
    }

    return variant;
  },

  create: async (variantData: IVariant) => {
    const { title, listPrice, salePrice, image, inventory = 0 } = variantData;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      throw createHttpError(400, 'Title is required');
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
      title,
      listPrice,
      salePrice,
      image,
      inventory
    });

    return variant;
  },

  update: async (variantId: string, variantData: IVariant) => {
    const { title, listPrice, salePrice, image, inventory } = variantData;

    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const variant = await VariantModel.findById(variantId);
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

    if (title !== undefined) variant.title = title;
    if (listPrice !== undefined) variant.listPrice = listPrice;
    if (salePrice !== undefined) variant.salePrice = salePrice;
    if (image !== undefined) variant.image = image;
    if (inventory !== undefined) variant.inventory = inventory;

    const updatedVariant = await variant.save();
    return updatedVariant;
  },

  delete: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const deleted = await VariantModel.findByIdAndDelete(variantId);
    if (!deleted) {
      throw createHttpError(404, 'Variant not found');
    }

    return deleted;
  }
};
