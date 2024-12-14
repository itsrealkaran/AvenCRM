'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className='bg-gradient-to-b from-white to-gray-50'>
      <main className='min-h-screen'>
        {/* Hero Section */}
        <div className='px-6 lg:px-8 py-24 sm:py-32'>
          <div className='mx-auto max-w-7xl text-center'>
            <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
              CRM that is simple to setup and easy to use
              <span className='text-primary'> AvenCRM</span>
            </h1>
            <p className='mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto'>
              Streamline customer relationships, boost productivity, and drive growth with our
              powerful CRM solution.
            </p>
            <div className='mt-10 flex items-center justify-center gap-x-6'>
              <Link
                href='/sign-up'
                className='rounded-md bg-primary px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-all'
              >
                Get Started Free
              </Link>
              <Link
                href='/sign-in'
                className='text-lg font-semibold leading-6 text-gray-900 hover:text-primary transition-all'
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className='mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <Link
              href='/company'
              className='group rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition-all'
            >
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>For Companies</h3>
              <p className='text-gray-600 mb-4'>
                Manage your entire business operations from a single dashboard
              </p>
              <span className='inline-flex items-center text-primary group-hover:gap-1.5 transition-all'>
                Learn more{' '}
                <ArrowRight className='w-4 h-4 opacity-0 group-hover:opacity-100 transition-all' />
              </span>
            </Link>

            <Link
              href='/agent'
              className='group rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition-all'
            >
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>For Agents</h3>
              <p className='text-gray-600 mb-4'>
                Powerful tools to manage clients and boost your productivity
              </p>
              <span className='inline-flex items-center text-primary group-hover:gap-1.5 transition-all'>
                Learn more{' '}
                <ArrowRight className='w-4 h-4 opacity-0 group-hover:opacity-100 transition-all' />
              </span>
            </Link>

            <Link
              href='/admin'
              className='group rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition-all'
            >
              <h3 className='text-xl font-semibold text-gray-900 mb-4'>For Admins</h3>
              <p className='text-gray-600 mb-4'>
                Complete control over your organization&apos;s CRM system
              </p>
              <span className='inline-flex items-center text-primary group-hover:gap-1.5 transition-all'>
                Learn more{' '}
                <ArrowRight className='w-4 h-4 opacity-0 group-hover:opacity-100 transition-all' />
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
