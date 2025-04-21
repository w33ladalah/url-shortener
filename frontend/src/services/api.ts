import axios from 'axios';
import { URL, LoginCredentials, LoginResponse, RegisterCredentials, User } from '../types';

interface UrlStats {
  visits: number;
  lastVisited?: string;
}

interface ShortenUrlRequest {
  original_url: string;
  custom_short_code?: string;
}

interface ShortenUrlResponse {
  id: string;
  original_url: string;
  short_code: string;
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await api.post('/api/auth/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const setAuthToken = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = (): void => {
  delete api.defaults.headers.common['Authorization'];
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<LoginResponse> => {
  const response = await api.post('/api/auth/register', credentials);
  return response.data;
};

export const claim = async (shortUrl: string): Promise<URL> => {
  const response = await api.post('/api/urls/claim', { shortUrl });
  return response.data;
};

export const getMyUrls = async (): Promise<URL[]> => {
  const response = await api.get('/api/urls/my');
  return response.data;
};

export const getUnclaimed = async (): Promise<URL[]> => {
  const response = await api.get('/api/urls/unclaimed');
  return response.data;
};

export const getStats = async (shortUrl: string): Promise<UrlStats> => {
  const response = await api.get(`/api/urls/${shortUrl}/stats`);
  return response.data;
};

export const shortenUrl = async (data: ShortenUrlRequest): Promise<ShortenUrlResponse> => {
  const response = await api.post('/api/urls/shorten', data);
  return response.data;
};
