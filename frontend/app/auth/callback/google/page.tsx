'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Loader2, Mail, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const connectAccount = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          throw new Error('Authorization code not found');
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('Access token not found');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/accounts/connect`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code, provider: 'GMAIL' }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to connect account');
        }

        setStatus('success');
        toast({
          title: 'Success',
          description: 'Email account connected successfully',
        });

        // Redirect after a short delay to show success state
        setTimeout(() => {
          router.push('/agent/email');
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
  }, [router, searchParams, toast]);

  return (
    <div className='flex min-h-screen items-center justify-center bg-background p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-bold'>Email Connection</CardTitle>
          <CardDescription>Connecting your Gmail account to AvenCRM</CardDescription>
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
                    Your Gmail account has been connected to AvenCRM
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
                  <Button
                    onClick={() => router.push('/agent/email')}
                    className='mt-4'
                    variant='default'
                  >
                    <Mail className='mr-2 h-4 w-4' />
                    Try Again
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GoogleAuthCallback;