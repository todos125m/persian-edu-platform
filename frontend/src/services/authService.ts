import { api } from '@/lib/api';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  grade?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    grade?: string;
    role: {
      name: string;
      nameFA: string;
    };
  };
  token: string;
  refreshToken: string;
  message: string;
}

export const authService = {
  login: async (data: LoginDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterDto): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  logout: async () => {
    return Promise.resolve();
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  forgotPasswordByPhone: async (phone: string) => {
    const response = await api.post('/auth/forgot-password/phone', { phone });
    return response.data;
  },

  verifyOtp: async (phone: string, code: string, type: string = 'FORGOT_PASSWORD') => {
    const response = await api.post('/auth/verify-otp', { phone, code, type });
    return response.data;
  },

  resetPasswordByPhone: async (phone: string, code: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password/phone', { phone, code, newPassword });
    return response.data;
  },
};
