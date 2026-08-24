import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { isUsingLocalDB } from '../config/db.js';
import { createLocalModel } from '../config/localStore.js';

const ownerSchema = new mongoose.Schema(
  {
    ownerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: 'Business Owner',
    },
    mobile: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'ROLE_OWNER',
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
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

ownerSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const MongooseOwner = mongoose.model('Owner', ownerSchema);
const localOwner = createLocalModel('owners');

const OwnerModel = new Proxy(MongooseOwner, {
  get(target, prop) {
    if (isUsingLocalDB && prop in localOwner) {
      return localOwner[prop];
    }
    return target[prop];
  },
});

export default OwnerModel;
