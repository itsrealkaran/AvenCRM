'use client';

import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  price: {
    monthly: {
      USD: number;
      CAD: number;
      AED: number;
    };
    annually: {
      USD: number;
      CAD: number;
      AED: number;
    };
  };
}

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export function StripeModal({ isOpen, onClose, planId, planName, price }: StripeModalProps) {
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const { toast } = useToast();

  const { currency, formatPrice } = useCurrency();

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Call our backend API to create a checkout session
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/stripe/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important for sending cookies
          body: JSON.stringify({
            planId,
            planName,
            accountType: 'company',
            billingFrequency: billingPeriod,
            currency: currency.code,
            userCount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();

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
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Subscribe to {planName}</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='space-y-4'>
            <h3 className='font-medium'>Plan Details</h3>
            <div className='space-y-3'>
              <div>
                <label htmlFor='userCount' className='block text-sm font-medium text-gray-700'>
                  Number of Users
                </label>
                <input
                  type='number'
                  id='userCount'
                  min='1'
                  value={userCount}
                  onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Billing Period
                </label>
                <div className='space-x-4'>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      value='monthly'
                      checked={billingPeriod === 'monthly'}
                      onChange={(e) => setBillingPeriod(e.target.value)}
                      className='h-4 w-4 text-blue-600'
                    />
                    <span className='ml-2 text-sm'>Monthly</span>
                  </label>
                  <label className='inline-flex items-center'>
                    <input
                      type='radio'
                      value='annually'
                      checked={billingPeriod === 'annually'}
                      onChange={(e) => setBillingPeriod(e.target.value)}
                      className='h-4 w-4 text-blue-600'
                    />
                    <span className='ml-2 text-sm'>Annually</span>
                  </label>
                </div>
              </div>
            </div>

            <p className='text-2xl font-bold'>
              {formatPrice(
                billingPeriod === 'monthly'
                  ? price.monthly[currency.code as keyof typeof price.monthly] * userCount
                  : price.annually[currency.code as keyof typeof price.annually] * userCount
              )}{' '}
              <span className='text-sm font-normal'>
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
            </p>
          </div>
          <div className='flex justify-end space-x-2'>
            <Button variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
