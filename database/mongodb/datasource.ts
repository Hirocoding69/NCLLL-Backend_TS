
import mongoose from 'mongoose';

let connection: typeof mongoose | null = null;

export async function connectDB() {
  if (connection) {
    console.info("Reusing existing MongoDB connection");
    return connection;
  }
  
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/yourdb';
    connection = await mongoose.connect(mongoURI, {
      // These options may vary depending on your mongoose version
      // but include appropriate connection pooling settings
    });
    
    console.info("MongoDB connected successfully");
    
    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      connection = null;
    });
    
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}