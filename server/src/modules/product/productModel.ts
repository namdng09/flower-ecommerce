import mongoose, { Document, Schema, Model } from 'mongoose';
import { IVariant } from '../variant/variantModel';

export interface IProduct extends Document {
  title: string;
  shop: mongoose.Types.ObjectId;
  skuCode: string;
  status: 'active' | 'inactive' | 'discontinued';
  thumbnailImage?: string;
  image?: string[];
  description?: string;
  category: mongoose.Types.ObjectId;
  variants: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    shop: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skuCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      immutable: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active'
    },
    thumbnailImage: { type: String },
    image: [{ type: String }],
    description: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    variants: [{ type: Schema.Types.ObjectId, ref: 'Variant' }]
  },
  { timestamps: true }
);

const ProductModel: Model<IProduct> = mongoose.model<IProduct>(
  'Product',
  ProductSchema
);

export default ProductModel;
