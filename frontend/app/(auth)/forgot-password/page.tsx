'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

const sendOtp = async (email: string) => {
  const response = await api.post('/auth/forgot-password', {
    email,
  });
  return response.data;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      setTimer(30);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerActive, timer]);

  const handleSendOtp = async () => {
    setIsLoading(true);
    try {
      await sendOtp(email);
      setIsOtpSent(true);
      setIsTimerActive(true);
      toast.success('OTP sent to your email');
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otp,
      });
      if (response.status === 200) {
        router.push(`/reset-password?email=${email}&otp=${otp}`);
      } else {
        toast.error('Failed to verify OTP');
      }
    } catch (error) {
      toast.error('Failed to verify OTP');
    }
  };

  const handleResendOtp = () => {
    setOtp('');
    handleSendOtp();
  };

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
                <h1>AvenCRM </h1>
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
              <h1 className='text-3xl font-bold tracking-tight text-gray-900'>Forgot Password</h1>
              <p className='text-gray-500'>
                Enter your email address and we&apos;ll send you temporary password.
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <Input
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='h-12'
                  disabled={isOtpSent || isLoading}
                />
              </div>

              {isOtpSent && (
                <div>
                  <Input
                    type='text'
                    placeholder='Enter OTP'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className='h-12'
                    disabled={isLoading}
                  />
                </div>
              )}

              <Button
                className='w-full h-12 text-base bg-[#5932EA] hover:bg-[#4A2BC2] text-white'
                onClick={isOtpSent ? handleVerifyOtp : handleSendOtp}
                disabled={isLoading || (!isOtpSent && !email) || (isOtpSent && !otp)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    {isOtpSent ? 'Verifying...' : 'Sending...'}
                  </>
                ) : isOtpSent ? (
                  'Verify OTP'
                ) : (
                  'Send OTP'
                )}
              </Button>

              {isOtpSent && (
                <Button
                  variant='link'
                  className='w-full text-sm text-muted-foreground'
                  onClick={handleResendOtp}
                  disabled={isLoading || isTimerActive}
                >
                  {isTimerActive ? `Resend OTP in ${timer}s` : "Didn't receive OTP? Send again"}
                </Button>
              )}
            </div>

            <div className='text-center text-sm'>
              Remember your password?{' '}
              <Link href='/sign-in' className='text-[#5932EA] hover:underline font-medium'>
                Sign in
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
                src='/sign-in.svg'
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
