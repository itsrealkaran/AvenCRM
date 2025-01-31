'use client';

import { Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/api/api';
import { UserRole } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import Logo from '@/components/logo';
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
        const role = data.user.role as UserRole;
        const callbackUrl = role === UserRole.TEAM_LEADER ? '/teamleader' : `/${role.toLowerCase()}`;
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
    <div className='min-h-screen w-full flex bg-gradient-to-br from-[#9BF3F0] via-[#DAFFED] to-[#FFC2B4]'>
      {/* Left Side - Form */}
      <div className='w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center bg-white'>
        <div className='max-w-md mx-auto w-full'>
          <div className='mb-8'>
            <Link href='/' className='inline-flex items-center'>
              <div className='text-[1.6rem] md:text-[2rem]'>
                <Logo />
              </div>
              <div className='text-[#5932ea] text-[1rem] md:text-[1.3rem] flex gap-[2px] items-end font-bold'>
                <h1>AvenCRM</h1>
              </div>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='space-y-6'
          >
            <div className='space-y-2'>
              <h1 className='text-3xl font-bold tracking-tight text-gray-900'>Welcome back</h1>
              <p className='text-gray-500'>Sign in to your account to continue.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='Enter your email'
                          {...field}
                          className='h-12'
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
                          className='h-12'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='flex justify-between items-center'>
                  <Link href='/forgot-password' className='text-sm text-[#5932EA] hover:underline'>
                    Forgot password?
                  </Link>
                </div>
                <Button
                  type='submit'
                  className='w-full h-12 text-base bg-[#5932EA] hover:bg-[#4A2BC2] text-white'
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className='text-center text-sm text-gray-500'>
              By proceeding, you agree to our{' '}
              <Link href='/terms' className='text-[#5932EA] hover:underline'>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href='/privacy' className='text-[#5932EA] hover:underline'>
                Privacy Policy
              </Link>
            </div>

            <div className='text-center text-sm'>
              Don&apos;t have an account?{' '}
              <Link href='/sign-up' className='text-[#5932EA] hover:underline font-medium'>
                Sign up
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className='hidden lg:block lg:w-1/2 relative overflow-hidden'>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='absolute inset-0 flex items-center justify-center p-12'
        >
          <div className='relative w-full max-w-lg'>
            <div className='absolute top-0 -left-4 w-72 h-72 bg-[#5932EA] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
            <div className='absolute top-0 -right-4 w-72 h-72 bg-[#9BF3F0] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
            <div className='absolute -bottom-8 left-20 w-72 h-72 bg-[#FFC2B4] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>
            <div className='relative'>
              <Image
                src='https://www.pngarts.com/files/4/House-PNG-Image.png'
                alt='CRM Dashboard Preview'
                width={800}
                height={600}
              />
            </div>
          </div>
        </motion.div>
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
