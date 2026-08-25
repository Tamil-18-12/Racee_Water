import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    totalCans: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    totalPending: {
      type: Number,
      default: 0,
    },
    totalEmptyDelivered: {
      type: Number,
      default: 0,
    },
    totalEmptyReturned: {
      type: Number,
      default: 0,
    },
    totalEmptyPending: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

customerSchema.index({ name: 'text', mobile: 'text' });

const CustomerModel = mongoose.model('Customer', customerSchema);

export default CustomerModel;
