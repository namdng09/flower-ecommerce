import mongoose, { Schema, Types, Document, Model } from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';

export type OrderStatus =
  | 'PENDING' // Đặt hàng nhưng chưa thanh toán
  | 'paid' // Đã thanh toán (online / COD đã thu)
  | 'processing' // Đang chuẩn bị hàng
  | 'shipped' // Đã bàn giao cho đơn vị vận chuyển
  | 'completed' // Giao thành công
  | 'cancelled' // Khách huỷ
  | 'refunded'; // Hoàn tiền

export interface IOrderItem {
  variant: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IPayment {
  amount: number;
  method: 'cod' | 'banking';
  status: 'unpaid' | 'paid' | 'failed';
  description?: string;
  paymentDate?: Date;
  gatewayRef?: string; // ID giao dịch do cổng thanh toán trả về
}

export interface IShipment {
  carrier: string;
  trackingNumber?: string;
  shippingCost: number;
  isReturn?: boolean;
  returnReason?: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  totalCost: number;
  status: OrderStatus;
  payment: IPayment;
  shipments: IShipment[];
  description?: string;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    variant: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
  {
    amount: { type: Number, required: true, min: 0 },
    method: {
      type: String,
      enum: ['cod', 'banking'],
      required: true
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'failed'],
      default: 'unpaid'
    },
    description: String,
    paymentDate: Date,
    gatewayRef: String
  },
  { _id: false }
);

const ShipmentSchema = new Schema<IShipment>(
  {
    carrier: { type: String, required: true },
    trackingNumber: String,
    shippingCost: { type: Number, required: true, min: 0 },
    isReturn: { type: Boolean, default: false },
    returnReason: String,
    notes: String
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true, immutable: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    items: { type: [OrderItemSchema], required: true },
    totalCost: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'pending',
        'paid',
        'processing',
        'shipped',
        'completed',
        'cancelled',
        'refunded'
      ],
      default: 'pending'
    },
    payment: { type: PaymentSchema, required: true },
    shipments: { type: [ShipmentSchema], default: [] },
    description: String
  },
  { timestamps: true }
);

OrderSchema.pre<IOrder>('validate', async function (next) {
  if (!this.orderNumber) {
    let code = generateSKU();

    while (
      await (this.constructor as Model<IOrder>).exists({ orderNumber: code })
    ) {
      code = generateSKU();
    }

    this.orderNumber = code;
  }
  next();
});

export default mongoose.model<IOrder>('Order', OrderSchema);
