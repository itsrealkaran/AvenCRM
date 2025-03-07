'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/api';
import { toast } from 'sonner';

interface AuthGuardProps {
  children: React.ReactNode;
}

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
          router.push('/');
        }
      } catch (error) {
        toast.error('Authentication failed');
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        router.push('/');
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
