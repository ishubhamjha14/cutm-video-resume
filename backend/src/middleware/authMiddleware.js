import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Admin access only.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (decoded.role !== 'admin' || decoded.username !== config.adminUsername) {
      return res.status(403).json({
        success: false,
        message: 'Invalid permissions. Admin privileges required.'
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please log in again.'
    });
  }
}
