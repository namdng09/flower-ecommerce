import ReviewModel, { IReviewRequest } from './reviewModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export const reviewService = {
  list: async () => {
    const reviews = await ReviewModel.find();
    if (!reviews || reviews.length === 0) {
      throw createHttpError(404, 'No reviews found');
    }
    return reviews;
  },

  show: async (reviewId: string) => {
    if (!Types.ObjectId.isValid(reviewId)) {
      throw createHttpError(400, 'Invalid review id');
    }
    const review = await ReviewModel.findById(reviewId);
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

    const newReview = new ReviewModel(reviewData);
    await newReview.save();
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

    const updatedReview = await ReviewModel.findByIdAndUpdate(
      reviewId,
      reviewData,
      { new: true }
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
    const deletedReview = await ReviewModel.findByIdAndDelete(reviewId);
    if (!deletedReview) {
      throw createHttpError(404, 'Review not found');
    }
    return deletedReview;
  }
};
