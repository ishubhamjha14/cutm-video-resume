import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUsername: process.env.ADMIN_USERNAME || 'team03',
  adminPassword: process.env.ADMIN_PASSWORD || 'shupriju',
  jwtSecret: process.env.JWT_SECRET || 'cutm_team03_super_secret_jwt_key_2026_video_resume',
  jwtExpiresIn: '24h',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cutm_video_resume',
  storageProvider: process.env.STORAGE_PROVIDER || 'local',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  }
};
