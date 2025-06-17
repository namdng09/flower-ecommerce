import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import FavouriteModel from './favouriteModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

export const favouriteController = {
  addFavouriteItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { productId } = req.body;

      if (!userId || !productId) {
        throw createHttpError(400, 'Missing required fields');
      }

      let favourite = await FavouriteModel.findOne({ userId });

      if (favourite) {
        if (!favourite.products.some(id => id.equals(productId))) {
          favourite.products.push(productId);
          await favourite.save();
        }
      } else {
        favourite = await FavouriteModel.create({
          userId,
          products: [productId]
        });
      }

      return res
        .status(201)
        .json(
          apiResponse.success(
            'Add product to favourite successfully',
            favourite
          )
        );
    } catch (error) {
      next(error);
    }
  },

  listByUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;

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

      return res
        .status(200)
        .json(apiResponse.success('Favourite fetched successfully', favourite));
    } catch (error) {
      next(error);
    }
  },

  removeFavourityItem: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userId } = req.params;
      const { productId } = req.body;

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
        id => !id.equals(productId)
      );

      if (favourite.products.length === initialLength) {
        throw createHttpError(400, 'Product not found in favourite');
      }

      await favourite.save();

      return res
        .status(200)
        .json(
          apiResponse.success('Product removed from favourite successfully')
        );
    } catch (error) {
      next(error);
    }
  }
};
