import mongoose from 'mongoose';

let isConnected = false;
let isOfflineMode = false;

export const connectDB = async () => {
  if (isConnected) {
    return true;
  }
  
  if (isOfflineMode) {
    console.log('Running in offline mode without MongoDB connection');
    return false;
  }

  try {
    const MONGODB_URI = import.meta.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.warn('MONGODB_URI is not defined in environment variables');
      isOfflineMode = true;
      return false;
    }

    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.log('Switching to offline mode');
    isOfflineMode = true;
    return false;
  }
};

export const isDbConnected = () => isConnected;
export const isOffline = () => isOfflineMode;