import { api, PaginatedResponse } from '@/lib/api';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc?: string;
  thumbnail?: string;
  previewVideo?: string;
  price: number;
  discountPrice?: number;
  discountExpiry?: string;
  duration: number;
  lessonsCount: number;
  studentsCount: number;
  viewCount: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isFeatured: boolean;
  category?: {
    name: string;
    nameFA: string;
    slug: string;
  };
  lessons?: Lesson[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  isFree: boolean;
  pdfUrl?: string;
  pdfName?: string;
  video?: {
    duration: number;
  };
}

export interface CoursesParams {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
}

export const coursesService = {
  // Get published courses (public)
  getCourses: async (params?: CoursesParams): Promise<PaginatedResponse<Course>> => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get featured courses
  getFeatured: async (): Promise<Course[]> => {
    const response = await api.get('/courses/featured');
    return response.data;
  },

  // Get single course by slug
  getBySlug: async (slug: string): Promise<Course> => {
    const response = await api.get(`/courses/slug/${slug}`);
    return response.data;
  },

  // Get course lessons
  getLessons: async (courseId: string): Promise<Lesson[]> => {
    const response = await api.get(`/lessons/course/${courseId}`);
    return response.data;
  },

  // Track course view
  trackView: async (courseId: string): Promise<void> => {
    await api.post(`/courses/${courseId}/view`).catch(() => {});
  },
};
