import { Router } from 'express';
import { login, verifySession, logout } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.get('/verify', requireAdmin, verifySession);
router.post('/logout', logout);

export default router;
