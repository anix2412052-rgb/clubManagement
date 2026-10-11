import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      console.log('Connecting to MongoDB via MONGO_URI...');
      const conn = await mongoose.connect(mongoUri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`⚠️ Failed to connect to MONGO_URI: ${err.message}`);
      console.log('Attempting fallback to local or in-memory MongoDB...');
    }
  }

  // Try local default MongoDB
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/college_event_club', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`✅ Connected to local MongoDB: ${conn.connection.host}`);
    return;
  } catch (localErr) {
    console.log('Local MongoDB not running. Initializing In-Memory MongoDB for seamless development...');
  }

  // Fallback: MongoMemoryServer for instant, zero-setup local dev/testing
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB started and connected: ${uri}`);
  } catch (memErr) {
    console.error('❌ Could not start in-memory database:', memErr.message);
    throw memErr;
  }
};
