import ProductModel, { IProduct } from './productModel';
import { PipelineStage, FilterQuery, Types } from 'mongoose';

export const productRepository = {
  findAll: async () => {
    return await ProductModel.find().populate('categories shop variants');
  },

  findById: async (productId: string | Types.ObjectId) => {
    return await ProductModel.findById(productId).populate(
      'categories shop variants'
    );
  },

  findByShop: async (shopId: string | Types.ObjectId) => {
    return await ProductModel.find({ shop: shopId }).populate('categories');
  },

  findByCategory: async (categoryId: string | Types.ObjectId) => {
    return await ProductModel.find({ categories: categoryId }).populate('shop');
  },

  findBySKU: async (skuCode: string) => {
    return await ProductModel.findOne({ skuCode });
  },

  create: async (productData: Partial<IProduct>) => {
    return await ProductModel.create(productData);
  },

  findByIdAndUpdate: async (
    productId: string | Types.ObjectId,
    updateData: Partial<IProduct>
  ) => {
    return await ProductModel.findByIdAndUpdate(productId, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (productId: string | Types.ObjectId) => {
    return await ProductModel.findByIdAndDelete(productId);
  },

  aggregate: (pipeline: PipelineStage[]) => {
    return ProductModel.aggregate(pipeline);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregatePaginate: async (aggregate: any, options: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (ProductModel as any).aggregatePaginate(aggregate, options);
  },

  countDocuments: async (filter: FilterQuery<IProduct> = {}) => {
    return await ProductModel.countDocuments(filter);
  }
};
