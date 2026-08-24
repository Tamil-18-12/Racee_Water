import mongoose from 'mongoose';

export let isUsingLocalDB = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/watercan_delivery';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isUsingLocalDB = false;
    console.log(`🍃 Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`⚠️ MongoDB connection failed: ${err.message}`);
    console.log(`ℹ️ Switching to instant local database engine...`);
    isUsingLocalDB = true;
    console.log(`⚡ Instant Local Storage active (backend/data/db.json)`);
  }
};
