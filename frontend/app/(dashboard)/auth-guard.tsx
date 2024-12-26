'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';

interface JWTPayload {
  profileId: string;
  role: string;
  exp: number;
}

interface AuthGuardProps {
  children: React.ReactNode;
}

const protectedRoutes = {
  '/agent': ['AGENT'],
  '/company': ['ADMIN'],
  '/superadmin': ['SUPERADMIN'],
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  const refreshToken = useCallback(async () => {
    try {
      toast.loading('Authenticating...');
      const currentToken = localStorage.getItem('accessToken');
      if (!currentToken) throw new Error('No access token found');

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Token refresh failed');

      toast.dismiss();
      toast.success('Authentication successful');

      const { accessToken } = await response.json();
      localStorage.setItem('accessToken', accessToken);
      return accessToken;
    } catch (error) {
      toast.dismiss();
      toast.error('Authentication failed');
      throw error;
    }
  }, []);

  const validateAccess = useCallback(async () => {
    try {
      let token = localStorage.getItem('accessToken');
      if (!token) throw new Error('No access token found');

      // Decode token
      let decoded = jwtDecode<JWTPayload>(token);

      // Check if token is about to expire (less than 2 minutes remaining)
      if (decoded.exp * 1000 - Date.now() < 2 * 60 * 1000) {
        // Refresh token
        token = await refreshToken();
        decoded = jwtDecode<JWTPayload>(token as string);
      }

      // Get user role and current route
      const userRole = decoded.role;
      const currentRoute = Object.entries(protectedRoutes).find(([route]) =>
        pathname.startsWith(route)
      );

      // Check if current route requires authentication
      if (currentRoute && !currentRoute[1].includes(userRole)) {
        throw new Error('Insufficient permissions');
      }

      setIsAuthorized(true);
    } catch (error) {
      toast.error('Authentication failed');
      localStorage.removeItem('accessToken');
      setIsAuthorized(false);
      router.push('/sign-in');
    }
  }, [pathname, router, refreshToken]);

  useEffect(() => {
    validateAccess();

    // Set up token refresh interval (every 14 minutes)
    const refreshInterval = setInterval(refreshToken, 14 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [validateAccess, refreshToken]);

  // Show nothing while checking authentication
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
