import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword } from '~/utils/bcrypt';
import CartModel from '../cart/cartModel';
// Line removed as it is unused.

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  avatarUrl?: string;
  coverUrl?: string;
  role: 'admin' | 'customer' | 'shop';
  addresses?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
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
      required: true,
      match: [/^\d{10,11}$/, 'Please enter a valid phone number']
    },
    password: {
      type: String,
      required: true,
      minlength: [6, 'Password must be more than 6 characters long']
    },
    role: {
      type: String,
      required: true,
      enum: ['admin', 'customer', 'shop']
    },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    addresses: [{ type: Schema.Types.ObjectId, ref: 'Address' }]
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

userSchema.post('save', async (doc: IUser, next) => {
  try {
    if (doc.role === 'customer') {
      await CartModel.updateOne(
        { userId: doc._id },
        { $setOnInsert: { userId: doc._id, items: [] } },
        { upsert: true }
      );
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<IUser>('User', userSchema);
