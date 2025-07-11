import { IReviewRequest } from './reviewModel';
import { reviewRepository } from './reviewRepository';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export const reviewService = {
  list: async () => {
    const reviews = await reviewRepository.findAll();
    if (!reviews || reviews.length === 0) {
      throw createHttpError(404, 'No reviews found');
    }
    return reviews;
  },

  show: async (reviewId: string) => {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw createHttpError(400, 'Invalid review id');
    }
    const review = await reviewRepository.findById(reviewId);
    if (!review) {
      throw createHttpError(404, 'Review not found');
    }
    return review;
  },

  create: async (reviewData: IReviewRequest) => {
    const { userId, productId, targetType, rating } = reviewData;

    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }
    if (!Types.ObjectId.isValid(productId)) {
      throw createHttpError(400, 'Invalid product id');
    }
    if (!userId || !productId || !targetType || !rating) {
      throw createHttpError(400, 'Missing required fields');
    }

    const newReview = await reviewRepository.create(reviewData);
    return newReview;
  },

  update: async (reviewId: string, reviewData: IReviewRequest) => {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw createHttpError(400, 'Invalid review id');
    }

    const { userId, productId, targetType, rating } = reviewData;

    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, 'Invalid user id');
    }
    if (!Types.ObjectId.isValid(productId)) {
      throw createHttpError(400, 'Invalid product id');
    }
    if (!userId || !productId || !targetType || !rating) {
      throw createHttpError(400, 'Missing required fields');
    }

    const updatedReview = await reviewRepository.findByIdAndUpdate(
      reviewId,
      reviewData
    );
    if (!updatedReview) {
      throw createHttpError(404, 'Review not found');
    }
    return updatedReview;
  },

  delete: async (reviewId: string) => {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw createHttpError(400, 'Invalid review id');
    }
    const deletedReview = await reviewRepository.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      throw createHttpError(404, 'Review not found');
    }
    return deletedReview;
  }
};
