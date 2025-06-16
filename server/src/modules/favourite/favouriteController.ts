import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import FavouriteModel, { IFavourite } from './favouriteModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';
import { generateSKU } from '~/utils/generateSKU';

/**
 * favouriteController.ts
 *
 * @description :: Server-side logic for managing favourites.
 */
export const favouriteController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, products } = req.body;

      if (!userId) {
        throw createHttpError(400, 'userId is required');
      }
      if (!Array.isArray(products) || products.length === 0) {
        throw createHttpError(400, 'products must be a non-empty array');
      }

   
      let favourite = await FavouriteModel.findOne({ userId });

      if (favourite) {
     
        const newProducts = products.filter(
          (p: string) => !favourite!.products.includes(p)
        );
        if (newProducts.length > 0) {
          favourite.products.push(...newProducts);
          await favourite.save();
        }
      } else {
        
        favourite = await FavouriteModel.create({ userId, products });
      }

      return res
        .status(201)
        .json(apiResponse.success('Favourite updated successfully', favourite));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid favourite id');
      }

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
