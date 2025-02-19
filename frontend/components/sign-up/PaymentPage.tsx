'use client';

import { useEffect, useState } from 'react';
import { useSignUp } from '@/contexts/SignUpContext';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

interface PaymentPageProps {
  onBack: () => void;
  onComplete: () => void;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function PaymentPage({ onBack, onComplete }: PaymentPageProps) {
  const { accountType, plan, billingFrequency, currency, userCount, userId, companyId, email, price } = useSignUp();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();


  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await api.post('/stripe/create-checkout-session', {
        accountType,
        planId: plan,
        planName: `${plan} Plan (${billingFrequency})`,
        billingFrequency,
        currency,
        userCount,
        email,
        userId,
        companyId,
      });

      const { sessionId } = response.data;

      // Get Stripe.js instance
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong with the payment process. Please try again.',
        variant: 'destructive',
      });
    } finally {
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
          Total: ${price} / {billingFrequency === 'monthly' ? 'month' : 'year'}
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
            : `Pay $${price} ${billingFrequency === 'monthly' ? 'per month' : 'per year'}`}
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
