import { NextFunction, Request, Response } from 'express';
import { favouriteService } from './favouriteService';
import { apiResponse } from '~/types/apiResponse';

export const favouriteController = {
  addFavouriteItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { productId } = req.body;

      const favourite = await favouriteService.addFavouriteItem(
        userId,
        productId
      );

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

      const favourite = await favouriteService.listByUser(userId);

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

      await favouriteService.removeFavouriteItem(userId, productId);

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
