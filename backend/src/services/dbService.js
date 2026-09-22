import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CVModel } from '../models/CV.js';
import { RawVideoModel } from '../models/RawVideo.js';
import { FinalVideoModel } from '../models/FinalVideo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial default seed data
const DEFAULT_CVS = [
  {
    personKey: 'shubham',
    personName: 'Shubham Kumar Jha',
    role: 'Full Stack & Lead Developer',
    bio: 'Computer Science Engineering student at Centurion University. Specialized in modern full-stack web applications, AI integrations, and responsive UI/UX architecture.',
    skills: ['React.js', 'Node.js', 'TypeScript', 'MongoDB', 'TailwindCSS', 'Python'],
    avatarUrl: '/team/shubham.jpg',
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    uploadedAt: null
  },
  {
    personKey: 'priyatam',
    personName: 'Priyatam Raj',
    role: 'System Architect & Backend Specialist',
    bio: 'Tech enthusiast passionate about scalable cloud infrastructure, backend microservices, distributed systems, and API design at CUTM.',
    skills: ['Express.js', 'PostgreSQL', 'Docker', 'REST APIs', 'Cloud Computing', 'Data Structures'],
    avatarUrl: '/team/priyatam.jpg',
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    uploadedAt: null
  },
  {
    personKey: 'jisu',
    personName: 'Jisu Kumar Thakur',
    role: 'UI/UX Designer & Frontend Engineer',
    bio: 'Creative engineering mind focused on cinematic micro-interactions, responsive design systems, accessibility, and dynamic web presentations.',
    skills: ['Framer Motion', 'Figma', 'React', 'CSS Architecture', 'UI/UX', 'Video Editing'],
    avatarUrl: '/team/jisu.jpg',
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    uploadedAt: null
  }
];

const DEFAULT_RAW_VIDEOS = [
  {
    slotId: 1,
    title: 'Raw Video 01',
    description: 'Initial brainstorming, setup & project discussion session recordings.',
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    thumbnailUrl: null,
    duration: null,
    uploadedAt: null,
    publicUrl: null,
    qrMode: 'dynamic',
    customQrUrl: null,
    qrFileName: null,
    qrUpdatedAt: null
  },
  {
    slotId: 2,
    title: 'Raw Video 02',
    description: 'Core development sprint, coding footage & architecture deep-dive.',
    fileUrl: null,
    fileName: null,
    fileSize: null,
    mimeType: null,
    thumbnailUrl: null,
    duration: null,
    uploadedAt: null,
    publicUrl: null,
    qrMode: 'dynamic',
    customQrUrl: null,
    qrFileName: null,
    qrUpdatedAt: null
  }
];

const DEFAULT_FINAL_VIDEO = {
  title: 'Final Video Resume',
  subtitle: 'Complete high-definition team presentation for Centurion University of Technology and Management (CUTM)',
  fileUrl: null,
  fileName: null,
  fileSize: null,
  mimeType: null,
  thumbnailUrl: null,
  publicUrl: null,
  qrMode: 'dynamic',
  customQrUrl: null,
  qrFileName: null,
  qrUpdatedAt: null,
  duration: null,
  uploadedAt: null
};

class DbService {
  constructor() {
    this.isMongoConnected = false;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        cvs: DEFAULT_CVS,
        rawVideos: DEFAULT_RAW_VIDEOS,
        finalVideo: DEFAULT_FINAL_VIDEO,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
  }

  setMongoConnected(status) {
    this.isMongoConnected = status;
    console.log(`[DB Service] Storage mode: ${status ? 'MongoDB Engine' : 'Atomic JSON Persistence Engine'}`);
  }

  readJsonDb() {
    this.ensureDataDir();
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('[DB Service] Error reading JSON db, restoring defaults:', e);
      const initialData = {
        cvs: DEFAULT_CVS,
        rawVideos: DEFAULT_RAW_VIDEOS,
        finalVideo: DEFAULT_FINAL_VIDEO,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
  }

  writeJsonDb(data) {
    this.ensureDataDir();
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  }

  // --- CV Operations ---
  async getCVs() {
    if (this.isMongoConnected) {
      try {
        let cvs = await CVModel.find().lean();
        if (!cvs || cvs.length === 0) {
          await CVModel.insertMany(DEFAULT_CVS);
          cvs = await CVModel.find().lean();
        }
        return cvs;
      } catch (err) {
        console.warn('[DB Service] MongoDB error getting CVs, falling back to JSON:', err.message);
      }
    }
    const db = this.readJsonDb();
    return db.cvs || DEFAULT_CVS;
  }

  async getCVByPerson(personKey) {
    if (this.isMongoConnected) {
      try {
        const cv = await CVModel.findOne({ personKey }).lean();
        if (cv) return cv;
      } catch (err) {
        console.warn('[DB Service] MongoDB error finding CV:', err.message);
      }
    }
    const db = this.readJsonDb();
    return db.cvs.find(c => c.personKey.toLowerCase() === personKey.toLowerCase()) || null;
  }

  async updateCV(personKey, updateData) {
    if (this.isMongoConnected) {
      try {
        const updated = await CVModel.findOneAndUpdate(
          { personKey },
          { $set: updateData },
          { new: true, upsert: true }
        ).lean();
        return updated;
      } catch (err) {
        console.warn('[DB Service] MongoDB error updating CV:', err.message);
      }
    }
    const db = this.readJsonDb();
    const idx = db.cvs.findIndex(c => c.personKey.toLowerCase() === personKey.toLowerCase());
    if (idx !== -1) {
      db.cvs[idx] = { ...db.cvs[idx], ...updateData };
    } else {
      const defaultPerson = DEFAULT_CVS.find(c => c.personKey === personKey) || { personKey, personName: personKey };
      db.cvs.push({ ...defaultPerson, ...updateData });
    }
    this.writeJsonDb(db);
    return db.cvs.find(c => c.personKey.toLowerCase() === personKey.toLowerCase());
  }

  async deleteCVFile(personKey) {
    const clearData = {
      fileUrl: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      uploadedAt: null
    };
    return this.updateCV(personKey, clearData);
  }

  // --- Raw Videos Operations ---
  async getRawVideos() {
    if (this.isMongoConnected) {
      try {
        let videos = await RawVideoModel.find().sort({ slotId: 1 }).lean();
        if (!videos || videos.length === 0) {
          await RawVideoModel.insertMany(DEFAULT_RAW_VIDEOS);
          videos = await RawVideoModel.find().sort({ slotId: 1 }).lean();
        }
        return videos;
      } catch (err) {
        console.warn('[DB Service] MongoDB error getting raw videos:', err.message);
      }
    }
    const db = this.readJsonDb();
    return db.rawVideos || DEFAULT_RAW_VIDEOS;
  }

  async getRawVideoBySlot(slotId) {
    const numericSlot = Number(slotId);
    if (this.isMongoConnected) {
      try {
        const vid = await RawVideoModel.findOne({ slotId: numericSlot }).lean();
        if (vid) return vid;
      } catch (err) {
        console.warn('[DB Service] MongoDB error finding raw video:', err.message);
      }
    }
    const db = this.readJsonDb();
    return db.rawVideos.find(v => Number(v.slotId) === numericSlot) || null;
  }

  async updateRawVideo(slotId, updateData) {
    const numericSlot = Number(slotId);
    if (this.isMongoConnected) {
      try {
        const updated = await RawVideoModel.findOneAndUpdate(
          { slotId: numericSlot },
          { $set: updateData },
          { new: true, upsert: true }
        ).lean();
        return updated;
      } catch (err) {
        console.warn('[DB Service] MongoDB error updating raw video:', err.message);
      }
    }
    const db = this.readJsonDb();
    const idx = db.rawVideos.findIndex(v => Number(v.slotId) === numericSlot);
    if (idx !== -1) {
      db.rawVideos[idx] = { ...db.rawVideos[idx], ...updateData };
    } else {
      const defaultVid = DEFAULT_RAW_VIDEOS.find(v => v.slotId === numericSlot) || { slotId: numericSlot, title: `Raw Video 0${numericSlot}` };
      db.rawVideos.push({ ...defaultVid, ...updateData });
    }
    this.writeJsonDb(db);
    return db.rawVideos.find(v => Number(v.slotId) === numericSlot);
  }

  async deleteRawVideo(slotId) {
    const numericSlot = Number(slotId);
    const clearData = {
      fileUrl: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      thumbnailUrl: null,
      duration: null,
      uploadedAt: null,
      qrMode: 'dynamic',
      customQrUrl: null,
      qrFileName: null,
      qrUpdatedAt: null
    };
    return this.updateRawVideo(numericSlot, clearData);
  }

  // --- Final Video Operations ---
  async getFinalVideo() {
    if (this.isMongoConnected) {
      try {
        let vid = await FinalVideoModel.findOne().lean();
        if (!vid) {
          vid = await FinalVideoModel.create(DEFAULT_FINAL_VIDEO);
        }
        return vid;
      } catch (err) {
        console.warn('[DB Service] MongoDB error getting final video:', err.message);
      }
    }
    const db = this.readJsonDb();
    return db.finalVideo || DEFAULT_FINAL_VIDEO;
  }

  async updateFinalVideo(updateData) {
    if (this.isMongoConnected) {
      try {
        let vid = await FinalVideoModel.findOne();
        if (!vid) {
          vid = await FinalVideoModel.create({ ...DEFAULT_FINAL_VIDEO, ...updateData });
        } else {
          Object.assign(vid, updateData);
          await vid.save();
        }
        return vid.toObject ? vid.toObject() : vid;
      } catch (err) {
        console.warn('[DB Service] MongoDB error updating final video:', err.message);
      }
    }
    const db = this.readJsonDb();
    db.finalVideo = { ...(db.finalVideo || DEFAULT_FINAL_VIDEO), ...updateData };
    this.writeJsonDb(db);
    return db.finalVideo;
  }

  async deleteFinalVideo() {
    const clearData = {
      fileUrl: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      thumbnailUrl: null,
      duration: null,
      uploadedAt: null,
      qrMode: 'dynamic',
      customQrUrl: null,
      qrFileName: null,
      qrUpdatedAt: null
    };
    return this.updateFinalVideo(clearData);
  }

  // --- Statistics Overview ---
  async getSystemStats() {
    const [cvs, rawVideos, finalVideo] = await Promise.all([
      this.getCVs(),
      this.getRawVideos(),
      this.getFinalVideo()
    ]);

    const uploadedCvsCount = cvs.filter(c => !!c.fileUrl).length;
    const uploadedRawCount = rawVideos.filter(v => !!v.fileUrl).length;
    const finalUploaded = !!finalVideo?.fileUrl;

    return {
      cvs: {
        total: cvs.length,
        uploaded: uploadedCvsCount,
        percent: Math.round((uploadedCvsCount / (cvs.length || 1)) * 100)
      },
      rawVideos: {
        total: rawVideos.length,
        uploaded: uploadedRawCount,
        percent: Math.round((uploadedRawCount / (rawVideos.length || 1)) * 100)
      },
      finalVideo: {
        uploaded: finalUploaded,
        status: finalUploaded ? 'Uploaded' : 'Pending'
      },
      system: {
        status: 'Online',
        storageEngine: this.isMongoConnected ? 'MongoDB' : 'Persistent Storage',
        serverUptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }
    };
  }
}

export const dbService = new DbService();
