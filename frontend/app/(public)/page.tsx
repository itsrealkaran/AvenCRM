'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/api';
import { UserRole } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(4, {
    message: 'Password must be at least 4 characters long.',
  }),
});

function SignInContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    toast.loading('Signing in...');

    try {
      const { data } = await authApi.login(values);

      console.log('data', data);

      if (data.access_token) {
        toast.success('Sign-in successful!');

        // Redirect to the callback URL or default dashboard
        let role = data.user.role as UserRole;
        const callbackUrl = role === UserRole.TEAM_LEADER ? '/agent' : `/${role.toLowerCase()}`;
        console.log('callbackUrl', callbackUrl);
        router.push(callbackUrl);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Sign-in failed. Please check your credentials and try again.');
    } finally {
      toast.dismiss();
      setIsLoading(false);
    }
  }

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 rounded-3xl'>
      <div className='w-full max-w-md p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg'>
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-800 dark:text-white'>Welcome Back</h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>Sign in to continue</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='you@example.com'
                      type='email'
                      {...field}
                      className='rounded-lg border-gray-300 focus:ring-primary focus:border-primary'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Enter your password'
                      {...field}
                      className='rounded-lg border-gray-300 focus:ring-primary focus:border-primary'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              className='w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg focus:ring-4 focus:ring-primary-light'
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Form>
        <div className='text-center mt-4'>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Don&apos;t have an account?{' '}
            <Link href='/sign-up' className='text-primary font-semibold hover:underline'>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
