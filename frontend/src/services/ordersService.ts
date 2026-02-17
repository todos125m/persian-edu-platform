import { api, PaginatedResponse } from '@/lib/api';

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  items: OrderItem[];
  payment?: {
    status: string;
    paidAt?: string;
  };
  createdAt: string;
}

export interface OrderItem {
  id: string;
  price: number;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail?: string;
  };
}

export const ordersService = {
  // Create order
  create: async (courseIds: string[], couponCode?: string): Promise<Order> => {
    const response = await api.post('/orders', { courseIds, couponCode });
    return response.data;
  },

  // Validate coupon
  validateCoupon: async (code: string, totalAmount: number) => {
    const response = await api.post('/discount-codes/validate', { code, totalAmount });
    return response.data;
  },

  // Get my orders
  getMyOrders: async (page = 1, limit = 10): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders/me', { params: { page, limit } });
    return response.data;
  },

  // Get single order
  getOrder: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Initiate payment for an order
  initiatePayment: async (orderId: string, gateway: 'ZARINPAL' | 'IDPAY' = 'ZARINPAL') => {
    const response = await api.post('/payments/initiate', { orderId, gateway });
    return response.data as { paymentUrl: string };
  },
};

export const paymentsService = {
  // Initiate payment
  initiate: async (orderId: string, gateway: 'ZARINPAL' | 'IDPAY' = 'ZARINPAL') => {
    const response = await api.post('/payments/initiate', { orderId, gateway });
    return response.data as { paymentUrl: string };
  },

  // Verify payment (called after redirect back)
  verify: async (authority: string, status: string) => {
    const response = await api.get('/payments/verify', {
      params: { Authority: authority, Status: status },
    });
    return response.data;
  },
};
