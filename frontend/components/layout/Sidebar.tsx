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

interface MenuItem {
  heading: string;
  icon: any;
  path: string;
  description?: string;
  roles: UserRole[];
}

const Sidebar = () => {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  // Extract role from pathname
  const role = pathname.split('/')[1]; // Assuming the role is in the second segment of the pathname

  const menuItems: MenuItem[] = [
    // Dashboard - available for all roles
    {
      heading: 'Dashboard',
      icon: LayoutDashboard,
      path: `/${role}/`,
      description: 'Overview of your CRM',
      roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    // SuperAdmin specific items
    {
      heading: 'Companies',
      icon: Building,
      path: `/${role}/companies`,
      description: 'Manage companies',
      roles: [UserRole.SUPERADMIN],
    },
    // Admin specific items
    {
      heading: 'Manage Agents',
      icon: Users,
      path: `/${role}/manage-team`,
      description: 'User management',
      roles: [UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Monitoring',
      icon: MonitorIcon,
      path: `/${role}/monitoring`,
      description: 'System monitoring',
      roles: [UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    // Agent specific items
    {
      heading: 'Properties',
      icon: Building2,
      path: `/${role}/property`,
      description: 'Property management',
      roles: [UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Leads',
      icon: Store,
      path: `/${role}/leads`,
      description: 'Lead management',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Deals',
      icon: HandshakeIcon,
      path: `/${role}/deals`,
      description: 'Deal management',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Page Builder',
      icon: FileText,
      path: `/${role}/page-builder`,
      description: 'Deal management',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Marketing',
      icon: LineChart,
      path: `/${role}/`,
      description: 'Deal management',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    // Common items for all roles
    {
      heading: 'Calendar',
      icon: Calendar,
      path: `/${role}/calendar`,
      description: 'Schedule and events',
      roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Email',
      icon: Mail,
      path: `/${role}/email`,
      description: 'Communication hub',
      roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Transactions',
      icon: Wallet,
      path: `/${role}/transactions`,
      description: 'Transaction history',
      roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Settings',
      icon: Settings,
      path: `/${role}/settings`,
      description: 'System preferences',
      roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
  ];

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

  // Update dashboard path based on role
  const updatedMenuItems = menuItems.map((item) => {
    if (item.heading === 'Dashboard') {
      return { ...item, path: `/${role}` };
    }
    return item;
  });

  // Filter menu items based on user role
  const filteredMenuItems = updatedMenuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <div className='sticky top-0 z-10 h-screen w-[18%] select-none bg-white px-8 pt-10 shadow-xl shadow-black/20'>
      {/* Logo and Brand */}
      <div className='flex w-full items-center gap-[5px]'>
        <div className='text-[2rem] text-primary'>
          <MenuIcon className='h-8 w-8' />
        </div>
        <Link
          href={`/dashboard/${role}`}
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
