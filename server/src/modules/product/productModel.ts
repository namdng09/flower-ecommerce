import mongoose, { Document, Schema, Model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { PaginateModel, PaginateOptions, PaginateResult } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  shop: mongoose.Types.ObjectId;
  skuCode: string;
  status: 'active' | 'inactive' | 'discontinued';
  thumbnailImage: string;
  image: string[];
  description: string;
  weight: number;
  dimension: {
    length: number;
    width: number;
    height: number;
  };
  categories: mongoose.Types.ObjectId[];
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
    thumbnailImage: { type: String, required: true },
    image: {
      type: [String],
      validate: [
        (val: string[]) => val.length > 0,
        'At least one image is required'
      ]
    },
    description: { type: String, required: true },
    weight: { type: Number, required: true },
    dimension: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    categories: [
      { type: Schema.Types.ObjectId, ref: 'Category', required: true }
    ],
    variants: [{ type: Schema.Types.ObjectId, ref: 'Variant', required: true }]
  },
  { timestamps: true }
);

ProductSchema.plugin(aggregatePaginate);

export interface ProductDocument extends mongoose.Document, IProduct {}
export type ProductPaginateModel = PaginateModel<ProductDocument>;

const ProductModel = mongoose.model<ProductDocument, ProductPaginateModel>(
  'Product',
  ProductSchema
);

export default ProductModel;
