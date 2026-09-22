import { dbService } from '../services/dbService.js';
import { StorageService } from '../services/storageService.js';

export async function getAllCVs(req, res) {
  try {
    const cvs = await dbService.getCVs();
    return res.status(200).json({
      success: true,
      data: cvs
    });
  } catch (error) {
    console.error('[CV Controller] Error fetching CVs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve CVs.'
    });
  }
}

export async function getCVByPerson(req, res) {
  try {
    const { person } = req.params;
    const cv = await dbService.getCVByPerson(person);
    if (!cv) {
      return res.status(404).json({
        success: false,
        message: `No record found for team member "${person}".`
      });
    }
    return res.status(200).json({
      success: true,
      data: cv
    });
  } catch (error) {
    console.error('[CV Controller] Error fetching single CV:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve CV details.'
    });
  }
}

export async function uploadCVFile(req, res) {
  try {
    const { person } = req.params;
    const validPersons = ['shubham', 'priyatam', 'jisu'];
    
    if (!validPersons.includes(person.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid person key. Must be one of: ${validPersons.join(', ')}`
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CV file provided in request.'
      });
    }

    // Check if there is an existing file and remove it
    const existing = await dbService.getCVByPerson(person);
    if (existing && existing.fileUrl) {
      StorageService.deleteFileByPath(existing.fileUrl);
    }

    const publicUrl = StorageService.getPublicUrl(req, 'cvs', req.file.filename);

    const updateData = {
      fileUrl: publicUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedAt: new Date()
    };

    const updated = await dbService.updateCV(person, updateData);

    return res.status(200).json({
      success: true,
      message: `CV for ${updated.personName} uploaded successfully!`,
      data: updated
    });
  } catch (error) {
    console.error('[CV Controller] Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error occurred while uploading CV.'
    });
  }
}

export async function deleteCVFile(req, res) {
  try {
    const { person } = req.params;
    const existing = await dbService.getCVByPerson(person);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Member "${person}" not found.`
      });
    }

    if (existing.fileUrl) {
      StorageService.deleteFileByPath(existing.fileUrl);
    }

    const updated = await dbService.deleteCVFile(person);

    return res.status(200).json({
      success: true,
      message: `CV for ${updated.personName} has been removed.`,
      data: updated
    });
  } catch (error) {
    console.error('[CV Controller] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete CV file.'
    });
  }
}
