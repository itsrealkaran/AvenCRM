'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

import { useToast } from '@/hooks/use-toast';

interface JWTPayload {
  profileId: string;
  role: string;
  exp: number;
}

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRoles = [] }) => {
  debugger;

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAuth = () => {
      debugger;

      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          throw new Error('No access token found');
        }

        // Decode and validate token
        const decoded = jwtDecode<JWTPayload>(token);

        // Check token expiration
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('accessToken');
          throw new Error('Token expired');
        }

        // Get user role from token
        const userRole = decoded.role?.toLowerCase();

        // Validate role-based access
        const currentPath = pathname.split('/')[1]?.toLowerCase();
        if (!userRole || (currentPath && currentPath !== userRole)) {
          throw new Error('Unauthorized role');
        }

        // Additional role validation if specific roles are required
        if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
          throw new Error('Insufficient permissions');
        }

        // Validate token with backend
        validateTokenWithBackend(token);

        setIsAuthorized(true);
      } catch (error: any) {
        console.error('Auth Error:', error);
        setIsAuthorized(false);
        localStorage.removeItem('accessToken');

        toast({
          title: 'Authentication Error',
          description: error.message || 'Please sign in to continue',
          variant: 'destructive',
        });

        router.push('/sign-in');
      }
    };

    validateAuth();

    // Set up token refresh interval
    const refreshInterval = setInterval(
      () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          refreshToken(token);
        }
      },
      14 * 60 * 1000
    ); // Refresh token every 14 minutes

    return () => clearInterval(refreshInterval);
  }, [pathname, router, toast, requiredRoles]);

  const validateTokenWithBackend = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/auth/validate-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      throw new Error('Token validation failed');
    }
  };

  const refreshToken = async (currentToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/auth/refresh-token', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { accessToken } = await response.json();
        localStorage.setItem('accessToken', accessToken);
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      setIsAuthorized(false);
      router.push('/sign-in');
    }
  };

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
