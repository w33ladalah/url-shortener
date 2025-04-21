import axios from 'axios';
import { URL, LoginCredentials, LoginResponse, RegisterCredentials } from '../types';

interface UrlStats {
  visits: number;
  lastVisited?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const setAuthToken = (token: string): void => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = (): void => {
  delete api.defaults.headers.common['Authorization'];
};

export const register = async (credentials: RegisterCredentials): Promise<LoginResponse> => {
  const response = await api.post('/auth/register', credentials);
  return response.data;
};

export const claim = async (shortUrl: string): Promise<URL> => {
  const response = await api.post('/urls/claim', { shortUrl });
  return response.data;
};

export const getMyUrls = async (): Promise<URL[]> => {
  const response = await api.get('/urls/my');
  return response.data;
};

export const getUnclaimed = async (): Promise<URL[]> => {
  const response = await api.get('/urls/unclaimed');
  return response.data;
};

export const getStats = async (shortUrl: string): Promise<UrlStats> => {
  const response = await api.get(`/urls/${shortUrl}/stats`);
  return response.data;
};
