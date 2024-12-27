'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/types/enums';
import { User } from '@/types/user';
import axios from 'axios';
import {
  Building,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  HandshakeIcon,
  LayoutDashboard,
  LineChart,
  Mail,
  MenuIcon,
  MonitorIcon,
  Settings,
  Store,
  Users,
  Wallet,
} from 'lucide-react';

import apiClient from '@/lib/axios';

interface MenuItem {
  heading: string;
  icon: any;
  path: string;
  description?: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  // Dashboard - available for all roles
  {
    heading: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    description: 'Overview of your CRM',
    roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
  },
  // SuperAdmin specific items
  {
    heading: 'Companies',
    icon: Building,
    path: '/dashboard/companies',
    description: 'Manage companies',
    roles: [UserRole.SUPERADMIN],
  },
  // Admin specific items
  {
    heading: 'Manage Agents',
    icon: Users,
    path: '/dashboard/users',
    description: 'User management',
    roles: [UserRole.ADMIN, UserRole.TEAM_LEADER],
  },
  {
    heading: 'Monitoring',
    icon: MonitorIcon,
    path: '/dashboard/monitoring',
    description: 'System monitoring',
    roles: [UserRole.ADMIN, UserRole.TEAM_LEADER],
  },
  // Agent specific items
  {
    heading: 'Properties',
    icon: Building2,
    path: '/dashboard/properties',
    description: 'Property management',
    roles: [UserRole.AGENT, UserRole.TEAM_LEADER],
  },
  {
    heading: 'Leads',
    icon: Store,
    path: '/dashboard/leads',
    description: 'Lead management',
    roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
  },
  {
    heading: 'Deals',
    icon: HandshakeIcon,
    path: '/dashboard/deals',
    description: 'Deal management',
    roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
  },
  // Common items for all roles
  {
    heading: 'Calendar',
    icon: Calendar,
    path: '/dashboard/calendar',
    description: 'Schedule and events',
    roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
  },
  {
    heading: 'Email',
    icon: Mail,
    path: '/dashboard/email',
    description: 'Communication hub',
    roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
  },
  {
    heading: 'Transactions',
    icon: Wallet,
    path: '/dashboard/transactions',
    description: 'Transaction history',
    roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
  },
  {
    heading: 'Settings',
    icon: Settings,
    path: '/dashboard/settings',
    description: 'System preferences',
    roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch user data when component mounts
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, []);

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className='sticky top-0 z-10 h-screen w-[18%] select-none bg-white px-8 pt-10 shadow-xl shadow-black/20'>
      {/* Logo and Brand */}
      <div className='flex w-full items-center gap-[5px]'>
        <div className='text-[2rem] text-primary'>
          <MenuIcon className='h-8 w-8' />
        </div>
        <Link
          href='/dashboard'
          className='flex items-end gap-[2px] text-[1.24rem] font-bold text-primary hover:text-primary/90 transition-colors'
        >
          <h1>AvenCRM</h1>
          <span className='pb-[3px] text-[10px] opacity-70'>v.01</span>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className='mt-[35px] flex h-fit w-full flex-col gap-[2px]'>
        {filteredMenuItems.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors
              ${
                pathname === item.path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <item.icon className='h-5 w-5' />
            <span>{item.heading}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
