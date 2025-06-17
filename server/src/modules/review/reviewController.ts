import { Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import ReviewModel from './reviewModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

/**
 * reviewController.ts
 *
 * @description :: Server-side logic for managing reviews.
 */
export const reviewController = {
  /**
   * GET /reviews
   * reviewController.list()
   */
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const reviews = await ReviewModel.find();

      return res
        .status(200)
        .json(apiResponse.success('Reviews listed successfully', reviews));
    } catch (error) {
      next(error);
    }
  },
  /**
   * GET /reviews/:id
   * reviewController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { reviewId } = req.params;
      if (!Types.ObjectId.isValid(reviewId)) {
        throw createHttpError(400, 'Invalid review id');
      }

      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        throw createHttpError(404, 'Review not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Review fetched successfully', review));
    } catch (error) {
      next(error);
    }
  },
  /**
   * POST /reviews
   * reviewController.create()
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        productId,
        targetType,
        rating,
        description,
        status = 'active',
        images = []
      } = req.body;
      if (!productId || !targetType || !rating) {
        throw createHttpError(400, 'Missing required fields');
      }
      if (!Types.ObjectId.isValid(productId)) {
        throw createHttpError(400, 'Invalid product id');
      }

      const existingReview = await ReviewModel.findOne({ productId });
      if (existingReview) {
        throw createHttpError(400, 'Review for this product already exists');
      }

      const newReview = await ReviewModel.create({
        productId,
        targetType,
        rating,
        description,
        status,
        images
      });
      return res
        .status(201)
        .json(apiResponse.success('Review created successfully', newReview));
    } catch (error) {
      next(error);
    }
  },
  /**
   * PUT /reviews/:id
   * reviewController.update()
   */
  update: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { reviewId } = req.params;
      if (!Types.ObjectId.isValid(reviewId)) {
        throw createHttpError(400, 'Invalid review id');
      }

      const {
        productId,
        targetType,
        rating,
        description,
        images = []
      } = req.body;
      const review = await ReviewModel.findByIdAndUpdate(reviewId, {
        productId,
        targetType,
        rating,
        description,
        images
      });
      if (!review) {
        throw createHttpError(404, 'Review not found');
      }
      if (!Types.ObjectId.isValid(productId)) {
        throw createHttpError(400, 'Invalid product id');
      }

      return res
        .status(200)
        .json(apiResponse.success('Review updated successfully', review));
    } catch (error) {
      next(error);
    }
  },
  /**
   * DELETE /reviews/:id
   * reviewController.delete()
   */
  delete: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { reviewId } = req.params;
      if (!Types.ObjectId.isValid(reviewId)) {
        throw createHttpError(400, 'Invalid review id');
      }

      const review = await ReviewModel.findByIdAndDelete(reviewId);
      if (!review) {
        throw createHttpError(404, 'Review not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Review deleted successfully', review));
    } catch (error) {
      next(error);
    }
  }
};
