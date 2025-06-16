import mongoose, { Document, Schema, Model } from 'mongoose';

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

const VariantSchema = new Schema<IVariant>(
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
  { timestamps: true }
);

// VariantSchema.index({ variantCode: 1 }, { unique: false });

const VariantModel: Model<IVariant> = mongoose.model('Variant', VariantSchema);
export default VariantModel;
