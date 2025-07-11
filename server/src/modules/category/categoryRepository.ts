import CategoryModel, { ICategory } from './categoryModel';
import { FilterQuery, Types, PipelineStage } from 'mongoose';

export const categoryRepository = {
  findAll: async () => {
    return await CategoryModel.find();
  },

  findAllActive: async () => {
    return await CategoryModel.find({ status: 'active' }).lean();
  },

  findById: async (categoryId: string | Types.ObjectId) => {
    return await CategoryModel.findById(categoryId);
  },

  findByTitle: async (title: string) => {
    return await CategoryModel.findOne({ title });
  },

  findParents: async () => {
    return await CategoryModel.find({ parentId: null });
  },

  findChildren: async (parentId: string | Types.ObjectId) => {
    return await CategoryModel.find({ parentId });
  },

  create: async (categoryData: Partial<ICategory>) => {
    return await CategoryModel.create(categoryData);
  },

  findByIdAndUpdate: async (
    categoryId: string | Types.ObjectId,
    updateData: Partial<ICategory>
  ) => {
    return await CategoryModel.findByIdAndUpdate(categoryId, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (categoryId: string | Types.ObjectId) => {
    return await CategoryModel.findByIdAndDelete(categoryId);
  },

  countDocuments: async (filter: FilterQuery<ICategory> = {}) => {
    return await CategoryModel.countDocuments(filter);
  },

  aggregate: (pipeline: PipelineStage[]) => {
    return CategoryModel.aggregate(pipeline);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregatePaginate: async (aggregate: any, options: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (CategoryModel as any).aggregatePaginate(aggregate, options);
  },

  findByTitleExcludingId: async (
    title: string,
    excludeId: string | Types.ObjectId
  ) => {
    return await CategoryModel.findOne({
      title,
      _id: { $ne: excludeId }
    });
  }
};
