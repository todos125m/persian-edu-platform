import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  totalPrice: () => number;
  totalDiscount: () => number;
  finalPrice: () => number;
  itemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.find((i) => i.id === item.id)) {
            return state; // Already in cart
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      isInCart: (id) => get().items.some((item) => item.id === id),

      totalPrice: () =>
        get().items.reduce((total, item) => total + item.price, 0),

      totalDiscount: () =>
        get().items.reduce((total, item) => {
          if (item.discountPrice) {
            return total + (item.price - item.discountPrice);
          }
          return total;
        }, 0),

      finalPrice: () =>
        get().items.reduce((total, item) => {
          return total + (item.discountPrice || item.price);
        }, 0),

      itemsCount: () => get().items.length,
    }),
    {
      name: 'cart-storage',
    }
  )
);
