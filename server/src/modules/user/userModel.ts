import mongoose, { Schema, Document } from 'mongoose';
import { hashPassword } from '~/utils/bcrypt';

export interface IUser extends Document {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  coverUrl?: string;
  password: string;
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
      enum: ['admin', 'customer', 'shop'],
      immutable: true
    },
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

export default mongoose.model<IUser>('User', userSchema);
