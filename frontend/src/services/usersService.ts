import api from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  role: {
    name: string;
    nameFA: string;
  };
  createdAt: string;
}

export interface UserCourse {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    lessonsCount: number;
    duration: number;
  };
  progress: number;
  isLocked: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export const usersService = {
  // Get my courses
  getMyCourses: async (): Promise<UserCourse[]> => {
    const response = await api.get('/users/me/courses');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file: File): Promise<{ avatar: string; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
