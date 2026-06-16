import api from '@/lib/api';

export interface InstallmentPreview {
  totalAmount: number;
  downPayment: number;
  monthlyAmount: number;
  numberOfInstallments: number;
  installments: {
    number: number;
    amount: number;
    dueDate: string;
  }[];
}

export interface InstallmentPlan {
  id: string;
  totalAmount: number;
  downPayment: number;
  monthlyAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  status: 'ACTIVE' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  order: {
    id: string;
    orderNumber: string;
    items: { course: { title: string; thumbnail?: string }; price: number }[];
  };
  installments: {
    id: string;
    installmentNumber: number;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
    paidAt?: string;
    refId?: string;
  }[];
  createdAt: string;
}

export const installmentsService = {
  // Calculate preview (no save)
  getPreview: async (
    totalAmount: number,
    numberOfInstallments: number,
  ): Promise<InstallmentPreview> => {
    const { data } = await api.post('/installments/preview', {
      totalAmount,
      numberOfInstallments,
    });
    return data;
  },

  // Create plan
  create: async (
    orderId: string,
    numberOfInstallments: number,
  ): Promise<InstallmentPlan> => {
    const { data } = await api.post('/installments', {
      orderId,
      numberOfInstallments,
    });
    return data;
  },

  // Get my plans
  getMyPlans: async (): Promise<InstallmentPlan[]> => {
    const { data } = await api.get('/installments/my');
    return data;
  },

  // Get single plan
  getPlan: async (id: string): Promise<InstallmentPlan> => {
    const { data } = await api.get(`/installments/${id}`);
    return data;
  },

  // Get next installment
  getNextInstallment: async (planId: string) => {
    const { data } = await api.get(`/installments/${planId}/next`);
    return data;
  },
};
