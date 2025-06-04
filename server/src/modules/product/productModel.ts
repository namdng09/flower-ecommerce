import mongoose, { Document, Schema, Model } from 'mongoose';
import { IVariant } from '../variant/variantModel';
import { IAddress } from '../address/addressModel';

export interface IProduct extends Document {
  title: string;
  shop: mongoose.Types.ObjectId;
  skuCode: string;
  category: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'discontinued';
  thumbnailImage?: string;
  description?: string;
  image?: string[];
  variants: mongoose.Types.ObjectId[];
  address: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    shop: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    skuCode: { type: String, required: true, unique: true, trim: true, immutable: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discontinued'],
      default: 'active'
    },
    thumbnailImage: { type: String },
    description: { type: String },
    image: [{ type: String }],
    variants: [{ type: Schema.Types.ObjectId, ref: 'Variant' }],
    address: { type: Schema.Types.ObjectId, ref: 'Address' }
  },
  { timestamps: true }
);

const ProductModel: Model<IProduct> = mongoose.model<IProduct>(
  'Product',
  ProductSchema
);

export default ProductModel;
