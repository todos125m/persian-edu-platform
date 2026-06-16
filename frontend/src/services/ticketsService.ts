import api, { PaginatedResponse } from '@/lib/api';

export interface Ticket {
  id: string;
  subject: string;
  status: 'OPEN' | 'ANSWERED' | 'WAITING' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  department: string;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    avatar?: string;
  };
  _count?: { messages: number };
  messages?: TicketMessage[];
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  body: string;
  isAdmin: boolean;
  ticketId: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role?: { name: string };
  };
  createdAt: string;
}

export const ticketsService = {
  // User: Create ticket
  create: async (data: {
    subject: string;
    body: string;
    priority?: string;
    department?: string;
  }): Promise<Ticket> => {
    const res = await api.post('/tickets', data);
    return res.data;
  },

  // User: Get my tickets
  getMyTickets: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Ticket>> => {
    const { data } = await api.get('/tickets/my', { params });
    return data;
  },

  // User: Get single ticket
  getTicket: async (id: string): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  // User: Reply
  reply: async (id: string, body: string): Promise<TicketMessage> => {
    const { data } = await api.post(`/tickets/${id}/reply`, { body });
    return data;
  },

  // User: Close
  close: async (id: string): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/${id}/close`);
    return data;
  },

  // ============ Admin ============

  // Admin: Get all tickets
  getAllTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    const { data } = await api.get('/tickets/admin/all', { params });
    return data;
  },

  // Admin: Get single ticket
  getTicketAdmin: async (id: string): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/admin/${id}`);
    return data;
  },

  // Admin: Reply
  adminReply: async (id: string, body: string): Promise<TicketMessage> => {
    const { data } = await api.post(`/tickets/admin/${id}/reply`, { body });
    return data;
  },

  // Admin: Close
  adminClose: async (id: string): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/admin/${id}/close`);
    return data;
  },

  // Admin: Change status
  changeStatus: async (id: string, status: string): Promise<Ticket> => {
    const { data } = await api.patch(`/tickets/admin/${id}/status`, { status });
    return data;
  },
};
