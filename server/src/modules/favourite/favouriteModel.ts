import mongoose, { Schema, Document , Model    } from "mongoose";

export interface IFavourite {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  products: string[]; // Replace with a specific Product type if available
}

const FavouriteSchema = new Schema<IFavourite>(
  {
    userId: { type: String, required: true, trim: true },
    products: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const FavouriteModel: Model<IFavourite> = mongoose.model<IFavourite>("Favourite", FavouriteSchema);
export default FavouriteModel;