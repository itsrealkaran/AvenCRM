'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { FaCheck } from 'react-icons/fa';

import { StripeModal } from '@/components/stripe/stripe-modal';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
} from '@/components/ui/table'; 

interface Payment {
  id: string;
  amount: number;
  date: string;
  planType: string;
  isSuccessfull: boolean;
  createdAt: string;
}

const plans = {
  // ...plans definition
};

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans.basic | typeof plans.popular | null>(
    null
  );
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
    <section className="h-full">
      <Card className="container space-y-4 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground mt-1">Manage companies and their subscriptions</p>
          </div>
        </div>
        {/* Pricing Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic Plan */}
          <div className="rounded-2xl bg-white shadow-sm transition hover:shadow-md">
            {/* ...Basic plan details */}
          </div>
          {/* Popular Plan */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
            {/* ...Popular plan details */}
          </div>
        </div>

        {/* Transaction History */}
        <div className="rounded-2xl bg-white p-6 shadow-sm mb-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Transaction History</h3>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-4">No payment history found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2 text-center">Billing Amount</th>
                  <th className="px-4 py-2 text-center">Due Date</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <td className="px-4 py-2 text-gray-600">
                      {format(new Date(payment.createdAt), 'MMM yyyy')}
                    </td>
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-900">{payment.planType} Plan</p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(payment.createdAt), 'MMMM dd, yyyy')}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-center text-gray-900 font-medium">
                      ₹{payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-center text-gray-600">
                      {format(new Date(payment.date), 'MMM dd, yyyy')}
                    </td>
                    <td
                      className={`px-4 py-2 text-center font-medium ${
                        payment.isSuccessfull ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {payment.isSuccessfull ? 'Paid' : 'Failed'}
                    </td>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter />
            </Table>
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
      </Card>
    </section>
  );
};

export default Page;
