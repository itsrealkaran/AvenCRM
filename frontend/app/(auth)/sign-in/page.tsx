'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  email: z.string({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(4, {
    message: 'Password must be at least 4 characters long.',
  }),
  role: z.enum(['SUPERADMIN', 'ADMIN', 'AGENT'], {
    required_error: 'Please select a user type.',
  }),
});

export default function SignIn() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'AGENT',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    toast.loading('Signing in...');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sign-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          role: values.role,
        }),
      });

      if (!response.ok) {
        toast.error('Sign-in failed. Please try again.');
        throw new Error('Sign-in failed');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        toast.success('Sign-in successful!');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const redirectPath = values.role === 'ADMIN' ? '/company' : `/${values.role.toLowerCase()}`;
        router.push(redirectPath);
      } else {
        toast.error('Sign-in failed. No access token received.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  }

  return (
    <div className='space-y-6'>
      <div className='space-y-2 text-center'>
        <h1 className='text-3xl font-bold'>Sign In</h1>
        <p className='text-gray-500 dark:text-gray-400'>
          Enter your credentials to access your account
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select user type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='SUPERADMIN'>Super Admin</SelectItem>
                    <SelectItem value='ADMIN'>Admin</SelectItem>
                    <SelectItem value='AGENT'>Agent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Enter your email' {...field} />
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
                  <Input type='password' placeholder='Enter your password' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type='submit'
            className='w-full bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded'
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <div className='text-center'>
        <p className='text-sm text-gray-500 dark:text-gray-400'>
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' className='text-primary hover:underline'>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
