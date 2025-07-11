import UserModel, { IUser } from './userModel';
import { FilterQuery, PipelineStage } from 'mongoose';

export const userRepository = {
  findAll: async () => {
    return await UserModel.find().select('-password');
  },

  findById: async (userId: string) => {
    return await UserModel.findById(userId).select('-password');
  },

  findByIdWithPassword: async (userId: string) => {
    return await UserModel.findById(userId);
  },

  findByEmail: async (email: string) => {
    return await UserModel.findOne({ email });
  },

  findByUsername: async (username: string) => {
    return await UserModel.findOne({ username });
  },

  findByGoogleId: async (googleId: string) => {
    return await UserModel.findOne({ googleId });
  },

  findByRole: async (role: 'admin' | 'customer' | 'shop') => {
    return await UserModel.find({ role }).select('-password');
  },

  findShops: async () => {
    return await UserModel.find({ role: 'shop' }).select('-password');
  },

  create: async (userData: Partial<IUser>) => {
    return await UserModel.create(userData);
  },

  findByIdAndUpdate: async (userId: string, updateData: Partial<IUser>) => {
    return await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true
    }).select('-password');
  },

  findByIdAndDelete: async (userId: string) => {
    return await UserModel.findByIdAndDelete(userId);
  },

  countDocuments: async (filter: FilterQuery<IUser> = {}) => {
    return await UserModel.countDocuments(filter);
  },

  aggregate: (pipeline: PipelineStage[]) => {
    return UserModel.aggregate(pipeline);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregatePaginate: async (aggregate: any, options: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (UserModel as any).aggregatePaginate(aggregate, options);
  },

  findShopWithAddress: async (shopId: string) => {
    return await UserModel.findOne({ _id: shopId, role: 'shop' }).select(
      '-password'
    );
  },

  updatePassword: async (userId: string, newPassword: string) => {
    return await UserModel.findByIdAndUpdate(
      userId,
      { password: newPassword },
      { new: true }
    ).select('-password');
  }
};
