import api from '@/lib/api';

export interface WishlistItem {
  id: string;
  courseId: string;
  createdAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
    price: number;
    discountPrice?: number;
    duration: number;
    lessonsCount: number;
    studentsCount: number;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  };
}

export const wishlistsService = {
  getAll: async (): Promise<WishlistItem[]> => {
    const { data } = await api.get('/wishlists');
    return data;
  },

  toggle: async (courseId: string): Promise<{ wishlisted: boolean }> => {
    const { data } = await api.post(`/wishlists/${courseId}`);
    return data;
  },
};
