'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isResetting, setIsResetting] = React.useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await reset();
    } catch (err) {
      console.error('Failed to reset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='container max-w-[64rem]'
      >
        <Card className='border-destructive/50 shadow-lg'>
          <CardHeader className='space-y-1 text-destructive'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-6 w-6' />
              <CardTitle className='text-2xl'>Something went wrong!</CardTitle>
            </div>
            <CardDescription className='text-destructive/90'>
              An error occurred while processing your request.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='rounded-lg bg-muted p-4'>
              <p className='font-mono text-sm text-muted-foreground'>{error.message}</p>
              {error.digest && (
                <p className='mt-2 font-mono text-xs text-muted-foreground'>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>Here are a few things you can try:</p>
              <ul className='list-inside list-disc space-y-1'>
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Try again later</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col gap-2 sm:flex-row'>
            <Button
              variant='default'
              onClick={handleReset}
              disabled={isResetting}
              className='w-full sm:w-auto'
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Retrying...' : 'Try Again'}
            </Button>
            <Button asChild variant='outline' className='w-full sm:w-auto'>
              <Link href='/'>
                <Home className='mr-2 h-4 w-4' />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant='ghost' className='w-full sm:w-auto'>
              <Link href='javascript:history.back()'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Go Back
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className='mt-8 text-center'
        >
          <p className='text-sm text-muted-foreground'>
            If this problem persists, please{' '}
            <Link href='/contact' className='underline underline-offset-4 hover:text-primary'>
              contact our support team
            </Link>{' '}
            with the Error ID above.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
