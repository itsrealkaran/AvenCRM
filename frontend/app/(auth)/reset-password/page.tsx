'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@mui/material';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(50, 'Password is too long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters' },
  { id: 'uppercase', text: 'At least one uppercase letter' },
  { id: 'lowercase', text: 'At least one lowercase letter' },
  { id: 'number', text: 'At least one number' },
  { id: 'special', text: 'At least one special character' },
];

function ResetPasswordContent() {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [requirements, setRequirements] = useState<{ [key: string]: boolean }>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const checkPasswordStrength = (pwd: string) => {
    const newRequirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
    };
    setRequirements(newRequirements);
    return Object.values(newRequirements).filter(Boolean).length;
  };

  useEffect(() => {
    const pwd = form.watch('password');
    const confirmPwd = form.watch('confirmPassword');
    setPasswordStrength(checkPasswordStrength(pwd));
    setPasswordMatch(pwd === confirmPwd);
  }, [form.watch('password'), form.watch('confirmPassword')]);

  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: email,
        otp: otp,
        password: values.password,
      });
      toast.success('Password reset successfully');
      router.push('/sign-in');
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='w-full max-w-md'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className='bg-white px-8 py-10 shadow-lg rounded-2xl'
        >
          <div className='space-y-2 mb-8'>
            <h2 className='text-2xl font-semibold'>Reset Password</h2>
            <p className='text-sm text-gray-500'>Create a new strong password for your account.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel className='mr-2'>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Enter new password'
                        className='h-12'
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <FormLabel className='mr-2'>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='Confirm new password'
                        className='h-12'
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!passwordMatch && form.watch('confirmPassword').length > 0 && (
                <p className='text-sm text-destructive flex items-center'>
                  <AlertCircle className='w-4 h-4 mr-1' />
                  Passwords do not match
                </p>
              )}

              <div className='space-y-2'>
                <Label>Password Requirements</Label>
                <ul className='space-y-1'>
                  {passwordRequirements.map((req) => (
                    <li key={req.id} className='flex items-center text-sm'>
                      {requirements[req.id] ? (
                        <Check className='w-4 h-4 mr-2 text-green-500' />
                      ) : (
                        <X className='w-4 h-4 mr-2 text-red-500' />
                      )}
                      {req.text}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type='submit'
                className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isLoading || !passwordMatch || passwordStrength < 3}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <p className='text-center text-sm text-gray-600'>
                Remember your password?{' '}
                <Link href='/login' className='font-medium text-[#5932EA] hover:text-[#4A2BC2]'>
                  Back to login
                </Link>
              </p>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='w-full max-w-md p-8 bg-white rounded-2xl shadow-lg'>
            <div className='flex items-center justify-center'>
              <Loader2 className='h-8 w-8 animate-spin text-[#5932EA]' />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
