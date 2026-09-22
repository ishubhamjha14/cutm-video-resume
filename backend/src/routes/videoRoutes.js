import { Router } from 'express';
import {
  getRawVideos,
  getRawVideoBySlot,
  uploadRawVideo,
  updateRawVideoLink,
  replaceRawVideoQr,
  resetRawVideoQr,
  deleteRawVideo,
  getFinalVideo,
  uploadFinalVideo,
  updateFinalVideoLink,
  replaceFinalVideoQr,
  resetFinalVideoQr,
  deleteFinalVideo
} from '../controllers/videoController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { uploadVideo, handleQrUploadMiddleware } from '../middleware/uploadMiddleware.js';

export const rawVideoRouter = Router();
export const finalVideoRouter = Router();

// Raw Videos - Public
rawVideoRouter.get('/', getRawVideos);
rawVideoRouter.get('/:slot', getRawVideoBySlot);

// Raw Videos - Admin Protected
rawVideoRouter.post('/:slot', requireAdmin, uploadVideo.single('videoFile'), uploadRawVideo);
rawVideoRouter.post('/:slot/qr', requireAdmin, handleQrUploadMiddleware, replaceRawVideoQr);
rawVideoRouter.put('/:slot/qr', requireAdmin, handleQrUploadMiddleware, replaceRawVideoQr);
rawVideoRouter.delete('/:slot/qr', requireAdmin, resetRawVideoQr);
rawVideoRouter.put('/:slot/link', requireAdmin, updateRawVideoLink);
rawVideoRouter.patch('/:slot/link', requireAdmin, updateRawVideoLink);
rawVideoRouter.delete('/:slot', requireAdmin, deleteRawVideo);

// Final Video - Public
finalVideoRouter.get('/', getFinalVideo);

// Final Video - Admin Protected
finalVideoRouter.post('/', requireAdmin, uploadVideo.single('videoFile'), uploadFinalVideo);
finalVideoRouter.post('/qr', requireAdmin, handleQrUploadMiddleware, replaceFinalVideoQr);
finalVideoRouter.put('/qr', requireAdmin, handleQrUploadMiddleware, replaceFinalVideoQr);
finalVideoRouter.delete('/qr', requireAdmin, resetFinalVideoQr);
finalVideoRouter.put('/link', requireAdmin, updateFinalVideoLink);
finalVideoRouter.patch('/link', requireAdmin, updateFinalVideoLink);
finalVideoRouter.delete('/', requireAdmin, deleteFinalVideo);


