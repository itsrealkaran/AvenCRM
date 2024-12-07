'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BsCalendar2Date } from 'react-icons/bs';
import { CiMail, CiSettings, CiUser, CiWallet } from 'react-icons/ci';
import { FaChartLine } from 'react-icons/fa6';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';
import { LuShieldAlert } from 'react-icons/lu';

import { cn } from '@/lib/utils';

interface SideNavBarProps {
  current: string;
}

const menuItems = [
  {
    heading: 'Dashboard',
    icon: FaChartLine,
    href: '/admin',
    description: 'Overview of your CRM',
  },
  {
    heading: 'Companies',
    icon: HiOutlineBuildingOffice2,
    href: '/admin/companies',
    description: 'Manage companies',
  },
  {
    heading: 'Calendar',
    icon: BsCalendar2Date,
    href: '/admin/calendar',
    description: 'Schedule and events',
  },
  {
    heading: 'Crash Reports',
    icon: LuShieldAlert,
    href: '/admin/crash-reports',
    description: 'System diagnostics',
  },
  {
    heading: 'Payments',
    icon: CiWallet,
    href: '/admin/payment',
    description: 'Transaction history',
  },
  {
    heading: 'Email',
    icon: CiMail,
    href: '/admin/email',
    description: 'Communication hub',
  },
  {
    heading: 'Settings',
    icon: CiSettings,
    href: '/admin/settings',
    description: 'System preferences',
  },
] as const;

const SideNavBar: React.FC<SideNavBarProps> = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className='h-screen w-[19%] flex flex-col bg-white border-r border-gray-200'>
      {/* Logo Section */}
      <div className='p-6 border-b border-gray-200'>
        <Link href='/admin' className='flex items-center gap-2 hover:opacity-80 transition-opacity'>
          <div className='relative w-8 h-8'>
            <div className='absolute inset-0 bg-primary/10 rounded-lg' />
            <CiSettings className='w-8 h-8 text-primary relative z-10' />
          </div>
          <div className='flex flex-col'>
            <span className='text-lg font-semibold text-gray-900'>AvenCRM</span>
            <span className='text-xs text-gray-500'>Admin Portal</span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
      <nav className='flex-1 overflow-y-auto p-4'>
        <div className='space-y-1'>
          {menuItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.heading}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gray-100',
                  active && 'bg-primary/10 text-primary hover:bg-primary/20'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 text-gray-500 transition-colors group-hover:text-gray-900',
                    active && 'text-primary'
                  )}
                />
                <div className='flex flex-col gap-0.5'>
                  <span
                    className={cn(
                      'text-gray-900 transition-colors group-hover:text-gray-900',
                      active && 'text-primary'
                    )}
                  >
                    {item.heading}
                  </span>
                  <span className='text-xs text-gray-500'>{item.description}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer Section */}
      <div className='border-t border-gray-200 p-4'>
        <div className='flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500'>
          <CiUser className='h-5 w-5' />
          <div className='flex flex-col'>
            <span className='font-medium text-gray-900'>Admin User</span>
            <span className='text-xs'>View Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNavBar;
