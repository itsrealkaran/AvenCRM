'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

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
  // const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const refreshToken = useCallback(
    async (currentToken: string) => {
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
    },
    [router]
  );

  const validateTokenWithBackend = useCallback(
    async (token: string) => {
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
        // toast({
        //   title: 'Token validation failed',
        //   description: (error as unknown as string) || 'Please sign in to continue',
        //   variant: 'destructive',
        // });
        localStorage.removeItem('accessToken');
        setIsAuthorized(false);
        router.push('/sign-in');
      }
    },
    [router]
  );

  useEffect(() => {
    const validateAuth = () => {
      debugger;

      try {
        const token = localStorage.getItem('accessToken');

        if (!token) {
          // toast({
          //   title: 'Authentication Error',
          //   description: 'Please sign in to continue',
          //   variant: 'destructive',
          // });
          localStorage.removeItem('accessToken');
          setIsAuthorized(false);
          router.push('/sign-in');
          return;
        }

        // Decode and validate token
        const decoded = jwtDecode<JWTPayload>(token);

        // Check token expiration
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('accessToken');
          // toast({
          //   title: 'Token Expired',
          //   description: 'Please sign in to continue',
          //   variant: 'destructive',
          // });
          router.push('/sign-in');
          return;
        }

        // Get user role from token
        const userRole = decoded.role?.toLowerCase();

        // Validate role-based access
        const currentPath = pathname.split('/')[1]?.toLowerCase();
        if (!userRole || (currentPath && currentPath !== userRole)) {
          // toast({
          //   title: 'Insufficient permissions',
          //   description: 'You do not have access to this page',
          //   variant: 'destructive',
          // });
          localStorage.removeItem('accessToken');
          setIsAuthorized(false);
          router.push('/');
          return;
        }

        // Additional role validation if specific roles are required
        if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
          // toast({
          //   title: 'Insufficient permissions',
          //   description: 'You do not have access to this page',
          //   variant: 'destructive',
          // });
          localStorage.removeItem('accessToken');
          setIsAuthorized(false);
          router.push('/');
          return;
        }

        // Validate token with backend
        validateTokenWithBackend(token);

        setIsAuthorized(true);
      } catch (error: any) {
        console.error('Auth Error:', error);
        setIsAuthorized(false);
        localStorage.removeItem('accessToken');

        // toast({
        //   title: 'Authentication Error',
        //   description: error.message || 'Please sign in to continue',
        //   variant: 'destructive',
        // });

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
  }, [pathname, router, requiredRoles, refreshToken, validateTokenWithBackend]);

  if (!isAuthorized) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
};

export default AuthGuard;
