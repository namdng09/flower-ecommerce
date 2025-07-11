import FavouriteModel, { IFavourite } from './favouriteModel';
import { FilterQuery, Types } from 'mongoose';

export const favouriteRepository = {
  findByUserId: async (userId: string | Types.ObjectId) => {
    return await FavouriteModel.findOne({ userId });
  },

  findByUserIdWithProducts: async (userId: string | Types.ObjectId) => {
    return await FavouriteModel.findOne({ userId }).populate('products');
  },

  create: async (favouriteData: Partial<IFavourite>) => {
    return await FavouriteModel.create(favouriteData);
  },

  findByIdAndUpdate: async (
    favouriteId: string | Types.ObjectId,
    updateData: Partial<IFavourite>
  ) => {
    return await FavouriteModel.findByIdAndUpdate(favouriteId, updateData, {
      new: true
    });
  },

  findByUserIdAndUpdate: async (
    userId: string | Types.ObjectId,
    updateData: Partial<IFavourite>
  ) => {
    return await FavouriteModel.findOneAndUpdate({ userId }, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (favouriteId: string | Types.ObjectId) => {
    return await FavouriteModel.findByIdAndDelete(favouriteId);
  },

  countDocuments: async (filter: FilterQuery<IFavourite> = {}) => {
    return await FavouriteModel.countDocuments(filter);
  },

  addProductToFavourite: async (
    userId: string | Types.ObjectId,
    productId: Types.ObjectId
  ) => {
    return await FavouriteModel.findOneAndUpdate(
      { userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    );
  },

  removeProductFromFavourite: async (
    userId: string | Types.ObjectId,
    productId: Types.ObjectId
  ) => {
    return await FavouriteModel.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true }
    );
  }
};
