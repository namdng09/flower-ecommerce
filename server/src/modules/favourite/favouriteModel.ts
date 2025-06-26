import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFavourite {
  userId: mongoose.Types.ObjectId;
  products: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
  },
  { timestamps: true }
);

const FavouriteModel: Model<IFavourite> = mongoose.model<IFavourite>(
  'Favourite',
  FavouriteSchema
);
export default FavouriteModel;
