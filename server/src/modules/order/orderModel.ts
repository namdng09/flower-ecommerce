import mongoose, {
  Schema,
  Document,
  Model,
  AggregatePaginateModel
} from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

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
  carrier?: string;
  trackingNumber?: string;
  shippingCost: number;
  status: ShipmentStatus;
  deliveredAt?: Date;
  returnReason?: string;
}

export interface ICustomization {
  giftMessage?: string;
  isAnonymous?: boolean;
  deliveryTimeRequested?: Date;
  notes?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  shop: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  address: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalQuantity: number;
  totalPrice: number;
  status: OrderStatus;
  payment: IPayment;
  shipment: IShipment;
  customization?: ICustomization;
  description?: string;
  expectedDeliveryAt?: Date;
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
    carrier: String,
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
    deliveredAt: { type: Date },
    returnReason: { type: String, trim: true }
  },
  { _id: false }
);

const CustomizationSchema = new Schema<ICustomization>(
  {
    giftMessage: { type: String, trim: true, maxlength: 500 },
    isAnonymous: { type: Boolean },
    deliveryTimeRequested: { type: Date },
    notes: { type: String, trim: true }
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, unique: true, immutable: true },
    shop: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
      required: true
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
    shipment: { type: ShipmentSchema, required: true },
    customization: { type: CustomizationSchema },
    description: { type: String, trim: true },
    expectedDeliveryAt: { type: Date }
  },
  { timestamps: true }
);

OrderSchema.plugin(aggregatePaginate);

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

const OrderModel = mongoose.model<IOrder, AggregatePaginateModel<IOrder>>(
  'Order',
  OrderSchema
);

export default OrderModel;
