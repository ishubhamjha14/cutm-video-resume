import mongoose from 'mongoose';

const finalVideoSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Final Video Resume'
  },
  subtitle: {
    type: String,
    default: 'Completed digital presentation for Centurion University Team 03'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileName: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: null
  },
  mimeType: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  publicUrl: {
    type: String,
    default: null
  },
  duration: {
    type: String,
    default: null
  },
  qrMode: {
    type: String,
    enum: ['dynamic', 'custom'],
    default: 'dynamic'
  },
  customQrUrl: {
    type: String,
    default: null
  },
  qrFileName: {
    type: String,
    default: null
  },
  qrUpdatedAt: {
    type: Date,
    default: null
  },
  uploadedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export const FinalVideoModel = mongoose.model('FinalVideo', finalVideoSchema);
