import mongoose from 'mongoose';
import { isUsingLocalDB } from '../config/db.js';
import { createLocalModel } from '../config/localStore.js';

const settingsSchema = new mongoose.Schema(
  {
    pricePerCan: {
      type: Number,
      required: true,
      default: 20.0,
      min: 1,
    },
    businessName: {
      type: String,
      default: 'Racee Water',
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: '9345038836',
      trim: true,
    },
    address: {
      type: String,
      default: 'Laligam bus stop, laligam, Dharmapuri 636804',
      trim: true,
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

const MongooseSettings = mongoose.model('Settings', settingsSchema);
const localSettings = createLocalModel('settings');

const SettingsModel = new Proxy(MongooseSettings, {
  get(target, prop) {
    if (isUsingLocalDB && prop in localSettings) {
      return localSettings[prop];
    }
    return target[prop];
  },
});

export default SettingsModel;
