import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const email = localStorage.getItem('userEmail');
      
      if (authStatus === 'true' && email) {
        setIsAuthenticated(true);
        setUserEmail(email);
      }
      
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (email === 'info@kugoriental.com' && password === 'KUGOriental@0066') {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      setIsAuthenticated(true);
      setUserEmail(email);
      return true;
    }
    
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    userEmail,
    login,
    logout,
    isLoading,
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
