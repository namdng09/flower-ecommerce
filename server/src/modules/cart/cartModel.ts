import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICartItem extends Document {
  variantId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant' },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true, min: 0, default: 0 }
  },
  { timestamps: true }
);

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  totalQuantity: number;
  totalPrice: number;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    totalQuantity: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
    items: [CartItemSchema]
  },
  { timestamps: true }
);

const CartModel: Model<ICart> = mongoose.model<ICart>('Cart', CartSchema);

export default CartModel;
