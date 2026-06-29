import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<void>;
  register: (profile: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('dentalai_token');
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
        } catch (err) {
          console.error("Token validation failed, logging out:", err);
          localStorage.removeItem('dentalai_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: any) => {
    setLoading(true);
    try {
      const res = await api.login(credentials);
      localStorage.setItem('dentalai_token', res.access_token);
      
      const profile = await api.getMe();
      setUser(profile);
    } catch (err) {
      localStorage.removeItem('dentalai_token');
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (profile: any) => {
    setLoading(true);
    try {
      await api.register(profile);
      // Automatically login after successful registration
      await login({ email: profile.email, password: profile.password });
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('dentalai_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
