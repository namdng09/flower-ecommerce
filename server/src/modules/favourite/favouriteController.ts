import { NextFunction, Request, Response } from 'express';
import FavouriteModel from './favouriteModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

export const favouriteController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, productId } = req.body;

      if (!userId) {
        throw createHttpError(400, 'User not found');
      }
      if (!productId) {
        throw createHttpError(400, 'Product not found');
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
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  listByUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw createHttpError(400, 'User not found');
      }
      const favourite = await FavouriteModel.findOne({ userId }).populate(
        'products'
      );
      if (!favourite) {
        return res
          .status(200)
          .json(apiResponse.success('No favourite found for this user', []));
      }
      return res
        .status(200)
        .json(
          apiResponse.success(
            'Favourite fetched successfully',
            favourite.products
          )
        );
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, productId } = req.body;
      if (!userId || !productId) {
        throw createHttpError(400, 'userId and productId are required');
      }

      const favourite = await FavouriteModel.findOne({ userId });
      if (!favourite) {
        throw createHttpError(404, 'Favourite not found');
      }

      const initialLength = favourite.products.length;
      favourite.products = favourite.products.filter(
        id => !id.equals(productId)
      );

      if (favourite.products.length === initialLength) {
        return res
          .status(404)
          .json(apiResponse.error('Product not found in favourite'));
      }

      await favourite.save();

      return res
        .status(200)
        .json(
          apiResponse.success(
            'Product removed from favourite successfully',
            favourite
          )
        );
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  }
};
