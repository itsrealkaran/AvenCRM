'use client';

import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FaCheck } from 'react-icons/fa';

import { StripeModal } from '@/components/stripe/stripe-modal';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';

import { TransactionHistoryTable } from './transaction-history';

interface Payment {
  id: string;
  amount: number;
  date: string;
  planType: string;
  isSuccessfull: boolean;
  createdAt: string;
}

const getPlans = async () => {
  const response = await api.get('/subscription/plans');
  return response.data;
};

const getSubscription = async () => {
  const response = await api.get('/subscription/getsubscription');
  return response.data;
};

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [hasOverflow, setHasOverflow] = useState<Record<string, boolean>>({});
  const featuresRefs = React.useRef<Record<string, HTMLUListElement | null>>({});

  const {
    data: allPlans,
    isLoading: plansLoading,
    isSuccess: plansSuccess,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: getPlans,
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getSubscription,
  });

  useEffect(() => {
    const checkOverflow = () => {
      const newHasOverflow: Record<string, boolean> = {};
      Object.entries(featuresRefs.current).forEach(([planId, ref]) => {
        if (ref) {
          newHasOverflow[planId] = ref.scrollHeight > ref.clientHeight;
        }
      });
      setHasOverflow(newHasOverflow);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [plansSuccess]);

  const handlePayment = (plan: any) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section className='h-full w-full'>
      <Card className='space-y-4 p-6'>
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Subscription</h1>
            <p className='text-sm text-muted-foreground mt-1'>Manage your plan and subscription</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className='mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {plansLoading ? (
            // Skeleton loading state
            <>
              <div className='rounded-2xl bg-gray-100 shadow-sm animate-pulse'>
                <div className='flex h-[400px]'>
                  <div className='flex-1 p-8'>
                    <div className='flex items-start gap-4'>
                      <div className='h-14 w-14 bg-gray-200 rounded-xl'></div>
                      <div className='space-y-2'>
                        <div className='h-4 w-24 bg-gray-200 rounded'></div>
                        <div className='h-6 w-32 bg-gray-200 rounded'></div>
                      </div>
                    </div>
                    <div className='mt-4 h-16 bg-gray-200 rounded'></div>
                    <div className='mt-6 h-10 w-24 bg-gray-200 rounded-lg'></div>
                  </div>
                  <div className='flex-1 border-l border-gray-200 p-8'>
                    <div className='h-8 w-32 bg-gray-200 rounded'></div>
                    <div className='mt-6 space-y-3'>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className='h-6 bg-gray-200 rounded'></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className='rounded-2xl bg-gray-100 shadow-sm animate-pulse'>
                {/* Duplicate skeleton structure for second card */}
                <div className='flex h-[400px]'>
                  {/* ... same skeleton structure as above ... */}
                </div>
              </div>
            </>
          ) : (
            plansSuccess &&
            allPlans?.map((plan: any) => (
              <div
                key={plan.id}
                className={`rounded-2xl ${
                  plan.name === 'Premium' ? 'bg-yellow-50' : 'bg-blue-50'
                } shadow-sm transition hover:shadow-md`}
              >
                <div className='flex'>
                  <div className='flex-1 p-8'>
                    <div className='flex items-start gap-4'>
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                          plan.name === 'PREMIUM' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}
                      >
                        <div
                          className={`h-8 w-8 overflow-hidden ${
                            plan.name === 'Premium' ? 'rounded-lg' : 'rounded-full'
                          }`}
                        >
                          <div className='flex h-full w-full'>
                            <div
                              className={`h-full w-1/2 ${
                                plan.name === 'Premium' ? 'bg-yellow-400' : 'bg-blue-400'
                              }`}
                            ></div>
                            <div
                              className={`h-full w-1/2 ${
                                plan.name === 'Premium' ? 'bg-yellow-600' : 'bg-blue-600'
                              }`}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p
                          className={`text-sm ${
                            plan.name === 'PREMIUM' ? 'text-yellow-600' : 'text-blue-600'
                          }`}
                        >
                          {plan.name === 'PREMIUM' ? 'For larger agencies' : 'For individuals'}
                        </p>
                        <h2
                          className={`mt-1 text-2xl font-semibold ${
                            plan.name === 'PREMIUM' ? 'text-yellow-900' : 'text-blue-900'
                          }`}
                        >
                          {plan.name}
                        </h2>
                      </div>
                    </div>
                    <p
                      className={`mt-4 ${
                        plan.name === 'PREMIUM' ? 'text-yellow-600' : 'text-blue-600'
                      }`}
                    >
                      {plan.name === 'PREMIUM'
                        ? 'Ideal for growing businesses that need more power and features.'
                        : 'Perfect for individuals and small teams getting started with our platform.'}
                    </p>
                    <button
                      onClick={() => handlePayment(plan)}
                      className={`mt-6 ${
                        plan.name === 'PREMIUM' ? 'mt-16 w-full' : ''
                      } rounded-lg ${
                        plan.name === 'PREMIUM'
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } px-4 py-2 text-sm font-medium text-white transition`}
                    >
                      {plan.name === 'PREMIUM' ? 'Upgrade' : 'Pay now'}
                    </button>
                  </div>
                  <div
                    className={`flex-1 border-l ${
                      plan.name === 'PREMIUM' ? 'border-yellow-100' : 'border-blue-100'
                    } p-8`}
                  >
                    <div className='flex items-baseline gap-2'>
                      <span
                        className={`text-4xl font-bold ${
                          plan.name === 'PREMIUM' ? 'text-yellow-900' : 'text-blue-900'
                        }`}
                      >
                        ${plan.price.company.monthly.USD}
                      </span>
                      <span
                        className={`text-sm ${
                          plan.name === 'PREMIUM' ? 'text-yellow-600' : 'text-blue-600'
                        }`}
                      >
                        /monthly
                      </span>
                    </div>
                    <h3
                      className={`mt-6 font-semibold ${
                        plan.name === 'PREMIUM' ? 'text-yellow-900' : 'text-blue-900'
                      }`}
                    >
                      What&apos;s included
                    </h3>
                    <div>
                      <ul
                        ref={(el) => {
                          if (el) {
                            featuresRefs.current[plan.id] = el;
                          }
                        }}
                        className={`mt-4 space-y-3 ${
                          expandedPlan === plan.id ? '' : 'max-h-[200px] overflow-hidden'
                        }`}
                      >
                        {plan.features.map((feature: any, index: any) => (
                          <li key={index} className='flex items-center gap-3'>
                            <div
                              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                                plan.name === 'PREMIUM' ? 'bg-yellow-600' : 'bg-blue-600'
                              } text-[10px] text-white`}
                            >
                              <FaCheck />
                            </div>
                            <span
                              className={`text-sm ${
                                plan.name === 'PREMIUM' ? 'text-yellow-600' : 'text-blue-600'
                              }`}
                            >
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {hasOverflow[plan.id] && (
                        <button
                          onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                          className={`text-sm font-medium ${
                            plan.name === 'PREMIUM' ? 'text-yellow-600' : 'text-blue-600'
                          } hover:underline mt-2`}
                        >
                          {expandedPlan === plan.id ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Transaction History */}
        <div className=''>
          <h3 className='mb-6 text-lg font-semibold text-gray-900'>Transaction History</h3>
          <TransactionHistoryTable data={payments || []} loading={paymentsLoading} />
        </div>

        {/* Stripe Modal */}
        {selectedPlan && (
          <StripeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            planId={selectedPlan.name}
            planName={selectedPlan.name}
            price={selectedPlan.price.company.monthly.USD}
          />
        )}
      </Card>
    </section>
  );
};

export default Page;
