'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { IoDownloadOutline, IoSearch } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import { VscRefresh } from 'react-icons/vsc';

import FilterComp from '../components/FilterComp';

interface Payment {
  id: string;
  companyId: string;
  amount: number;
  date: string;
  type: string;
  planType: string;
  isVerfied: boolean;
  invoiceNumber: string | null;
  taxRate: number | null;
  totalAmount: number | null;
  paymentMethod: string | null;
  receiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const Page = () => {
  const [filteropen, setfilteropen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const filterClose = () => setfilteropen(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/company/payments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerification = async (paymentId: string, verified: boolean) => {
    debugger;

    const token = localStorage.getItem('accessToken');

    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Using the same base URL as the fetch payments endpoint
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/payments/verify?id=${paymentId}`,
        { isVerfied: verified, id: paymentId }, // Match the property name with the backend
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success('Payment status updated successfully');
        setRefreshKey((prev) => prev + 1);
      } else {
        throw new Error('Failed to update payment status');
      }
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Failed to update payment status'
      );
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, refreshKey]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className='w-full min-h-screen bg-gray-50'>
      <div className='max-w-[1400px] mx-auto px-6 py-8'>
        {/* Header Section */}
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Company Invoices</h1>
            <p className='text-sm text-gray-500 mt-1'>Manage and track your company transactions</p>
          </div>

          <div className='flex items-center gap-4'>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <IoSearch className='w-5 h-5 text-gray-600' />
            </button>
            <button
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <VscRefresh className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <IoDownloadOutline className='w-5 h-5 text-gray-600' />
            </button>
            <button
              onClick={() => setfilteropen(true)}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <LuFilter className='w-5 h-5 text-gray-600' />
            </button>
          </div>
        </div>

        {/* Company Info */}
        <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100'>
              <Image
                className='w-full h-full object-contain'
                src='https://cdn.pixabay.com/photo/2015/10/20/21/05/mcdonald-998495_1280.png'
                alt='Company Logo'
                width={100}
                height={100}
              />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>McDonalds</h2>
              <p className='text-sm text-gray-500'>Premium Plan</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='grid grid-cols-6 gap-4 p-4 bg-gray-50 border-b border-gray-200'>
            <div className='text-sm font-medium text-gray-700'>Date</div>
            <div className='text-sm font-medium text-gray-700'>Invoice Number</div>
            <div className='text-sm font-medium text-gray-700'>Plan Type</div>
            <div className='text-sm font-medium text-gray-700'>Amount</div>
            <div className='text-sm font-medium text-gray-700'>Status</div>
            <div className='text-sm font-medium text-gray-700'>Actions</div>
          </div>

          <div className='divide-y divide-gray-200'>
            {loading ? (
              <div className='p-8 text-center text-gray-500'>Loading payments...</div>
            ) : payments.length === 0 ? (
              <div className='p-8 text-center text-gray-500'>No payments found</div>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className='grid grid-cols-6 gap-4 p-4 hover:bg-gray-50 transition-colors'
                >
                  <div className='text-sm text-gray-900'>
                    {format(new Date(payment.date), 'MMM dd, yyyy')}
                  </div>
                  <div className='text-sm text-gray-900'>{payment.invoiceNumber || '-'}</div>
                  <div className='text-sm'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.planType === 'PROFESSIONAL'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {payment.planType}
                    </span>
                  </div>
                  <div className='text-sm text-gray-900'>{formatCurrency(payment.amount)}</div>
                  <div className='text-sm'>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.isVerfied
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.isVerfied ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleVerification(payment.id, true)}
                      disabled={payment.isVerfied}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        payment.isVerfied
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleVerification(payment.id, false)}
                      disabled={!payment.isVerfied}
                      className={`px-3 py-1 rounded-md text-xs font-medium ${
                        !payment.isVerfied
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      {filteropen && <FilterComp close={filterClose} />}
    </div>
  );
};

export default Page;
