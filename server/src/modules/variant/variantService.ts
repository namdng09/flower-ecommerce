import { IVariant } from './variantEntity';
import VariantRepository from './variantRepository';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';
import ProductRepository from '../product/productRepository';

export const variantService = {
  list: async () => {
    const variants = await VariantRepository.find()
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

  getShopIdByVariant: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const product = await ProductRepository.findOne({
      variants: variantId
    }).select('shop');

    if (!product) {
      throw createHttpError(400, 'No product found for this variant');
    }

    return product.shop;
  },

  show: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const variant = await VariantRepository.findById(variantId);
    if (!variant) {
      throw createHttpError(404, 'Variant not found');
    }

    return variant;
  },

  getByCode: async (variantCode: string) => {
    if (!variantCode || variantCode.trim() === '') {
      throw createHttpError(400, 'Variant Code is required');
    }

    const variant = await VariantRepository.findOne({
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

    let existing = await VariantRepository.findOne({ variantCode });
    while (existing) {
      variantCode = generateSKU();
      existing = await VariantRepository.findOne({ variantCode });
    }

    const variant = await VariantRepository.create({
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

    const variant = await VariantRepository.findById(variantId);
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

    const deleted = await VariantRepository.findByIdAndDelete(variantId);
    if (!deleted) {
      throw createHttpError(404, 'Variant not found');
    }

    return deleted;
  }
};
