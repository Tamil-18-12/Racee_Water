import mongoose from 'mongoose';
import { isUsingLocalDB } from '../config/db.js';
import { createLocalModel } from '../config/localStore.js';

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

const MongooseCustomer = mongoose.model('Customer', customerSchema);
const localCustomer = createLocalModel('customers');

const CustomerModel = new Proxy(MongooseCustomer, {
  get(target, prop) {
    if (isUsingLocalDB && prop in localCustomer) {
      return localCustomer[prop];
    }
    return target[prop];
  },
});

export default CustomerModel;
