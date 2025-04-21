import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { setAuthToken, getCurrentUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If we can't fetch user data, we should log out
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');

    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    setAuthToken(newToken);
    localStorage.setItem('token', newToken);
    await fetchUser();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(''); // Clear the auth token from API client
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
