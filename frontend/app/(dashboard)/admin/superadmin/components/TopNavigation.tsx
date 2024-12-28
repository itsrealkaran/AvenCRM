'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { CiBellOn } from 'react-icons/ci';
import { FaSearch } from 'react-icons/fa';
import { FaAngleDown, FaQuestion } from 'react-icons/fa6';

// done with it for now

export const TopNavigation = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    router.push('/sign-in');
  };

  return (
    <nav className='sticky top-0 z-50 w-full bg-card border-b'>
      <div className='px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between'>
        {/* Search */}
        <div className='hidden md:flex relative w-full max-w-sm'>
          <input className='input-modern pl-10' type='text' placeholder='Search anything...' />
          <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-muted' />
        </div>

        {/* Right section */}
        <div className='flex items-center space-x-4'>
          {/* Notifications */}
          <button className='button-modern bg-background hover:bg-input'>
            <CiBellOn className='h-5 w-5' />
            <span className='sr-only'>Notifications</span>
          </button>

          {/* Help */}
          <button className='button-modern bg-background hover:bg-input'>
            <FaQuestion className='h-4 w-4' />
            <span className='sr-only'>Help</span>
          </button>

          {/* Profile dropdown */}
          <div className='relative'>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className='flex items-center space-x-3 p-2 rounded-lg hover:bg-background'
            >
              <div className='h-8 w-8 overflow-hidden rounded-full ring-2 ring-background'>
                <Image
                  src='/images/avatar.png'
                  alt='Profile'
                  width={32}
                  height={32}
                  className='h-full w-full object-cover'
                />
              </div>
              <FaAngleDown
                className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <div className='absolute right-0 mt-2 w-48 rounded-lg bg-card border shadow-lg'>
                <div className='p-2'>
                  <button
                    onClick={handleSignOut}
                    className='w-full text-left px-3 py-2 text-sm rounded-md hover:bg-background'
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
