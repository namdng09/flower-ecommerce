import mongoose, { Document, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IVoucher extends Document {
  code: string;
  description?: string;
  discountType: discountType;
  discountValue: number;
  minOrderValue?: number;
  usageLimit?: number;
  usedCount: number;
  startDate: Date;
  endDate: Date;
  status: discountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum discountType {
  percentage = 'percentage',
  fixed = 'fixed'
}

export enum discountStatus {
  active = 'active',
  inactive = 'inactive',
  expired = 'expired'
}

const VoucherEntity = new Schema<IVoucher>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true
    },
    description: { type: String, trim: true },
    discountType: {
      type: String,
      enum: Object.values(discountType),
      required: true
    },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null }, // null => unlimited
    usedCount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(discountStatus),
      default: discountStatus.active
    }
  },
  { timestamps: true }
);

VoucherEntity.plugin(aggregatePaginate);

export default VoucherEntity;
