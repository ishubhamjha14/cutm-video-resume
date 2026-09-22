import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const UPLOADS_DIR = path.join(__dirname, '../../uploads');
export const CVS_DIR = path.join(UPLOADS_DIR, 'cvs');
export const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
export const QR_UPLOADS_DIR = path.join(UPLOADS_DIR, 'qr');
export const QR_FRONTEND_DIR = path.join(__dirname, '../../../frontend/public/qr');

// Ensure directories exist
[UPLOADS_DIR, CVS_DIR, VIDEOS_DIR, QR_UPLOADS_DIR, QR_FRONTEND_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export class StorageService {
  static getPublicUrl(req, subfolder, filename) {
    if (!filename) return null;
    const protocol = req.protocol;
    const host = req.get('host');
    return `${protocol}://${host}/uploads/${subfolder}/${filename}`;
  }

  static deleteFileByPath(relativePath) {
    if (!relativePath) return;
    try {
      // Remove any leading /uploads/ or full URL
      let cleanPath = relativePath;
      if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        const parts = cleanPath.split('/uploads/');
        if (parts.length > 1) {
          cleanPath = parts[1];
        }
      } else if (cleanPath.startsWith('/uploads/')) {
        cleanPath = cleanPath.replace('/uploads/', '');
      }

      const fullPath = path.join(UPLOADS_DIR, cleanPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`[Storage] Deleted file: ${fullPath}`);
      }
    } catch (err) {
      console.warn(`[Storage] Failed to delete file: ${err.message}`);
    }
  }

  static deleteQrImage(slotId) {
    const prefix = `raw-video-0${slotId}`;
    try {
      [QR_UPLOADS_DIR, QR_FRONTEND_DIR].forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            if (file.startsWith(prefix)) {
              const fullPath = path.join(dir, file);
              try {
                fs.unlinkSync(fullPath);
                console.log(`[Storage] Deleted custom QR: ${fullPath}`);
              } catch (e) {
                console.warn(`[Storage] Could not delete ${fullPath}: ${e.message}`);
              }
            }
          });
        }
      });
    } catch (err) {
      console.warn(`[Storage] Failed to delete custom QR: ${err.message}`);
    }
  }

  static deleteFinalQrImage() {
    const prefix = 'final-video';
    try {
      [QR_UPLOADS_DIR, QR_FRONTEND_DIR].forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            if (file.startsWith(prefix)) {
              const fullPath = path.join(dir, file);
              try {
                fs.unlinkSync(fullPath);
                console.log(`[Storage] Deleted custom Final Video QR: ${fullPath}`);
              } catch (e) {
                console.warn(`[Storage] Could not delete ${fullPath}: ${e.message}`);
              }
            }
          });
        }
      });
    } catch (err) {
      console.warn(`[Storage] Failed to delete Final Video custom QR: ${err.message}`);
    }
  }
}

