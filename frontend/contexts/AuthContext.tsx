'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/api/auth.service';
import { LoginCredentials, RegisterCredentials, User } from '@/types/user';
import { toast } from 'sonner';

interface Company {
  userCount: number;
  planName: string;
  planType: string;
  billingFrequency: string;
  planEnd: string;
}

interface AuthContextType {
  user: User | null;
  company: Company | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      const companyData = await authService.getCompany();
      setCompany(companyData);
    } catch (error) {
      console.error('Failed to load user:', error);
      toast.error('Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const { user } = await authService.login(credentials);
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to login');
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      const { user } = await authService.register(credentials);
      setUser(user);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to register');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
