import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import cvRoutes from './routes/cvRoutes.js';
import { rawVideoRouter, finalVideoRouter } from './routes/videoRoutes.js';
import qrRoutes from './routes/qrRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import { UPLOADS_DIR } from './services/storageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow connections from frontend dev / network hosts
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads with proper headers for PDF & Video streaming
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes);
app.use('/api/raw-videos', rawVideoRouter);
app.use('/api/final-video', finalVideoRouter);
app.use('/api/qr', qrRoutes);
app.use('/api/system/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'CUTM Video Resume Backend API',
    institution: 'Centurion University of Technology and Management',
    team: 'Team 03',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Production SPA static serving and routing fallback
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file exceeds maximum allowed file size limit.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  await connectDB();

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`
=====================================================
  CUTM VIDEO RESUME - BACKEND SERVER RUNNING
=====================================================
  Institution : Centurion University of Technology and Management
  Project     : Video Resume Presentation
  Team        : Team 03
  Port        : ${config.port}
  Local API   : http://localhost:${config.port}/api/health
  Admin User  : ${config.adminUsername}
=====================================================
`);
  });
}

startServer();
