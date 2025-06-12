import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import FavouriteModel, { IFavourite } from "./favouriteModel";
import { apiResponse } from "~/types/apiResponse";
import createHttpError from "http-errors";
import { generateSKU } from "~/utils/generateSKU";

/**
 * favouriteController.ts
 *
 * @description :: Server-side logic for managing favourites.
 */
export const favouriteController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, products } = req.body;      
      const favourite = await FavouriteModel.create({ userId, products });
      return res
        .status(201)
        .json(apiResponse.success('Favourite created successfully', favourite));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },    

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
    //   const { userId } = req.query;
      const favourites = await FavouriteModel.find();
      return res
        .status(200)
        .json(apiResponse.success('Favourites listed successfully', favourites));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },
    show: async (req: Request, res: Response, next: NextFunction) => {
        try {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
            throw createHttpError(400, 'Invalid favourite id');
        }
    
        const favourite = await FavouriteModel.findById(id);
        if (!favourite) {
            throw createHttpError(404, 'Favourite not found');
        }
    
        return res
            .status(200)
            .json(apiResponse.success('Favourite fetched successfully', favourite));
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
    },
    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const { userId, products } = req.body;

            if (!Types.ObjectId.isValid(id)) {
                throw createHttpError(400, 'Invalid favourite id');
            }

            const updatedFavourite = await FavouriteModel.findByIdAndUpdate(
                id,
                { userId, products },
                { new: true }
            );

            if (!updatedFavourite) {
                throw createHttpError(404, 'Favourite not found');
            }

            return res
                .status(200)
                .json(apiResponse.success('Favourite updated successfully', updatedFavourite));
        } catch (error) {
            return res.status(500).json(apiResponse.error((error as Error).message));
        }
    }

};