import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  productId: mongoose.Types.ObjectId;
  targetType: string;
  rating: number;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null
    },
    targetType: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, trim: true },
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

const ReviewModel: Model<IReview> = mongoose.model<IReview>(
  'Review',
  ReviewSchema
);

export default ReviewModel;
