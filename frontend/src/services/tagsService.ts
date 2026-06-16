import api from '@/lib/api';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { courses: number };
}

export const tagsService = {
  getAll: async (): Promise<Tag[]> => {
    const { data } = await api.get('/tags');
    return data;
  },

  getPopular: async (): Promise<Tag[]> => {
    const { data } = await api.get('/tags/popular');
    return data;
  },

  // Admin
  create: async (name: string): Promise<Tag> => {
    const { data } = await api.post('/tags/admin', { name });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tags/admin/${id}`);
  },

  assignToCourse: async (courseId: string, tagIds: string[]): Promise<void> => {
    await api.post(`/tags/admin/course/${courseId}`, { tagIds });
  },
};
