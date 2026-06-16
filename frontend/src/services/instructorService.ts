import api from '@/lib/api';

export interface InstructorDashboard {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  totalPaidOrders: number;
}

export interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  level: string;
  status: string;
  studentsCount: number;
  lessonsCount: number;
  duration: number;
  category?: { id: string; nameFA: string };
  categoryId?: string;
  description?: string;
  shortDesc?: string;
  createdAt: string;
}

export interface InstructorRevenue {
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number }[];
  courseRevenue: { courseId: string; courseTitle: string; totalSales: number; revenue: number }[];
}

export const instructorService = {
  getDashboard: async (): Promise<InstructorDashboard> => {
    const { data } = await api.get('/instructor/dashboard');
    return data;
  },

  getCourses: async (params?: { page?: number; limit?: number }): Promise<{ data: InstructorCourse[]; meta: any }> => {
    const { data } = await api.get('/instructor/courses', { params });
    return data;
  },

  getCourse: async (id: string): Promise<InstructorCourse> => {
    const { data } = await api.get(`/instructor/courses/${id}`);
    return data;
  },

  createCourse: async (courseData: any): Promise<InstructorCourse> => {
    const { data } = await api.post('/instructor/courses', courseData);
    return data;
  },

  updateCourse: async (id: string, courseData: any): Promise<InstructorCourse> => {
    const { data } = await api.patch(`/instructor/courses/${id}`, courseData);
    return data;
  },

  deleteCourse: async (id: string): Promise<void> => {
    await api.delete(`/instructor/courses/${id}`);
  },

  getLessons: async (courseId: string): Promise<any[]> => {
    const { data } = await api.get(`/instructor/courses/${courseId}/lessons`);
    return data;
  },

  createLesson: async (courseId: string, lessonData: any): Promise<any> => {
    const { data } = await api.post(`/instructor/courses/${courseId}/lessons`, lessonData);
    return data;
  },

  updateLesson: async (lessonId: string, lessonData: any): Promise<any> => {
    const { data } = await api.patch(`/instructor/lessons/${lessonId}`, lessonData);
    return data;
  },

  deleteLesson: async (lessonId: string): Promise<void> => {
    await api.delete(`/instructor/lessons/${lessonId}`);
  },

  getRevenue: async (): Promise<InstructorRevenue> => {
    const { data } = await api.get('/instructor/revenue');
    return data;
  },

  // PDF/Handout
  uploadLessonPdf: async (lessonId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/lessons/${lessonId}/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteLessonPdf: async (lessonId: string) => {
    const { data } = await api.delete(`/lessons/${lessonId}/pdf`);
    return data;
  },

  // Thumbnail
  uploadThumbnail: async (courseId: string, file: File): Promise<{ message: string; thumbnail: string }> => {
    const formData = new FormData();
    formData.append('thumbnail', file);
    const { data } = await api.post(`/instructor/courses/${courseId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
