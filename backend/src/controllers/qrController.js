import { config } from '../config/env.js';
import { dbService } from '../services/dbService.js';

export async function getRawVideosQR(req, res) {
  try {
    const origin = req.headers.origin || req.headers.referer || config.clientUrl || `http://localhost:${config.port}`;
    const cleanOrigin = origin.replace(/\/$/, '');
    const targetUrl = `${cleanOrigin}/#raw-videos`;

    return res.status(200).json({
      success: true,
      title: 'Scan to Access Raw Videos',
      caption: 'Scan to access the raw video collection',
      targetUrl,
      section: 'raw-videos',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[QR Controller] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Raw Videos QR data.'
    });
  }
}

export async function getFinalVideoQR(req, res) {
  try {
    const origin = req.headers.origin || req.headers.referer || config.clientUrl || `http://localhost:${config.port}`;
    const cleanOrigin = origin.replace(/\/$/, '');
    
    const finalVideo = await dbService.getFinalVideo();
    const targetUrl = finalVideo?.publicUrl || `${cleanOrigin}/final-video`;

    return res.status(200).json({
      success: true,
      title: 'Scan to Watch',
      caption: 'Scan to watch the final video resume',
      targetUrl,
      section: 'final-video',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('[QR Controller] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate Final Video QR data.'
    });
  }
}

