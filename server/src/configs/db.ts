import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const db = process.env.MONGO_URI as string;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(db);
    console.log(`MongoDB is Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error: ', error);
    process.exit(1);
  }
};

export default connectDB;
