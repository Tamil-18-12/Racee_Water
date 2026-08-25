import mongoose from 'mongoose';

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
    totalCansCount: {
      type: Number,
      default: 50,
      min: 1,
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

const SettingsModel = mongoose.model('Settings', settingsSchema);

export default SettingsModel;
