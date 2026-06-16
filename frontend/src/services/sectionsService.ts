import api from '@/lib/api';

export interface Section {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  courseId: string;
  lessons: {
    id: string;
    title: string;
    sortOrder: number;
    isFree: boolean;
    video?: { duration: number };
  }[];
}

export const sectionsService = {
  getByCourse: async (courseId: string): Promise<Section[]> => {
    const { data } = await api.get(`/sections/course/${courseId}`);
    return data;
  },

  create: async (sectionData: { title: string; description?: string; courseId: string }): Promise<Section> => {
    const { data } = await api.post('/sections', sectionData);
    return data;
  },

  update: async (id: string, sectionData: { title?: string; description?: string }): Promise<Section> => {
    const { data } = await api.patch(`/sections/${id}`, sectionData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/sections/${id}`);
  },

  reorder: async (courseId: string, sectionIds: string[]): Promise<void> => {
    await api.post(`/sections/course/${courseId}/reorder`, { sectionIds });
  },
};
