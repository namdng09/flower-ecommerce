import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewRequest {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  targetType: string;
  rating: number;
  description?: string;
  status: 'active' | 'inactive';
  images?: string[];
}
export interface IReview extends IReviewRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    targetType: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    images: { type: [String], default: [] }
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model<IReview>('Review', ReviewSchema);

export default ReviewModel;
