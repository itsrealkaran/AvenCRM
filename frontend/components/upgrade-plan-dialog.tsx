'use client';

import { useEffect, useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface UpgradePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userLimit: number;
}

const getPlan = async (planType: string) => {
  const response = await api.get(`/subscription/plan/${planType}`);
  return response.data;
};

export function UpgradePlanDialog({ isOpen, onClose, userLimit }: UpgradePlanDialogProps) {
  const [isUpgradeClicked, setIsUpgradeClicked] = useState(false);
  const [userCount, setUserCount] = useState(1);
  const [totalAmount, setTotalAmount] = useState(0);
  const { company } = useAuth();
  const { formatPrice, currency } = useCurrency();

  const { data: companyData } = useQuery({
    queryKey: ['plan'],
    queryFn: () => getPlan(company?.planName || ''),
  });

  useEffect(() => {
    if (companyData) {
      const priceJson =
        typeof companyData?.plan.price === 'string'
          ? JSON.parse(companyData?.plan.price)
          : companyData?.plan.price;
      const planPrice =
        company?.planType === 'INDIVIDUAL' ? priceJson.individual : priceJson.company;
      const totalAmount =
        company?.billingFrequency === 'MONTHLY' ? planPrice.monthly : planPrice.annually;
      const planEndDate = new Date(companyData.company.planEnd);
      const currentDate = new Date();

      if (companyData.company.planEnd && company?.billingFrequency === 'MONTHLY') {
        const totalAmountWithUserCount = totalAmount[currency.code] * userCount;
        const daysRemaining = Math.ceil(
          (planEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalAmountPerDay = totalAmountWithUserCount / 31;
        const totalAmountForDaysRemaining = totalAmountPerDay * daysRemaining;
        setTotalAmount(totalAmountForDaysRemaining);
      } else if (companyData.company.planEnd && company?.billingFrequency === 'ANNUALLY') {
        const totalAmountWithUserCount = totalAmount[currency.code] * userCount * 12;
        const monthsRemaining = Math.ceil(
          (planEndDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        const totalAmountPerMonth = totalAmountWithUserCount / 12;
        const totalAmountForMonthsRemaining = totalAmountPerMonth * monthsRemaining;
        setTotalAmount(totalAmountForMonthsRemaining);
      }
    }
  }, [userCount, companyData]);

  const handleUpgrade = () => {
    setIsUpgradeClicked(true);

    if (companyData?.company.planEnd) {
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Limit Reached</DialogTitle>
          <DialogDescription>
            You have reached the maximum limit of {userLimit} users for your current plan. Upgrade
            your plan to add more agents and unlock additional features.
          </DialogDescription>
          {isUpgradeClicked && (
            <>
              <div className='mt-4'>
                <label htmlFor='userCount' className='block text-sm font-medium text-gray-700'>
                  Number of Users
                </label>
                <input
                  type='number'
                  id='userCount'
                  value={userCount}
                  onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
                />
              </div>
              <div className='mt-4'>
                <label htmlFor='totalAmount' className='block text-sm font-medium text-gray-700'>
                  Total Amount
                </label>
                <div className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'>
                  {formatPrice(totalAmount)}
                </div>
              </div>
            </>
          )}
        </DialogHeader>
        <DialogFooter className='flex justify-end space-x-2'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade} className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'>
            {isUpgradeClicked ? 'Upgrade' : 'Upgrade Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
