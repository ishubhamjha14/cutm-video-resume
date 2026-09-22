export interface TeamMemberCV {
  _id?: string;
  personKey: 'shubham' | 'priyatam' | 'jisu' | string;
  personName: string;
  role: string;
  bio: string;
  skills: string[];
  avatarUrl: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: string | null;
}

export interface RawVideoItem {
  _id?: string;
  slotId: number;
  title: string;
  description: string;
  fileUrl: string | null;
  publicUrl?: string | null;
  qrMode?: 'dynamic' | 'custom';
  customQrUrl?: string | null;
  qrFileName?: string | null;
  qrUpdatedAt?: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
  uploadedAt: string | null;
}

export interface FinalVideoItem {
  _id?: string;
  title: string;
  subtitle: string;
  fileUrl: string | null;
  publicUrl?: string | null;
  qrMode?: 'dynamic' | 'custom';
  customQrUrl?: string | null;
  qrFileName?: string | null;
  qrUpdatedAt?: string | null;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  thumbnailUrl: string | null;
  duration: string | null;
  uploadedAt: string | null;
}

export interface QrCodeResponse {
  success: boolean;
  title: string;
  caption: string;
  targetUrl: string;
  section: string;
  generatedAt: string;
}

export interface SystemStats {
  cvs: {
    total: number;
    uploaded: number;
    percent: number;
  };
  rawVideos: {
    total: number;
    uploaded: number;
    percent: number;
  };
  finalVideo: {
    uploaded: boolean;
    status: string;
  };
  system: {
    status: string;
    storageEngine: string;
    serverUptime: number;
    timestamp: string;
  };
}

export interface AdminUser {
  username: string;
  role: string;
  team: string;
}
