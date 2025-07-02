import mongoose, { Schema, Document, Model } from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';
import { PaginateModel, PaginateOptions, PaginateResult } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export type PaymentStatus =
  | 'awaiting_payment'
  | 'unpaid'
  | 'paid'
  | 'expired'
  | 'refunded';

export type ShipmentStatus =
  | 'pending'
  | 'picking_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed';

export interface IOrderItem {
  variant: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IPayment {
  amount: number;
  method: 'cod' | 'banking';
  status: PaymentStatus;
  description?: string;
  paymentDate?: Date;
  gatewayRef?: string;
}

export interface IShipment {
  carrier: string;
  trackingNumber?: string;
  shippingCost: number;
  status: ShipmentStatus;
  isReturn?: boolean;
  returnReason?: string;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalQuantity: number;
  totalPrice: number;
  status: OrderStatus;
  payment: IPayment;
  shipments: IShipment[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
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
      enum: ['awaiting_payment', 'unpaid', 'paid', 'expired', 'refunded'],
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
    status: {
      type: String,
      enum: [
        'pending',
        'picking_up',
        'out_for_delivery',
        'delivered',
        'failed'
      ],
      default: 'pending'
    },
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
    totalQuantity: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: [
        'pending',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered',
        'returned',
        'cancelled'
      ],
      default: 'pending'
    },
    payment: { type: PaymentSchema, required: true },
    shipments: { type: [ShipmentSchema], default: [] },
    description: String
  },
  { timestamps: true }
);

OrderSchema.plugin(aggregatePaginate);

export interface OrderDocument extends IOrder, mongoose.Document {}
export type OrderPaginateModel = PaginateModel<OrderDocument>;

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

const OrderModel = mongoose.model<OrderDocument, OrderPaginateModel>(
  'Order',
  OrderSchema
);

export default OrderModel;
