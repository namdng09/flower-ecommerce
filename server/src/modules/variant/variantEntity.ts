import { Schema } from 'mongoose';

export interface IVariant {
  variantCode: string;
  title: string;
  listPrice: number;
  salePrice: number;
  image?: string;
  inventory?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const VariantEntity = new Schema<IVariant>(
  {
    variantCode: { type: String, required: true, trim: true, immutable: true },
    title: { type: String, required: true, trim: true },
    listPrice: {
      type: Number,
      required: true,
      min: [0, 'List price must be ≥ 0']
    },
    salePrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(this: IVariant, v: number) {
          return v <= (this.listPrice ?? 0);
        },
        message: 'Sale Price cannot exceed List Price'
      }
    },
    inventory: { type: Number, default: 0, min: 0 },
    image: { type: String }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

VariantEntity.virtual('product', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'variants',
  justOne: false
});

export default VariantEntity;
