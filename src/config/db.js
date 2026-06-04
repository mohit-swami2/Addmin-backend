import mongoose from 'mongoose';

const globalCache = globalThis;

if (!globalCache.mongoose) {
  globalCache.mongoose = { conn: null, promise: null };
}

export const connectDatabase = async () => {
  const cached = globalCache.mongoose;
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aadmin';

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
