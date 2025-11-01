import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(" please define mongo environment variable");
}

async function connectDB() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  
  // If currently connecting, wait for it to complete (with timeout)
  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection timeout: already connecting'));
      }, 10000); // 10 second timeout
      
      mongoose.connection.once('connected', () => {
        clearTimeout(timeout);
        resolve(true);
      });
      
      mongoose.connection.once('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
    return mongoose;
  }
  
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000, // 10 second timeout for server selection
    socketTimeoutMS: 45000, // 45 second socket timeout
  };
  
  try {
    await mongoose.connect(MONGO_URI!, opts);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
  
  return mongoose;
}

export default connectDB;
