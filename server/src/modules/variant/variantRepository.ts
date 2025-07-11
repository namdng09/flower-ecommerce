import VariantModel, { IVariant } from './variantModel';
import { FilterQuery, Types } from 'mongoose';

export const variantRepository = {
  findAll: async () => {
    return await VariantModel.find();
  },

  findById: async (variantId: string | Types.ObjectId) => {
    return await VariantModel.findById(variantId);
  },

  findByVariantCode: async (variantCode: string) => {
    return await VariantModel.findOne({ variantCode });
  },

  findMany: async (variantIds: string[]) => {
    return await VariantModel.find({ _id: { $in: variantIds } });
  },

  create: async (variantData: Partial<IVariant>) => {
    return await VariantModel.create(variantData);
  },

  createMany: async (variantData: Partial<IVariant>[]) => {
    return await VariantModel.create(variantData);
  },

  findByIdAndUpdate: async (
    variantId: string | Types.ObjectId,
    updateData: Partial<IVariant>
  ) => {
    return await VariantModel.findByIdAndUpdate(variantId, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (variantId: string | Types.ObjectId) => {
    return await VariantModel.findByIdAndDelete(variantId);
  },

  deleteMany: async (variantIds: string[]) => {
    return await VariantModel.deleteMany({ _id: { $in: variantIds } });
  },

  countDocuments: async (filter: FilterQuery<IVariant> = {}) => {
    return await VariantModel.countDocuments(filter);
  },

  updateInventory: async (variantId: string, quantity: number) => {
    return await VariantModel.findByIdAndUpdate(
      variantId,
      { $inc: { inventory: quantity } },
      { new: true }
    );
  }
};
