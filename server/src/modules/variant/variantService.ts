import { IVariant } from './variantModel';
import { variantRepository } from './variantRepository';
import { productRepository } from '../product/productRepository';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';

export const variantService = {
  list: async () => {
    const variants = await variantRepository.findAll();

    if (!variants || variants.length === 0) {
      throw createHttpError(404, 'No variant found');
    }
    return variants;
  },

  getShopIdByVariant: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const products = await productRepository.findAll();
    const product = products.find(p =>
      p.variants.some(v => v.toString() === variantId)
    );

    if (!product) {
      throw createHttpError(400, 'No product found for this variant');
    }

    return product.shop;
  },

  show: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const variant = await variantRepository.findById(variantId);
    if (!variant) {
      throw createHttpError(404, 'Variant not found');
    }

    return variant;
  },

  getByCode: async (variantCode: string) => {
    if (!variantCode || variantCode.trim() === '') {
      throw createHttpError(400, 'Variant Code is required');
    }

    const variant = await variantRepository.findByVariantCode(
      variantCode.trim()
    );

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

    let existing = await variantRepository.findByVariantCode(variantCode);
    while (existing) {
      variantCode = generateSKU();
      existing = await variantRepository.findByVariantCode(variantCode);
    }

    const variant = await variantRepository.create({
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

    const variant = await variantRepository.findById(variantId);
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

    const updateData: Partial<IVariant> = {};
    if (title !== undefined) updateData.title = title;
    if (listPrice !== undefined) updateData.listPrice = listPrice;
    if (salePrice !== undefined) updateData.salePrice = salePrice;
    if (image !== undefined) updateData.image = image;
    if (inventory !== undefined) updateData.inventory = inventory;

    const updatedVariant = await variantRepository.findByIdAndUpdate(
      variantId,
      updateData
    );
    return updatedVariant;
  },

  delete: async (variantId: string) => {
    if (!Types.ObjectId.isValid(variantId)) {
      throw createHttpError(400, 'Invalid variant id');
    }

    const deleted = await variantRepository.findByIdAndDelete(variantId);
    if (!deleted) {
      throw createHttpError(404, 'Variant not found');
    }

    return deleted;
  }
};
