import { Schema, Document } from 'mongoose';
import { hashPassword } from '~/utils/bcrypt';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import CartModel from '../cart/cartModel';
import FavouriteModel from '../favourite/favouriteModel';

export interface IUser extends Document {
  googleId?: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  dob?: Date;
  avatarUrl?: string;
  coverUrl?: string;
  role: 'admin' | 'customer' | 'shop';
  createdAt: Date;
  updatedAt: Date;
}

const UserEntity = new Schema<IUser>(
  {
    googleId: { type: String },
    fullName: { type: String, required: true },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    phoneNumber: {
      type: String,
      match: [/^\d{10,11}$/, 'Please enter a valid phone number']
    },
    password: {
      type: String,
      minlength: [6, 'Password must be more than 6 characters long']
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'customer', 'shop']
    },
    dob: { type: Date, default: null },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' }
  },
  { timestamps: true }
);

UserEntity.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

UserEntity.post('save', async (doc: IUser, next) => {
  try {
    if (doc.role === 'customer') {
      await CartModel.updateOne(
        { userId: doc._id },
        { $setOnInsert: { userId: doc._id, items: [] } },
        { upsert: true }
      );

      await FavouriteModel.updateOne(
        { userId: doc._id },
        { $setOnInsert: { userId: doc._id, products: [] } },
        { upsert: true }
      );
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserEntity.plugin(aggregatePaginate);

export default UserEntity;
