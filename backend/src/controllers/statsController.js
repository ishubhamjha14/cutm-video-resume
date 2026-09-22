import { dbService } from '../services/dbService.js';

export async function getSystemStats(req, res) {
  try {
    const stats = await dbService.getSystemStats();
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('[Stats Controller] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve system statistics.'
    });
  }
}
