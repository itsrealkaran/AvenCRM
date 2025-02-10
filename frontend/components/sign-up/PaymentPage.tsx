'use client';

import { useState } from 'react';
import { useSignUp } from '@/contexts/SignUpContext';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface PaymentPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function PaymentPage({ onBack, onComplete }: PaymentPageProps) {
  const { plan, billingFrequency, userCount } = useSignUp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);

    let price;
    if (billingFrequency === 'monthly') {
      price = 99 * userCount;
    } else if (billingFrequency === 'yearly') {
      price = 500 * userCount;
    }
    setTotalAmount(price || 0);

    try {
      const response = await api.post('/stripe/create-checkout-session', {
        planId: plan,
        planName: `${plan} Plan (${billingFrequency})`,
        price: price,
      });
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold'>Complete Your Payment</h2>
        <p className='text-sm text-gray-500'>
          Please review your plan details and proceed to payment.
        </p>
      </div>

      <div className='bg-gray-50 p-4 rounded-lg'>
        <h3 className='font-semibold mb-2'>Order Summary</h3>
        <p>Plan: {plan}</p>
        <p>Billing: {billingFrequency}</p>
        <p>Users: {userCount}</p>
        <p className='font-semibold mt-2'>
          Total: ${totalAmount} / {billingFrequency === 'monthly' ? 'month' : 'year'}
        </p>
      </div>

      <div className='space-y-4'>
        <p className='text-sm text-gray-500'>
          Click the button below to be redirected to our secure payment gateway.
        </p>
        <Button
          onClick={handlePayment}
          className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={isProcessing}
        >
          {isProcessing
            ? 'Processing...'
            : `Pay $${totalAmount} ${billingFrequency === 'monthly' ? 'per month' : 'per year'}`}
        </Button>
        <Button
          variant='outline'
          onClick={onBack}
          className='w-full border-2 border-[#5932EA] text-[#5932EA] font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#5932EA] hover:text-white'
        >
          Back
        </Button>
      </div>
    </motion.div>
  );
}
