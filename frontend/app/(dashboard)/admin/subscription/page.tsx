'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaCheck } from 'react-icons/fa';

import { StripeModal } from '@/components/stripe/stripe-modal';

interface Payment {
  id: string;
  amount: number;
  date: string;
  planType: string;
  isSuccessfull: boolean;
  createdAt: string;
}

const plans = {
  basic: {
    id: 'BASIC',
    name: 'Basic',
    price: 99,
    features: [
      'All Analytics features',
      'Up to 250,000 tracked visits',
      'Normal support',
      'Up to 3 team members',
      'All analytics features',
      'Normal support',
    ],
  },
  popular: {
    id: 'PROFESSIONAL',
    name: 'Popular',
    price: 199,
    features: [
      'All Analytics features',
      'Up to 1,000,000 tracked visits',
      'Premium support',
      'Up to 10 team members',
      'All analytics features',
      'Priority support',
    ],
  },
};

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<
    typeof plans.basic | typeof plans.popular | null
  >(null);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription/getsubscription`,
          { withCredentials: true }
        );
        setPayments(response.data || []);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handlePayment = (plan: typeof plans.basic | typeof plans.popular) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className='h-full overflow-y-auto p-6'>
      {/* Pricing Cards */}
      <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Basic Plan */}
        <div className='rounded-2xl bg-white shadow-sm transition hover:shadow-md'>
          <div className='flex'>
            {/* Plan Details */}
            <div className='flex-1 p-8'>
              <div className='flex items-start gap-4'>
                <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50'>
                  <div className='h-8 w-8 overflow-hidden rounded-full'>
                    <div className='flex h-full w-full'>
                      <div className='h-full w-1/2 bg-teal-400'></div>
                      <div className='h-full w-1/2 bg-indigo-400'></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>For individuals</p>
                  <h2 className='mt-1 text-2xl font-semibold text-gray-900'>Basic</h2>
                </div>
              </div>

              <p className='mt-4 text-gray-600'>
                Perfect for individuals and small teams getting started with our platform.
              </p>

              <div className='mt-6 grid grid-cols-2 gap-4'>
                <div>
                  <div className='rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700'>
                    Status
                  </div>
                  <div className='mt-2 px-4 text-sm font-medium text-emerald-600'>Active</div>
                </div>
                <div>
                  <div className='rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700'>
                    Next Due Date
                  </div>
                  <div className='mt-2 px-4 text-sm font-medium text-blue-600'>14/05/25</div>
                </div>
              </div>

              <button
                onClick={() => handlePayment(plans.basic)}
                className='mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700'
              >
                Pay now
              </button>
            </div>

            {/* Plan Features */}
            <div className='flex-1 border-l border-gray-100 p-8'>
              <div className='flex items-baseline gap-2'>
                <span className='text-4xl font-bold text-gray-900'>${plans.basic.price}</span>
                <span className='text-sm text-gray-600'>/monthly</span>
              </div>

              <div className='mt-6'>
                <h3 className='font-semibold text-gray-900'>What&apos;s included</h3>
                <ul className='mt-4 space-y-3'>
                  {plans.basic.features.map((feature, index) => (
                    <li key={index} className='flex items-center gap-3'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white'>
                        <FaCheck />
                      </div>
                      <span className='text-sm text-gray-600'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Plan */}
        <div className='overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md'>
          <div className='flex'>
            {/* Plan Details */}
            <div className='flex-1 p-8'>
              <div className='flex items-start gap-4'>
                <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50'>
                  <div className='h-8 w-8 overflow-hidden rounded-lg'>
                    <div className='flex h-full w-full'>
                      <div className='h-full w-1/2 bg-teal-400'></div>
                      <div className='flex h-full w-1/2 flex-col'>
                        <div className='h-1/2 w-full bg-indigo-400'></div>
                        <div className='h-1/2 w-full bg-indigo-200'></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className='text-sm text-gray-600'>For Startups</p>
                  <h2 className='mt-1 text-2xl font-semibold text-gray-900'>Popular</h2>
                </div>
              </div>

              <p className='mt-4 text-gray-600'>
                Ideal for growing businesses that need more power and features.
              </p>

              <button
                onClick={() => handlePayment(plans.popular)}
                className='mt-16 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-200'
              >
                Get Started
              </button>
            </div>

            {/* Plan Features */}
            <div className='flex-1 border-l border-gray-100 p-8'>
              <div className='flex items-baseline gap-2'>
                <span className='text-4xl font-bold text-gray-900'>${plans.popular.price}</span>
                <span className='text-sm text-gray-600'>/monthly</span>
              </div>

              <div className='mt-6'>
                <h3 className='font-semibold text-gray-900'>What&apos;s included</h3>
                <ul className='mt-4 space-y-3'>
                  {plans.popular.features.map((feature, index) => (
                    <li key={index} className='flex items-center gap-3'>
                      <div className='flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white'>
                        <FaCheck />
                      </div>
                      <span className='text-sm text-gray-600'>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className='rounded-2xl bg-white p-6 shadow-sm mb-6 '>
        <h3 className='mb-6 text-lg font-semibold text-gray-900'>Transaction History</h3>

        {loading ? (
          <div className='text-center py-4'>Loading...</div>
        ) : payments.length === 0 ? (
          <div className='text-center py-4'>No payment history found</div>
        ) : (
          <div>
            <div className='mb-4 grid grid-cols-5 gap-4 px-4 text-sm font-medium text-gray-700'>
              <div className='rounded-lg bg-gray-50 px-4 py-2'>Date</div>
              <div className='rounded-lg bg-gray-50 px-4 py-2'>Description</div>
              <div className='rounded-lg bg-gray-50 px-4 py-2 text-center'>Billing Amount</div>
              <div className='rounded-lg bg-gray-50 px-4 py-2 text-center'>Due Date</div>
              <div className='rounded-lg bg-gray-50 px-4 py-2 text-center'>Status</div>
            </div>

            <div className='max-h-[400px] space-y-2 overflow-y-auto'>
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className='grid grid-cols-5 gap-4 rounded-lg px-4 py-3 transition hover:bg-gray-50'
                >
                  <div className='text-sm text-gray-600'>
                    {format(new Date(payment.createdAt), 'MMM yyyy')}
                  </div>
                  <div className='text-sm'>
                    <p className='font-medium text-gray-900'>{payment.planType} Plan</p>
                    <p className='text-xs text-gray-600'>
                      {format(new Date(payment.createdAt), 'MMMM dd, yyyy')}
                    </p>
                  </div>
                  <div className='text-center text-sm font-medium text-gray-900'>
                    ₹{payment.amount.toFixed(2)}
                  </div>
                  <div className='text-center text-sm text-gray-600'>
                    {format(new Date(payment.date), 'MMM dd, yyyy')}
                  </div>
                  <div
                    className={`text-center text-sm font-medium ${
                      payment.isSuccessfull ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {payment.isSuccessfull ? 'Paid' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stripe Modal */}
      {selectedPlan && (
        <StripeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          price={selectedPlan.price}
        />
      )}
    </div>
  );
};

export default Page;