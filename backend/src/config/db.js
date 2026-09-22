import mongoose from 'mongoose';
import { config } from './env.js';
import { dbService } from '../services/dbService.js';

export async function connectDB() {
  try {
    if (!config.mongodbUri) {
      console.log('[DB] No MONGODB_URI provided. Running in persistent storage mode.');
      dbService.setMongoConnected(false);
      return;
    }

    mongoose.set('strictQuery', true);
    
    // Set connection timeout to 3000ms so it doesn't block startup if MongoDB is offline
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });

    console.log('[DB] Connected to MongoDB database successfully.');
    dbService.setMongoConnected(true);

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] MongoDB disconnected. Switching to local persistence mode.');
      dbService.setMongoConnected(false);
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[DB] MongoDB reconnected.');
      dbService.setMongoConnected(true);
    });

  } catch (error) {
    console.warn(`[DB] Could not connect to MongoDB (${error.message}). Running with persistent storage mode fallback.`);
    dbService.setMongoConnected(false);
  }
}
