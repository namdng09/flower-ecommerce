import mongoose, { Document, Schema } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface ILoginHistory extends Document {
  user: mongoose.Types.ObjectId;
  ip: string;
  browser?: string | null;
  os?: string | null;
  device?: string | null;
  location?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LoginHistoryEntity = new Schema<ILoginHistory>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ip: { type: String, required: true },
    browser: { type: String, default: null },
    os: { type: String, default: null },
    device: { type: String, default: null },
    location: { type: String, default: null }
  },
  { timestamps: true }
);

LoginHistoryEntity.plugin(aggregatePaginate);

export default LoginHistoryEntity;
