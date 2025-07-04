import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  title: string;
  image?: string;
  description?: string;
  status: 'active' | 'inactive';
  parentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    image: { type: String, default: '' },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    }
  },
  { timestamps: true }
);

const CategoryModel: Model<ICategory> = mongoose.model<ICategory>(
  'Category',
  CategorySchema
);

export default CategoryModel;
