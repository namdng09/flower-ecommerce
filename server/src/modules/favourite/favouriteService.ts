import { favouriteRepository } from './favouriteRepository';
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

    let favourite = await favouriteRepository.findByUserId(userId);

    if (favourite) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!favourite.products.some((id: any) => id.equals(productObjectId))) {
        favourite.products.push(productObjectId);
        await favourite.save();
      }
    } else {
      favourite = await favouriteRepository.create({
        userId: new Types.ObjectId(userId),
        products: [productObjectId]
      });
    }
    return favourite;
  },

  listByUser: async (userId: string) => {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }

    let favourite = await favouriteRepository.findByUserIdWithProducts(userId);

    if (!favourite) {
      favourite = await favouriteRepository.create({
        userId: new Types.ObjectId(userId)
      });
    }

    return favourite;
  },

  removeFavouriteItem: async (userId: string, productId: string) => {
    if (!userId || !productId) {
      throw createHttpError(400, 'Missing required fields');
    }

    let favourite = await favouriteRepository.findByUserId(userId);
    if (!favourite) {
      favourite = await favouriteRepository.create({
        userId: new Types.ObjectId(userId)
      });
      throw createHttpError(400, 'Favourite list is currently empty');
    }

    const initialLength = favourite.products.length;
    favourite.products = favourite.products.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (id: any) => !id.equals(new Types.ObjectId(productId))
    );

    if (favourite.products.length === initialLength) {
      throw createHttpError(400, 'Product not found in favourite');
    }

    await favourite.save();
    return favourite;
  }
};
