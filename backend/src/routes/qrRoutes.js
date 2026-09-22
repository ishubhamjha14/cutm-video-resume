import { Router } from 'express';
import { getRawVideosQR, getFinalVideoQR } from '../controllers/qrController.js';

const router = Router();

router.get('/raw', getRawVideosQR);
router.get('/final', getFinalVideoQR);

export default router;
