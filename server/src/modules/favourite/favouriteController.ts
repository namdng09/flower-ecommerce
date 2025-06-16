import { NextFunction, Request, Response } from 'express';
import FavouriteModel from './favouriteModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

export const favouriteController = {
  // Thêm sản phẩm vào mục yêu thích
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, productId } = req.body;

      if (!userId) {
        throw createHttpError(400, 'userId is required');
      }
      if (!productId) {
        throw createHttpError(400, 'productId is required');
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
            'add product to favourite successfully',
            favourite
          )
        );
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const favourites = await FavouriteModel.find().populate('products');
      return res
        .status(200)
        .json(
          apiResponse.success('All favourites fetched successfully', favourites)
        );
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await FavouriteModel.findByIdAndDelete(id);
      if (!deleted) {
        throw createHttpError(404, 'Favourite not found');
      }
      return res
        .status(200)
        .json(apiResponse.success('Favourite removed successfully'));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  }
};
