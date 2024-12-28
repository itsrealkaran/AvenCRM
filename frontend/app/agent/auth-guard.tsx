'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/services/api';
import { User } from '@/types/user';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
}

const protectedRoutes = {
  '/dashboard': ['USER'], // Add dashboard route protection
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: user } = await authApi.me();
        if (user) {
          setIsAuthenticated(true);
        } else {
          router.push('/sign-in');
        }
      } catch (error) {
        toast.error('Authentication failed');
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        router.push('/sign-in');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className='flex h-screen w-full items-center justify-center'>
        <div className='h-32 w-32 animate-spin rounded-full border-b-2 border-t-2 border-primary'></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
