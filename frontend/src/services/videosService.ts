import { api } from '@/lib/api';

export interface StreamResponse {
  streamUrl: string;
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
};
