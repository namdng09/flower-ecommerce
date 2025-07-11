import ReviewModel, { IReviewRequest } from './reviewModel';
import { FilterQuery, Types } from 'mongoose';

export const reviewRepository = {
  findAll: async () => {
    return await ReviewModel.find();
  },

  findById: async (reviewId: string | Types.ObjectId) => {
    return await ReviewModel.findById(reviewId);
  },

  findByUser: async (userId: string | Types.ObjectId) => {
    return await ReviewModel.find({ userId });
  },

  findByProduct: async (productId: string | Types.ObjectId) => {
    return await ReviewModel.find({ productId });
  },

  findByUserAndProduct: async (
    userId: string | Types.ObjectId,
    productId: string | Types.ObjectId
  ) => {
    return await ReviewModel.findOne({ userId, productId });
  },

  create: async (reviewData: Partial<IReviewRequest>) => {
    const newReview = new ReviewModel(reviewData);
    return await newReview.save();
  },

  findByIdAndUpdate: async (
    reviewId: string | Types.ObjectId,
    updateData: Partial<IReviewRequest>
  ) => {
    return await ReviewModel.findByIdAndUpdate(reviewId, updateData, {
      new: true
    });
  },

  findByIdAndDelete: async (reviewId: string | Types.ObjectId) => {
    return await ReviewModel.findByIdAndDelete(reviewId);
  },

  countDocuments: async (filter: FilterQuery<IReviewRequest> = {}) => {
    return await ReviewModel.countDocuments(filter);
  },

  getAverageRating: async (productId: string | Types.ObjectId) => {
    const result = await ReviewModel.aggregate([
      { $match: { productId: new Types.ObjectId(productId.toString()) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);
    return result[0] || { averageRating: 0, totalReviews: 0 };
  }
};
