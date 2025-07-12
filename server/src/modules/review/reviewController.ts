import { Request, Response, NextFunction } from 'express';
import { reviewService } from './reviewService';
import { apiResponse } from '~/types/apiResponse';
import { IReviewRequest } from './reviewModel';

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
  list: async (_req: Request, res: Response): Promise<Response> => {
    const reviews = await reviewService.list();

    return res
      .status(200)
      .json(apiResponse.success('Reviews listed successfully', reviews));
  },
  /**
   * GET /reviews/:id
   * reviewController.show()
   */
  show: async (req: Request, res: Response): Promise<Response> => {
    const { reviewId } = req.params;

    const review = await reviewService.show(reviewId);

    return res
      .status(200)
      .json(apiResponse.success('Review fetched successfully', review));
  },
  /**
   * GET /reviews/product/:productId
   * reviewController.show()
   */
  getByProduct: async (req: Request, res: Response): Promise<Response> => {
    const { productId } = req.params;

    const reviews = await reviewService.getByProduct(productId);

    return res
      .status(200)
      .json(apiResponse.success('Reviews fetched successfully', reviews));
  },
  /**
   * POST /reviews
   * reviewController.create()
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    const reviewData: IReviewRequest = req.body;

    const newReview = await reviewService.create(reviewData);

    return res
      .status(201)
      .json(apiResponse.success('Review created successfully', newReview));
  },
  /**
   * PATCH /reviews/:id
   * reviewController.update()
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    const { reviewId } = req.params;
    const reviewData: IReviewRequest = req.body;

    const review = await reviewService.update(reviewId, reviewData);

    return res
      .status(200)
      .json(apiResponse.success('Review updated successfully', review));
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

      const review = await reviewService.delete(reviewId);

      return res
        .status(200)
        .json(apiResponse.success('Review deleted successfully', review));
    } catch (error) {
      next(error);
    }
  }
};
