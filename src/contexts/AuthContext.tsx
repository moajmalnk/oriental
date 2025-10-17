import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Admin } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: Admin | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Mock admin user for local development
const MOCK_ADMIN: Admin = {
  id: 1,
  username: 'info@kugoriental.com',
  email: 'info@kugoriental.com',
  full_name: 'KUGOriental',
  role: 'super_admin',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('oriental_auth_token');
      if (token) {
        setUser(MOCK_ADMIN);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simple mock authentication - accept any username/password
      if (username && password) {
        localStorage.setItem('oriental_auth_token', 'mock_token');
        setUser(MOCK_ADMIN);
        setIsAuthenticated(true);
        return true;
      } else {
        setError('Username and password are required');
        return false;
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('oriental_auth_token');
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
