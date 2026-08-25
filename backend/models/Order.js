import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    numberOfCans: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    pricePerCan: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    emptyCansDelivered: {
      type: Number,
      default: 0,
    },
    emptyCansReturned: {
      type: Number,
      default: 0,
    },
    emptyCansPending: {
      type: Number,
      default: 0,
    },
    canNumbers: {
      type: [Number],
      default: [],
    },
    returnedCanNumbers: {
      type: [Number],
      default: [],
    },
    orderSource: {
      type: String,
      enum: ['ONLINE', 'OFFLINE'],
      default: 'ONLINE',
    },
    orderStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      enum: ['PAID', 'PARTIAL', 'PENDING'],
      default: 'PENDING',
    },
    paymentMode: {
      type: String,
      enum: ['CASH', 'ONLINE', 'UPI', 'PENDING'],
      default: 'PENDING',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.customerId = ret.customerId ? ret.customerId.toString() : null;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
