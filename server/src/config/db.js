import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in the .env file.');
  }

  try {
    console.log('Connecting to MongoDB Atlas...');

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (err) {
    console.error('MongoDB Atlas connection failed!');
    console.error(err);

    console.error(
      'The server will not start because MongoDB Atlas is required.'
    );

    process.exit(1);
  }
};