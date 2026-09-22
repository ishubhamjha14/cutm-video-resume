import mongoose from 'mongoose';

const cvSchema = new mongoose.Schema({
  personKey: {
    type: String,
    required: true,
    unique: true,
    enum: ['shubham', 'priyatam', 'jisu']
  },
  personName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Team Member'
  },
  bio: {
    type: String,
    default: ''
  },
  skills: {
    type: [String],
    default: []
  },
  avatarUrl: {
    type: String,
    default: ''
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
  uploadedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export const CVModel = mongoose.model('CV', cvSchema);
