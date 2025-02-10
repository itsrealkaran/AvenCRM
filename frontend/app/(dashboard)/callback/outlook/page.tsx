'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/axios';
import { generateCodeVerifier } from '@/lib/pkce';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

function OutlookAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { user } = useAuth();
  const userRole = user?.role.toLowerCase();

  useEffect(() => {
    const connectAccount = async () => {
      try {
        // Log all search parameters to help debug
        console.log('Search params:', Array.from(searchParams.entries()));

        const code = searchParams.get('code');
        console.log('Authorization code:', code);

        if (!code) {
          console.error('URL:', window.location.href);
          throw new Error('Authorization code not found');
        }

        // Get the code verifier from local storage
        const codeVerifier = localStorage.getItem('pkce_code_verifier');
        if (!codeVerifier) {
          throw new Error('Code verifier not found. Please try connecting again.');
        }

        // Clear the code verifier from local storage
        localStorage.removeItem('pkce_code_verifier');

        const response = await api.post('/email/connect', {
          code,
          provider: 'OUTLOOK',
          code_verifier: codeVerifier,
        });

        if (!response.data) throw new Error('Failed to connect account');
        setStatus('success');
        toast({
          title: 'Success',
          description: 'Email account connected successfully',
        });

        // Redirect after a short delay to show success state
        setTimeout(() => {
          router.push(`/${userRole}/email`);
        }, 1500);
      } catch (error) {
        console.error('Error connecting account:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to connect email account');
        toast({
          title: 'Error',
          description: 'Failed to connect email account',
          variant: 'destructive',
        });
      }
    };

    connectAccount();
  }, [router, searchParams, toast, user]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Email Connection</CardTitle>
          <CardDescription>Connecting your Outlook account to AvenCRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-center space-y-6 py-6'>
            {status === 'loading' && (
              <>
                <div className='animate-pulse rounded-full bg-primary/10 p-6'>
                  <Loader2 className='h-12 w-12 animate-spin text-primary' />
                </div>
                <p className='text-center text-sm text-muted-foreground'>
                  Please wait while we connect your email account...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className='rounded-full bg-green-100 p-6'>
                  <Check className='h-12 w-12 text-green-600' />
                </div>
                <div className='space-y-2 text-center'>
                  <h3 className='text-lg font-medium'>Successfully Connected!</h3>
                  <p className='text-sm text-muted-foreground'>
                    Your Outlook account has been connected to AvenCRM
                  </p>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className='rounded-full bg-red-100 p-6'>
                  <XCircle className='h-12 w-12 text-red-600' />
                </div>
                <div className='space-y-2 text-center'>
                  <h3 className='text-lg font-medium'>Connection Failed</h3>
                  <p className='text-sm text-muted-foreground'>{errorMessage}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OutlookAuthCallback() {
  return (
    <Suspense>
      <OutlookAuthCallbackContent />
    </Suspense>
  );
}
