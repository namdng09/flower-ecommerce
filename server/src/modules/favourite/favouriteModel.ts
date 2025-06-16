import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavourite {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  products: mongoose.Types.ObjectId[];
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    userId: { type: String, required: true, trim: true },
    products: [{ type: Schema.Types.Array, ref: 'Product', required: true }]
  },
  { timestamps: true }
);

const FavouriteModel: Model<IFavourite> = mongoose.model<IFavourite>(
  'Favourite',
  FavouriteSchema
);
export default FavouriteModel;
