import { Router } from 'express';
import { getAllCVs, getCVByPerson, uploadCVFile, deleteCVFile } from '../controllers/cvController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { uploadCV } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public routes
router.get('/', getAllCVs);
router.get('/:person', getCVByPerson);

// Admin protected routes
router.post('/:person', requireAdmin, uploadCV.single('cvFile'), uploadCVFile);
router.delete('/:person', requireAdmin, deleteCVFile);

export default router;
