import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { CVS_DIR, VIDEOS_DIR } from '../services/storageService.js';

// CV Storage Configuration
const cvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, CVS_DIR);
  },
  filename: (req, file, cb) => {
    const personKey = req.params.person || 'person';
    const timestamp = Date.now();
    const cleanOrigName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(cleanOrigName).toLowerCase();
    const basename = path.basename(cleanOrigName, ext);
    cb(null, `cv_${personKey}_${basename}_${timestamp}${ext}`);
  }
});

// CV File Filter
const cvFileFilter = (req, file, cb) => {
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedExts.includes(ext) || allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid CV file format. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

export const uploadCV = multer({
  storage: cvStorage,
  fileFilter: cvFileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25 MB max for CV
  }
});

// Video Storage Configuration
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    const slotId = req.params.slot || (req.baseUrl.includes('final') ? 'final' : 'video');
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    cb(null, `video_${slotId}_${timestamp}_${randomSuffix}${ext}`);
  }
});

// Video File Filter
const videoFileFilter = (req, file, cb) => {
  const allowedExts = ['.mp4', '.webm', '.mov', '.mkv'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska'
  ];

  if (allowedExts.includes(ext) || allowedMimeTypes.includes(file.mimetype) || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Only MP4, WebM, and MOV files are allowed.'), false);
  }
};

export const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB max for video
  }
});

// QR Code Storage & Filter
const qrFileFilter = (req, file, cb) => {
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
  const isAllowedExt = allowedExts.includes(ext);

  if (isImageMime || isAllowedExt) {
    cb(null, true);
  } else {
    const error = new Error('Invalid QR image format. Only PNG, JPG, JPEG, and WEBP files are allowed.');
    error.status = 400;
    cb(error, false);
  }
};

export const uploadQR = multer({
  storage: multer.memoryStorage(),
  fileFilter: qrFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max for QR
  }
});

export const handleQrUploadMiddleware = (req, res, next) => {
  const upload = uploadQR.fields([
    { name: 'qr', maxCount: 1 },
    { name: 'qrImage', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          success: false,
          message: 'QR image is too large. Maximum allowed size is 5 MB.'
        });
      }
      return res.status(err.status || 400).json({
        success: false,
        message: err.message || 'Invalid QR image format.'
      });
    }

    const file = req.files?.qr?.[0] || req.files?.qrImage?.[0] || req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid QR image file.'
      });
    }

    req.file = file;
    next();
  });
};


