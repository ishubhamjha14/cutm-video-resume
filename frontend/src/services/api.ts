import axios from 'axios';
import { TeamMemberCV, RawVideoItem, FinalVideoItem, QrCodeResponse, SystemStats, AdminUser } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization Bearer token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cutm_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // When sending FormData, delete Content-Type so browser sets boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle 401s gracefully
api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // If token expired during admin request
    if (localStorage.getItem('cutm_admin_token')) {
      localStorage.removeItem('cutm_admin_token');
      localStorage.removeItem('cutm_admin_user');
      window.dispatchEvent(new Event('auth-session-expired'));
    }
  }
  return Promise.reject(error);
});

// Helper for multipart QR file uploads using native fetch to guarantee exact browser boundary headers
async function uploadQrMultipart(urlPath: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('qr', file);
  formData.append('qrImage', file);

  const token = localStorage.getItem('cutm_admin_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${urlPath}`, {
    method: 'PUT',
    headers,
    body: formData
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Failed to upload QR image.');
  }

  return result;
}

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<{ success: boolean; token: string; user: AdminUser; message?: string }> => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  verify: async (): Promise<{ success: boolean; user: AdminUser }> => {
    const res = await api.get('/auth/verify');
    return res.data;
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore
    }
  }
};

export const cvApi = {
  getAll: async (): Promise<{ success: boolean; data: TeamMemberCV[] }> => {
    const res = await api.get('/cvs');
    return res.data;
  },
  getByPerson: async (personKey: string): Promise<{ success: boolean; data: TeamMemberCV }> => {
    const res = await api.get(`/cvs/${personKey}`);
    return res.data;
  },
  upload: async (personKey: string, file: File, onProgress?: (percent: number) => void): Promise<{ success: boolean; message: string; data: TeamMemberCV }> => {
    const formData = new FormData();
    formData.append('cvFile', file);

    const res = await api.post(`/cvs/${personKey}`, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return res.data;
  },
  delete: async (personKey: string): Promise<{ success: boolean; message: string; data: TeamMemberCV }> => {
    const res = await api.delete(`/cvs/${personKey}`);
    return res.data;
  }
};

export const videoApi = {
  getRawVideos: async (): Promise<{ success: boolean; data: RawVideoItem[] }> => {
    const res = await api.get('/raw-videos');
    return res.data;
  },
  getRawVideoBySlot: async (slotId: number): Promise<{ success: boolean; data: RawVideoItem }> => {
    const res = await api.get(`/raw-videos/${slotId}`);
    return res.data;
  },
  uploadRawVideo: async (slotId: number, file: File, onProgress?: (percent: number) => void): Promise<{ success: boolean; message: string; data: RawVideoItem }> => {
    const formData = new FormData();
    formData.append('videoFile', file);

    const res = await api.post(`/raw-videos/${slotId}`, formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return res.data;
  },
  updateRawVideoLink: async (slotId: number, publicUrl: string, resetQrMode?: boolean): Promise<{ success: boolean; message: string; data: RawVideoItem }> => {
    const res = await api.put(`/raw-videos/${slotId}/link`, { publicUrl, resetQrMode });
    return res.data;
  },
  replaceRawVideoQr: async (slotId: number, file: File): Promise<{ success: boolean; message: string; data: RawVideoItem; qrUrl?: string; qrMode?: string }> => {
    return await uploadQrMultipart(`/raw-videos/${slotId}/qr`, file);
  },
  resetRawVideoQr: async (slotId: number): Promise<{ success: boolean; message: string; data: RawVideoItem }> => {
    const res = await api.delete(`/raw-videos/${slotId}/qr`);
    return res.data;
  },
  deleteRawVideo: async (slotId: number): Promise<{ success: boolean; message: string; data: RawVideoItem }> => {
    const res = await api.delete(`/raw-videos/${slotId}`);
    return res.data;
  },
  getFinalVideo: async (): Promise<{ success: boolean; data: FinalVideoItem }> => {
    const res = await api.get('/final-video');
    return res.data;
  },
  uploadFinalVideo: async (file: File, onProgress?: (percent: number) => void): Promise<{ success: boolean; message: string; data: FinalVideoItem }> => {
    const formData = new FormData();
    formData.append('videoFile', file);

    const res = await api.post('/final-video', formData, {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    });
    return res.data;
  },
  updateFinalVideoLink: async (publicUrl: string, resetQrMode?: boolean): Promise<{ success: boolean; message: string; data: FinalVideoItem }> => {
    const res = await api.put('/final-video/link', { publicUrl, resetQrMode });
    return res.data;
  },
  replaceFinalVideoQr: async (file: File): Promise<{ success: boolean; message: string; data: FinalVideoItem; qrUrl?: string; qrMode?: string }> => {
    return await uploadQrMultipart('/final-video/qr', file);
  },
  resetFinalVideoQr: async (): Promise<{ success: boolean; message: string; data: FinalVideoItem }> => {
    const res = await api.delete('/final-video/qr');
    return res.data;
  },
  deleteFinalVideo: async (): Promise<{ success: boolean; message: string; data: FinalVideoItem }> => {
    const res = await api.delete('/final-video');
    return res.data;
  }
};

export const qrApi = {
  getRawVideosQR: async (): Promise<QrCodeResponse> => {
    const res = await api.get('/qr/raw');
    return res.data;
  },
  getFinalVideoQR: async (): Promise<QrCodeResponse> => {
    const res = await api.get('/qr/final');
    return res.data;
  }
};

export const statsApi = {
  getSystemStats: async (): Promise<{ success: boolean; data: SystemStats }> => {
    const res = await api.get('/system/stats');
    return res.data;
  }
};

export default api;
