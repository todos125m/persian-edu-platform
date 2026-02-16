import { api } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  nameFA: string;
  slug: string;
  description?: string;
  icon?: string;
  sortOrder: number;
  children?: Category[];
  _count?: {
    courses: number;
  };
}

export const categoriesService = {
  // Get all categories (public)
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Get category by slug
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },
};
