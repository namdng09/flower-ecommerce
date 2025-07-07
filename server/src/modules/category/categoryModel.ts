import mongoose, { Document, Schema, Model } from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { PaginateModel, PaginateOptions, PaginateResult } from 'mongoose';

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

CategorySchema.plugin(aggregatePaginate);
export interface CategoryDocument extends mongoose.Document, ICategory {}
export type CategoryPaginateModel = mongoose.PaginateModel<CategoryDocument>;

const CategoryModel = mongoose.model<
  CategoryDocument,
  PaginateModel<CategoryDocument>
>('Category', CategorySchema);

export default CategoryModel;
