'use client';

import { useEffect, useState } from 'react';
import { useSignUp } from '@/contexts/SignUpContext';
import { motion } from 'framer-motion';
import { CalendarDays, Check, Users, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface StepProps {
  onNext: (userCount?: number) => void;
}

const FreeTrial = () => (
  <div className='border-2 border-[#5932EA] rounded-xl p-6 space-y-4'>
    <h3 className='text-xl font-bold text-[#5932EA]'>14-Day Free Trial</h3>
    <p className='text-gray-600'>Experience all features with no commitment.</p>
    <div className='flex items-center text-gray-600'>
      <CalendarDays className='mr-2 h-5 w-5' />
      <span>Full access for 14 days</span>
    </div>
  </div>
);

const planOptions = {
  individual: [
    {
      name: 'Basic',
      price: {
        monthly: 14,
        annually: 9,
        cadMonthly: 20,
        cadAnnually: 13,
        aedMonthly: 51,
        aedAnnually: 33,
      },
    },
    {
      name: 'Premium',
      price: {
        monthly: 26,
        annually: 19,
        cadMonthly: 37,
        cadAnnually: 27,
        aedMonthly: 95,

        aedAnnually: 70,
      },
    },
    {
      name: 'Enterprise',
      price: {
        monthly: 41,
        annually: 29,
        cadMonthly: 59,
        cadAnnually: 42,

        aedMonthly: 150,
        aedAnnually: 105,
      },
    },
  ],
  company: [
    {
      name: 'Basic',
      price: {
        monthly: 14,
        annually: 9,
        cadMonthly: 20,
        cadAnnually: 13,

        aedMonthly: 51,
        aedAnnually: 33,
      },
    },
    {
      name: 'Premium',
      price: {
        monthly: 26,
        annually: 19,
        cadMonthly: 37,
        cadAnnually: 27,

        aedMonthly: 95,
        aedAnnually: 70,
      },
    },
    {
      name: 'Enterprise',
      price: {
        monthly: 41,
        annually: 29,
        cadMonthly: 59,
        cadAnnually: 42,

        aedMonthly: 150,
        aedAnnually: 105,
      },
    },
  ],
};

const getUserLocation = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    const middleEastCountries = ['AE', 'SA', 'BH', 'OM', 'QA', 'KW', 'IN'];
    const northAmericaCountries = ['CA'];
    if (middleEastCountries.includes(data.country_code)) {
      return 'AED';
    } else if (northAmericaCountries.includes(data.country_code)) {
      return 'CAD';
    }
    return 'USD';
  } catch (error) {
    console.error('Error fetching location:', error);
    return 'USD';
  }
};

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'CAD':
      return 'C$';
    case 'AED':
      return 'AED';
    default:
      return '$';
  }
};

const getPriceForCurrency = (prices: any, currency: string, isAnnual: boolean) => {
  switch (currency) {
    case 'CAD':
      return isAnnual ? prices.cadAnnually : prices.cadMonthly;
    case 'AED':
      return isAnnual ? prices.aedAnnually : prices.aedMonthly;
    default:
      return isAnnual ? prices.annually : prices.monthly;
  }
};

export default function PlanSelection({ onNext }: StepProps) {
  const { billingFrequency, updateField } = useSignUp();
  const [plan, setPlan] = useState('');
  const [userCount, setUserCount] = useState(1);
  const [showFreeTrial, setShowFreeTrial] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');

  const isYearly = billingFrequency === 'yearly';

  useEffect(() => {
    const detectLocation = async () => {
      const detectedCurrency = await getUserLocation();
      setCurrency(detectedCurrency);
      setCurrencySymbol(getCurrencySymbol(detectedCurrency));
      updateField('currency', detectedCurrency);
    };

    detectLocation();
  }, []);

  useEffect(() => {
    if (!showFreeTrial) {
      const accountType = 'company';
      const selectedPlan = planOptions[accountType].find((p) => p.name.toLowerCase() === plan);
      if (selectedPlan) {
        const price = getPriceForCurrency(selectedPlan.price, currency, isYearly);
        setTotalPrice(price * userCount);
      }
    } else {
      setTotalPrice(0);
    }
  }, [plan, billingFrequency, userCount, showFreeTrial, isYearly, currency]);

  const handlePlanChange = (value: string) => {
    if (value === plan) {
      setPlan('');
      updateField('plan', '');
    } else {
      setPlan(value);
      updateField('plan', value);
    }
    setShowFreeTrial(false);
  };

  const toggleFreeTrial = () => {
    setShowFreeTrial(!showFreeTrial);
    if (!showFreeTrial) {
      setPlan('basic');
      updateField('plan', 'basic');
    } else {
      setPlan('');
      updateField('plan', '');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold text-gray-900'>Choose your plan</h2>
        <p className='text-sm text-gray-500'>
          Select the plan that suits your needs or start with a free trial.
        </p>
      </div>

      {!showFreeTrial && (
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium'>Billing Frequency</span>
          <div className='flex items-center space-x-2'>
            <span className={`text-sm ${!isYearly ? 'font-medium' : ''}`}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={(checked) =>
                updateField('billingFrequency', checked ? 'yearly' : 'monthly')
              }
              className='bg-gray-200 data-[state=checked]:bg-[#5932EA]'
            />
            <span className={`text-sm ${isYearly ? 'font-medium' : ''}`}>Yearly</span>
          </div>
        </div>
      )}

      <div className='space-y-3 max-w-5xl mx-auto'>
        <Button
          variant='outline'
          onClick={toggleFreeTrial}
          className={`w-full justify-between ${showFreeTrial ? 'border-[#5932EA] text-[#5932EA]' : ''}`}
        >
          <span>Try Free for 14 Days</span>
          {showFreeTrial ? <Check className='h-4 w-4' /> : <X className='h-4 w-4' />}
        </Button>

        {showFreeTrial ? (
          <FreeTrial />
        ) : (
          <>
            <div
              className={`grid ${plan ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-2 pt-4`}
            >
              {planOptions.company.map((option) =>
                plan === '' || plan === option.name.toLowerCase() ? (
                  <Button
                    key={option.name}
                    onClick={() => handlePlanChange(option.name.toLowerCase())}
                    variant='outline'
                    className={`flex flex-col h-full items-start justify-between rounded-xl border-2 p-6 hover:bg-gray-50 hover:border-gray-300 
                    ${
                      plan === option.name.toLowerCase()
                        ? 'border-[#5932EA] ring-1 ring-[#5932EA]'
                        : 'border-muted'
                    } transition-all duration-200 text-left`}
                  >
                    <div className='flex w-full flex-col space-y-4'>
                      <h3 className='text-lg font-bold text-left'>{option.name}</h3>
                      <div>
                        <div className='flex items-baseline'>
                          <span className='text-2xl font-bold'>
                          
                            {currencySymbol}{getPriceForCurrency(option.price, currency, isYearly) * userCount}
                          </span>
                          <span className='text-sm font-normal text-gray-500 ml-1'>/month</span>
                        </div>
                        <div className='text-sm text-gray-500 flex items-center mt-2'>
                          <Users className='inline-block mr-1 h-4 w-4' />

                          <span>
                            {userCount} user{userCount > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ) : null
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='user-count'>Number of Users</Label>
              <Input
                id='user-count'
                type='number'
                min='1'
                max={
                  //@ts-ignore
                  planOptions.company.find((p) => p.name.toLowerCase() === plan)?.maxUsers || 999
                }
                value={userCount}
                onChange={(e) => {
                  const newUserCount = Math.max(1, Number.parseInt(e.target.value) || 1);
                  setUserCount(newUserCount);
                  updateField('userCount', newUserCount);
                }}
                className='w-full'
                disabled={!plan}
              />
            </div>
          </>
        )}
      </div>

      <Button
        onClick={() => onNext(userCount)}
        className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
        disabled={!showFreeTrial && !plan}
      >
        {showFreeTrial
          ? 'Start Free Trial'
          : plan
            ? 'Continue with ' + plan.charAt(0).toUpperCase() + plan.slice(1)
            : 'Select a Plan'}
      </Button>
    </motion.div>
  );
}
