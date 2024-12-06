'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background'>
      <div className='container flex max-w-[64rem] flex-col items-center gap-4 text-center'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className='relative'
        >
          <div className='absolute -left-8 -top-8 h-64 w-64 animate-pulse rounded-full bg-primary/20 blur-3xl' />
          <div className='absolute -right-8 -top-8 h-64 w-64 animate-pulse rounded-full bg-secondary/20 blur-3xl' />
          <span className='relative block font-mono text-[8rem] font-bold leading-none text-foreground/80'>
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className='text-4xl font-bold'>Oops! Page Not Found</h1>
          <p className='mt-4 text-lg text-muted-foreground'>
            Looks like you&apos;ve ventured into uncharted territory. The page looking for seems to
            have taken a vacation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className='flex flex-col gap-2 min-[400px]:flex-row'
        >
          <Button asChild variant='default' size='lg'>
            <Link href='/'>
              <Home className='mr-2 h-4 w-4' />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='javascript:history.back()'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Go Back
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className='mt-8'
        >
          <p className='text-sm text-muted-foreground'>
            If you believe this is a mistake, please{' '}
            <Link href='/contact' className='underline underline-offset-4 hover:text-primary'>
              contact support
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
