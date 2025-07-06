import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  province: string;
  ward: string;
  street: string;
  plusCode: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  addressType: 'home' | 'office' | 'other';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
      // index: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^0\d{9,10}$/.test(v);
        },
        message: (props: any) => `${props.value} is not a valid phone number!`
      }
    },
    province: { type: String, required: true, trim: true },
    ward: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    plusCode: { type: String, required: true, trim: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false,
        validate: {
          validator: function (v: number[]) {
            return (
              v.length === 2 &&
              v[0] >= -180 &&
              v[0] <= 180 &&
              v[1] >= -90 &&
              v[1] <= 90
            );
          },
          message: 'Coordinates must be an array of [longitude, latitude]'
        }
      }
    },
    addressType: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home'
    },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

AddressSchema.index({ location: '2dsphere' });

const AddressModel: Model<IAddress> = mongoose.model<IAddress>(
  'Address',
  AddressSchema
);

export default AddressModel;
