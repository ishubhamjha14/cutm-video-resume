import mongoose from 'mongoose';

const rawVideoSchema = new mongoose.Schema({
  slotId: {
    type: Number,
    required: true,
    unique: true,
    enum: [1, 2]
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: 'Behind the scenes raw footage'
  },
  fileUrl: {
    type: String,
    default: null
  },
  publicUrl: {
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

export const RawVideoModel = mongoose.model('RawVideo', rawVideoSchema);
