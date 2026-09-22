import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  isCheckingAuth: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      const token = localStorage.getItem('cutm_admin_token');
      const savedUser = localStorage.getItem('cutm_admin_user');

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        if (savedUser) {
          setAdminUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        }
        // Verify with backend
        const res = await authApi.verify();
        if (res.success && res.user) {
          setAdminUser(res.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.warn('[Auth] Session invalid or expired.');
        localStorage.removeItem('cutm_admin_token');
        localStorage.removeItem('cutm_admin_user');
        setIsAuthenticated(false);
        setAdminUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkExistingSession();

    const handleExpired = () => {
      setIsAuthenticated(false);
      setAdminUser(null);
    };

    window.addEventListener('auth-session-expired', handleExpired);
    return () => {
      window.removeEventListener('auth-session-expired', handleExpired);
    };
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await authApi.login({ username, password });
      if (res.success && res.token) {
        localStorage.setItem('cutm_admin_token', res.token);
        localStorage.setItem('cutm_admin_user', JSON.stringify(res.user));
        setAdminUser(res.user);
        setIsAuthenticated(true);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err: any) {
      const message = err.response?.data?.message || 'Invalid username or password.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('cutm_admin_token');
    localStorage.removeItem('cutm_admin_user');
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, adminUser, isCheckingAuth, login, logout }}>
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
