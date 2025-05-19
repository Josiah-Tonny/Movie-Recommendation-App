import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Track connection state
let isConnected = false;

const connectDB = async () => {
  // If already connected, return existing connection
  if (isConnected) {
    console.log('Using existing database connection');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error; // Let the calling code handle the error
  }
};

export default connectDB;