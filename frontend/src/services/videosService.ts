import { api } from '@/lib/api';

export interface VideoQualityInfo {
  quality: string;
  resolution: string;
  bitrate: number;
}

export interface StreamResponse {
  streamUrl: string;
  isHls?: boolean;
  qualities?: VideoQualityInfo[];
  duration: number;
  lastPosition: number;
  isCompleted: boolean;
}

export interface VideoProgress {
  id: string;
  watchedSeconds: number;
  isCompleted: boolean;
  lastPosition: number;
}

export const videosService = {
  // Get stream URL (requires auth)
  getStreamUrl: async (videoId: string): Promise<StreamResponse> => {
    const response = await api.get(`/videos/${videoId}/stream`);
    return response.data;
  },

  // Update video progress
  updateProgress: async (
    videoId: string,
    position: number,
    completed = false
  ): Promise<VideoProgress> => {
    const response = await api.patch(`/videos/${videoId}/progress`, {
      position,
      completed,
    });
    return response.data;
  },

  // Upload management
  getStorageMode: async (): Promise<{ mode: string }> => {
    const { data } = await api.get('/videos/storage-mode');
    return data;
  },

  getUploadUrl: async (
    lessonId: string,
    filename: string,
  ): Promise<{ videoId: string; uploadUrl: string; storageKey: string }> => {
    const { data } = await api.post('/videos/upload-url', {
      lessonId,
      filename,
    });
    return data;
  },

  confirmUpload: async (videoId: string, duration: number) => {
    const { data } = await api.post(`/videos/${videoId}/confirm`, { duration });
    return data;
  },

  deleteVideo: async (videoId: string) => {
    const { data } = await api.delete(`/videos/${videoId}`);
    return data;
  },
};
