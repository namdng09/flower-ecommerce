import FavouriteModel, { IFavourite } from './favouriteModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export const favouriteService = {
  addFavouriteItem: async (userId: string, productId: string) => {
    if (!userId) {
      throw createHttpError(400, 'User is required');
    }
    if (!productId) {
      throw createHttpError(400, 'Product is required');
    }

    const productObjectId = new Types.ObjectId(productId);

    let favourite = await FavouriteModel.findOne({ userId });

    if (favourite) {
      if (!favourite.products.some(id => id.equals(productObjectId))) {
        favourite.products.push(productObjectId);
        await favourite.save();
      }
    } else {
      favourite = await FavouriteModel.create({
        userId,
        products: [productObjectId]
      });
    }
    return favourite;
  },

  listByUser: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    let favourite = await FavouriteModel.findOne({ userId }).populate(
      'products'
    );

    if (!favourite) {
      favourite = await FavouriteModel.create({
        userId
      });
    }

    return favourite;
  },

  removeFavouriteItem: async (userId: string, productId: string) => {
    if (!userId || !productId) {
      throw createHttpError(400, 'Missing required fields');
    }

    let favourite = await FavouriteModel.findOne({ userId });
    if (!favourite) {
      favourite = await FavouriteModel.create({
        userId
      });
      throw createHttpError(400, 'Favourite list is currently empty');
    }

    const initialLength = favourite.products.length;
    favourite.products = favourite.products.filter(
      id => !id.equals(new Types.ObjectId(productId))
    );

    if (favourite.products.length === initialLength) {
      throw createHttpError(400, 'Product not found in favourite');
    }

    await favourite.save();
    return favourite;
  }
};
