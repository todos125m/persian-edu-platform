import api, { PaginatedResponse } from '@/lib/api';

// ==================== Types ====================

export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalOrders: number;
  totalRevenue: number;
  totalViews: number;
  recentOrders: AdminOrder[];
  monthlyRevenue: { month: string; amount: number }[];
  userGrowth: { month: string; count: number }[];
  topCourses: { title: string; students: number; views: number; revenue: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  role: { name: string; nameFA: string };
  createdAt: string;
  courses?: {
    course: { id: string; title: string; thumbnail?: string };
    progress: number;
    createdAt: string;
  }[];
}

export interface Role {
  id: string;
  name: string;
  nameFA: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  slug: string;
  description?: string;
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
  categoryId?: string;
  category?: { name?: string; nameFA: string; slug?: string };
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface AdminLesson {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  isFree: boolean;
  isPublished: boolean;
  courseId: string;
  pdfUrl?: string;
  pdfName?: string;
  video?: {
    id: string;
    status: string;
    duration: number;
    originalName: string;
  };
  createdAt: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  user: { firstName: string; lastName: string; email: string };
  items: { course: { title: string }; price: number }[];
  payment?: {
    status: string;
    paidAt?: string;
    refId?: string;
    gateway: string;
    cardNumber?: string;
  };
  createdAt: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  nameFA: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  parentId?: string;
  children?: AdminCategory[];
  _count?: { courses: number };
  createdAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  successfulPayments: number;
  totalRevenue: number;
  successRate: number;
}

// ==================== Service ====================

export const adminService = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/admin/dashboard/stats');
    return data;
  },

  // Users
  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<AdminUser>> => {
    const { data } = await api.get('/users', { params });
    return data;
  },

  getUser: async (id: string): Promise<AdminUser> => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },

  toggleUserActive: async (id: string) => {
    const { data } = await api.patch(`/users/${id}/toggle-active`);
    return data;
  },

  changeUserRole: async (id: string, roleId: string) => {
    const { data } = await api.patch(`/users/${id}/role`, { roleId });
    return data;
  },

  deleteUser: async (id: string) => {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },

  getRoles: async (): Promise<Role[]> => {
    const { data } = await api.get('/users/roles');
    return data;
  },

  // Courses
  getCourses: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Promise<PaginatedResponse<AdminCourse>> => {
    const { data } = await api.get('/courses/admin/all', { params });
    return data;
  },

  getCourse: async (id: string): Promise<AdminCourse> => {
    const { data } = await api.get(`/courses/slug/${id}`);
    return data;
  },

  getCourseById: async (id: string): Promise<AdminCourse> => {
    const { data } = await api.get(`/courses/admin/${id}`);
    return data;
  },

  createCourse: async (courseData: Partial<AdminCourse>): Promise<AdminCourse> => {
    const { data } = await api.post('/courses', courseData);
    return data;
  },

  updateCourse: async (id: string, courseData: Partial<AdminCourse>): Promise<AdminCourse> => {
    const { data } = await api.patch(`/courses/${id}`, courseData);
    return data;
  },

  deleteCourse: async (id: string) => {
    const { data } = await api.delete(`/courses/${id}`);
    return data;
  },

  toggleFeatured: async (id: string) => {
    const { data } = await api.patch(`/courses/${id}/toggle-featured`);
    return data;
  },

  // Lessons
  getLessons: async (courseId: string): Promise<AdminLesson[]> => {
    const { data } = await api.get(`/lessons/course/${courseId}`);
    return data;
  },

  createLesson: async (lessonData: {
    title: string;
    description?: string;
    isFree?: boolean;
    isPublished?: boolean;
    courseId: string;
  }): Promise<AdminLesson> => {
    const { data } = await api.post('/lessons', lessonData);
    return data;
  },

  updateLesson: async (id: string, lessonData: Partial<AdminLesson>): Promise<AdminLesson> => {
    const { data } = await api.patch(`/lessons/${id}`, lessonData);
    return data;
  },

  deleteLesson: async (id: string) => {
    const { data } = await api.delete(`/lessons/${id}`);
    return data;
  },

  reorderLessons: async (courseId: string, lessonIds: string[]) => {
    const { data } = await api.post(`/lessons/course/${courseId}/reorder`, {
      lessonIds,
    });
    return data;
  },

  // Lesson PDF
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

  // Videos
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

  // Orders
  getOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<AdminOrder>> => {
    const { data } = await api.get('/orders/admin/all', { params });
    return data;
  },

  getOrder: async (id: string): Promise<AdminOrder> => {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  // Payments
  getPaymentStats: async (): Promise<PaymentStats> => {
    const { data } = await api.get('/payments/stats');
    return data;
  },

  // Categories
  getCategories: async (): Promise<AdminCategory[]> => {
    const { data } = await api.get('/categories/admin/all');
    return data;
  },

  createCategory: async (categoryData: Partial<AdminCategory>): Promise<AdminCategory> => {
    const { data } = await api.post('/categories', categoryData);
    return data;
  },

  updateCategory: async (
    id: string,
    categoryData: Partial<AdminCategory>,
  ): Promise<AdminCategory> => {
    const { data } = await api.patch(`/categories/${id}`, categoryData);
    return data;
  },

  deleteCategory: async (id: string) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  // Settings
  getSettings: async () => {
    const { data } = await api.get('/settings/admin');
    return data;
  },

  updateSettings: async (settings: { key: string; value: string }[]) => {
    const { data } = await api.put('/settings', { settings });
    return data;
  },

  // Quizzes
  getQuizzes: async (params: { page?: number; limit?: number; search?: string }) => {
    const { data } = await api.get('/quizzes/admin/all', { params });
    return data;
  },

  createQuiz: async (quizData: any) => {
    const { data } = await api.post('/quizzes/admin', quizData);
    return data;
  },

  updateQuiz: async (id: string, quizData: any) => {
    const { data } = await api.patch(`/quizzes/admin/${id}`, quizData);
    return data;
  },

  deleteQuiz: async (id: string) => {
    const { data } = await api.delete(`/quizzes/admin/${id}`);
    return data;
  },

  addQuizQuestion: async (quizId: string, questionData: any) => {
    const { data } = await api.post(`/quizzes/admin/${quizId}/questions`, questionData);
    return data;
  },

  updateQuizQuestion: async (questionId: string, questionData: any) => {
    const { data } = await api.patch(`/quizzes/admin/questions/${questionId}`, questionData);
    return data;
  },

  deleteQuizQuestion: async (questionId: string) => {
    const { data } = await api.delete(`/quizzes/admin/questions/${questionId}`);
    return data;
  },

  // Reviews
  getReviews: async (params: { page?: number; limit?: number; approved?: string }) => {
    const { data } = await api.get('/reviews/admin/all', { params });
    return data;
  },

  toggleReviewApproval: async (id: string) => {
    const { data } = await api.patch(`/reviews/admin/${id}/toggle`);
    return data;
  },

  deleteReview: async (id: string) => {
    const { data } = await api.delete(`/reviews/admin/${id}`);
    return data;
  },

  // Discount Codes
  getDiscountCodes: async (params: { page?: number; limit?: number }) => {
    const { data } = await api.get('/discount-codes/admin/all', { params });
    return data;
  },

  createDiscountCode: async (codeData: any) => {
    const { data } = await api.post('/discount-codes/admin', codeData);
    return data;
  },

  updateDiscountCode: async (id: string, codeData: any) => {
    const { data } = await api.patch(`/discount-codes/admin/${id}`, codeData);
    return data;
  },

  deleteDiscountCode: async (id: string) => {
    const { data } = await api.delete(`/discount-codes/admin/${id}`);
    return data;
  },

  // Certificates
  getCertificates: async (params: { page?: number; limit?: number }) => {
    const { data } = await api.get('/certificates/admin/all', { params });
    return data;
  },

  // Contact Messages
  getContactMessages: async (params: { page?: number; limit?: number }) => {
    const { data } = await api.get('/contact/admin/all', { params });
    return data;
  },

  markContactRead: async (id: string) => {
    const { data } = await api.patch(`/contact/admin/${id}/read`);
    return data;
  },

  deleteContactMessage: async (id: string) => {
    const { data } = await api.delete(`/contact/admin/${id}`);
    return data;
  },

  // Grant/Revoke course access
  grantCourseAccess: async (userId: string, courseId: string) => {
    const { data } = await api.post('/admin/grant-access', { userId, courseId });
    return data;
  },

  revokeCourseAccess: async (userId: string, courseId: string) => {
    const { data } = await api.delete(`/admin/revoke-access/${userId}/${courseId}`);
    return data;
  },
};
