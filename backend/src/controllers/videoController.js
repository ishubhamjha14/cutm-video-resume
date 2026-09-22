import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { dbService } from '../services/dbService.js';
import { StorageService, QR_FRONTEND_DIR, QR_UPLOADS_DIR } from '../services/storageService.js';

// --- Raw Videos ---
export async function getRawVideos(req, res) {
  try {
    const videos = await dbService.getRawVideos();
    return res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('[Video Controller] Error fetching raw videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve raw videos.'
    });
  }
}

export async function getRawVideoBySlot(req, res) {
  try {
    const slotId = Number(req.params.slot);
    if (![1, 2].includes(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID. Must be 1 or 2.'
      });
    }

    const video = await dbService.getRawVideoBySlot(slotId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: `Raw Video slot ${slotId} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('[Video Controller] Error fetching single raw video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve video details.'
    });
  }
}

export async function updateRawVideoLink(req, res) {
  try {
    const slotId = Number(req.params.slot);
    if (![1, 2].includes(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID. Must be 1 or 2.'
      });
    }

    const { publicUrl, resetQrMode } = req.body;
    if (!publicUrl || typeof publicUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid public URL string.'
      });
    }

    let trimmedUrl = publicUrl.trim();
    if (!/^https?:\/\//i.test(trimmedUrl) && !trimmedUrl.startsWith('/')) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    if (!/^https?:\/\/.+/i.test(trimmedUrl) && !trimmedUrl.startsWith('/')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid public URL.'
      });
    }

    const existing = await dbService.getRawVideoBySlot(slotId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Raw Video slot ${slotId} not found.`
      });
    }

    const updatePayload = {
      publicUrl: trimmedUrl,
    };

    if (resetQrMode === true) {
      StorageService.deleteQrImage(slotId);
      updatePayload.qrMode = 'dynamic';
      updatePayload.customQrUrl = null;
      updatePayload.qrFileName = null;
      updatePayload.qrUpdatedAt = null;
    }

    const updated = await dbService.updateRawVideo(slotId, updatePayload);

    return res.status(200).json({
      success: true,
      message: 'Public link updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Update raw video link error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update public link.'
    });
  }
}

export async function replaceRawVideoQr(req, res) {
  try {
    const slotId = Number(req.params.slot);
    if (![1, 2].includes(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID. Must be 1 or 2.'
      });
    }

    console.log('QR upload received:', {
      slot: slotId,
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid QR image file.'
      });
    }

    // Clean up old QR files for this slot
    StorageService.deleteQrImage(slotId);

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const filename = `raw-video-0${slotId}-${Date.now()}-${randomSuffix}${ext}`;

    // Write to backend uploads directory and frontend public directory
    const uploadsDest = path.join(QR_UPLOADS_DIR, filename);
    fs.writeFileSync(uploadsDest, req.file.buffer);

    const frontendDest = path.join(QR_FRONTEND_DIR, filename);
    fs.writeFileSync(frontendDest, req.file.buffer);

    const fixedFrontendDest = path.join(QR_FRONTEND_DIR, `raw-video-0${slotId}.png`);
    fs.writeFileSync(fixedFrontendDest, req.file.buffer);

    const customQrUrl = StorageService.getPublicUrl(req, 'qr', filename);

    const updateData = {
      qrMode: 'custom',
      customQrUrl,
      qrFileName: filename,
      qrUpdatedAt: new Date().toISOString()
    };

    const updated = await dbService.updateRawVideo(slotId, updateData);

    return res.status(200).json({
      success: true,
      message: 'QR code replaced successfully.',
      qrMode: 'custom',
      qrUrl: customQrUrl,
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Replace QR error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to store QR image.'
    });
  }
}

export async function resetRawVideoQr(req, res) {
  try {
    const slotId = Number(req.params.slot);
    if (![1, 2].includes(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID. Must be 1 or 2.'
      });
    }

    StorageService.deleteQrImage(slotId);

    const updateData = {
      qrMode: 'dynamic',
      customQrUrl: null,
      qrFileName: null,
      qrUpdatedAt: null
    };

    const updated = await dbService.updateRawVideo(slotId, updateData);

    return res.status(200).json({
      success: true,
      message: 'Reset to dynamic QR successfully.',
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Reset QR error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset QR code.'
    });
  }
}

export async function uploadRawVideo(req, res) {
  try {
    const slotId = Number(req.params.slot);
    if (![1, 2].includes(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID. Must be 1 or 2.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided.'
      });
    }

    // Remove old file if replaced
    const existing = await dbService.getRawVideoBySlot(slotId);
    if (existing && existing.fileUrl) {
      StorageService.deleteFileByPath(existing.fileUrl);
    }

    const publicUrl = StorageService.getPublicUrl(req, 'videos', req.file.filename);

    const updateData = {
      fileUrl: publicUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    const updated = await dbService.updateRawVideo(slotId, updateData);

    return res.status(200).json({
      success: true,
      message: `Raw Video 0${slotId} uploaded successfully.`,
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Upload raw video error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload raw video.'
    });
  }
}

export async function deleteRawVideo(req, res) {
  try {
    const slotId = Number(req.params.slot);
    if (![1, 2].includes(slotId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot ID. Must be 1 or 2.'
      });
    }

    const existing = await dbService.getRawVideoBySlot(slotId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Raw Video slot ${slotId} not found.`
      });
    }

    if (existing.fileUrl) {
      StorageService.deleteFileByPath(existing.fileUrl);
    }

    StorageService.deleteQrImage(slotId);

    const updated = await dbService.deleteRawVideo(slotId);

    return res.status(200).json({
      success: true,
      message: `Raw Video 0${slotId} and QR removed successfully.`,
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Delete raw video error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete raw video.'
    });
  }
}

// --- Final Video ---
export async function getFinalVideo(req, res) {
  try {
    const finalVid = await dbService.getFinalVideo();
    return res.status(200).json({
      success: true,
      data: finalVid
    });
  } catch (error) {
    console.error('[Video Controller] Error fetching final video:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve final video.'
    });
  }
}

export async function uploadFinalVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided.'
      });
    }

    const existing = await dbService.getFinalVideo();
    if (existing && existing.fileUrl) {
      StorageService.deleteFileByPath(existing.fileUrl);
    }

    const publicUrl = StorageService.getPublicUrl(req, 'videos', req.file.filename);

    const updateData = {
      fileUrl: publicUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    const updated = await dbService.updateFinalVideo(updateData);

    return res.status(200).json({
      success: true,
      message: 'Final Video Resume uploaded successfully!',
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Upload final video error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while uploading final video.'
    });
  }
}

export async function updateFinalVideoLink(req, res) {
  try {
    const { publicUrl, resetQrMode } = req.body;
    if (!publicUrl || typeof publicUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Public URL is required.'
      });
    }

    let trimmedUrl = publicUrl.trim();
    if (!/^https?:\/\//i.test(trimmedUrl) && !trimmedUrl.startsWith('/')) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    if (!/^https?:\/\/.+/i.test(trimmedUrl) && !trimmedUrl.startsWith('/')) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid URL.'
      });
    }

    const updatePayload = {
      publicUrl: trimmedUrl,
    };

    if (resetQrMode === true) {
      StorageService.deleteFinalQrImage();
      updatePayload.qrMode = 'dynamic';
      updatePayload.customQrUrl = null;
      updatePayload.qrFileName = null;
      updatePayload.qrUpdatedAt = null;
    }

    const updated = await dbService.updateFinalVideo(updatePayload);

    return res.status(200).json({
      success: true,
      message: 'Public link updated successfully.',
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Update final video link error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update public link.'
    });
  }
}

export async function replaceFinalVideoQr(req, res) {
  try {
    console.log('QR upload received:', {
      type: 'final-video',
      originalname: req.file?.originalname,
      mimetype: req.file?.mimetype,
      size: req.file?.size
    });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid QR image file.'
      });
    }

    StorageService.deleteFinalQrImage();

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
    const filename = `final-video-${Date.now()}-${randomSuffix}${ext}`;

    // Write to backend uploads directory and frontend public directory
    const uploadsDest = path.join(QR_UPLOADS_DIR, filename);
    fs.writeFileSync(uploadsDest, req.file.buffer);

    const frontendDest = path.join(QR_FRONTEND_DIR, filename);
    fs.writeFileSync(frontendDest, req.file.buffer);

    const fixedFrontendDest = path.join(QR_FRONTEND_DIR, 'final-video.png');
    fs.writeFileSync(fixedFrontendDest, req.file.buffer);

    const customQrUrl = StorageService.getPublicUrl(req, 'qr', filename);

    const updateData = {
      qrMode: 'custom',
      customQrUrl,
      qrFileName: filename,
      qrUpdatedAt: new Date().toISOString()
    };

    const updated = await dbService.updateFinalVideo(updateData);

    return res.status(200).json({
      success: true,
      message: 'Final Video QR code replaced successfully.',
      qrMode: 'custom',
      qrUrl: customQrUrl,
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Replace Final QR error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to store QR image.'
    });
  }
}

export async function resetFinalVideoQr(req, res) {
  try {
    StorageService.deleteFinalQrImage();

    const updateData = {
      qrMode: 'dynamic',
      customQrUrl: null,
      qrFileName: null,
      qrUpdatedAt: null
    };

    const updated = await dbService.updateFinalVideo(updateData);

    return res.status(200).json({
      success: true,
      message: 'Reset to dynamic QR successfully.',
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Reset Final QR error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset QR code.'
    });
  }
}

export async function deleteFinalVideo(req, res) {
  try {
    const existing = await dbService.getFinalVideo();

    if (existing && existing.fileUrl) {
      StorageService.deleteFileByPath(existing.fileUrl);
    }

    StorageService.deleteFinalQrImage();

    const updated = await dbService.deleteFinalVideo();

    return res.status(200).json({
      success: true,
      message: 'Final Video Resume and QR removed successfully.',
      data: updated
    });
  } catch (error) {
    console.error('[Video Controller] Delete final video error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete final video.'
    });
  }
}
