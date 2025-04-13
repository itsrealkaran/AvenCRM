'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

interface VerifyNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  accessToken: string;
  phoneNumberId: string;
  onRequestOTP: () => void;
}

export function VerifyNumberModal({
  isOpen,
  onClose,
  phoneNumber,
  accessToken,
  phoneNumberId,
  onRequestOTP,
}: VerifyNumberModalProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setCountdown(60);
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }

    setOtp(newOtp);
    inputRefs.current[pastedData.length - 1]?.focus();
  };

  const handleSubmit = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      try {
        // @ts-ignore
        FB.api(
          `/${phoneNumberId}/verify_code?access_token=${accessToken}`,
          'POST',
          {
            code: otpString,
          },
          (response: any) => {
            if (response.error) {
              console.error('Error verifying account:', response.error);
              toast.error(response.error.error_user_msg);
            } else {
              api
                .post(`/whatsapp/accounts/${phoneNumberId}/verify`)
                .then(() => {
                  toast.success('Account verified successfully');
                  queryClient.invalidateQueries({ queryKey: ['whatsapp-account'] });
                  onClose();
                })
                .catch((error) => {
                  console.error('Error verifying account:', error);
                  toast.error('Failed to verify account');
                });
            }
          }
        );
      } catch (error) {
        console.error('Error verifying account:', error);
        toast.error('Failed to verify account');
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Verify Phone Number</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <p className='text-sm text-muted-foreground'>
            Please enter the 6-digit verification code sent to {phoneNumber}
          </p>
          <div className='flex justify-center space-x-2'>
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className='w-12 h-12 text-center text-xl'
                disabled={isLoading}
              />
            ))}
          </div>
          <p className='text-sm text-muted-foreground'>
            Didn&apos;t receive the code?{' '}
            <Button
              variant='link'
              size='sm'
              onClick={() => {
                if (countdown > 0) {
                  return;
                }
                onRequestOTP();
                setCountdown(60);
              }}
              disabled={countdown > 0}
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Button>
          </p>
          <Button
            className='w-full'
            onClick={handleSubmit}
            disabled={isLoading || otp.some((digit) => !digit)}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
