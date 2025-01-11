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
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FileText,
  HandshakeIcon,
  LayoutDashboard,
  LineChart,
  Mail,
  MonitorIcon,
  Settings,
  Store,
  Users,
  Wallet,
} from 'lucide-react';
import { FaAngleRight } from 'react-icons/fa6';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import Logo from '../logo';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    // Team Leader specific items
    {
      heading: 'Manage Team',
      icon: Users,
      path: `/${role}/manage-team`,
      description: 'Team management',
      roles: [UserRole.TEAM_LEADER],
    },
    {
      heading: 'Team Monitoring',
      icon: MonitorIcon,
      path: `/${role}/team-monitoring`,
      description: 'Property management',
      roles: [UserRole.TEAM_LEADER],
    },
    // Admin specific items
    {
      heading: 'Manage Agents',
      icon: Users,
      path: `/${role}/manage-agents`,
      description: 'User management',
      roles: [UserRole.ADMIN],
    },
    {
      heading: 'Subscription',
      icon: Wallet,
      path: `/${role}/subscription`,
      description: 'Subscription management',
      roles: [UserRole.ADMIN],
    },
    {
      heading: 'Meta Ads',
      icon: LineChart,
      path: `/${role}/meta-ads`,
      description: 'Property management',
      roles: [UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Monitoring',
      icon: MonitorIcon,
      path: `/${role}/monitoring`,
      description: 'System monitoring',
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Properties',
      icon: Building2,
      path: `/${role}/property`,
      description: 'Property management',
      roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
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
      description: 'Build and manage pages',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    {
      heading: 'Marketing',
      icon: LineChart,
      path: `/${role}/marketing`,
      description: 'Marketing management',
      roles: [UserRole.AGENT, UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
     // Common items for all roles
    {
      heading: 'Tasks',
      icon: CheckSquare,
      path: `/${role}/tasks`,
      description: 'Task management',
      roles: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.AGENT, UserRole.TEAM_LEADER],
    },
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

    // Check if the screen is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`h-screen z-50 sticky top-0 select-none overflow-x-hidden bg-white shadow-xl shadow-black/20 pt-6 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[60px] px-2' : 'w-[20%] px-8'}
        ${isMobile ? 'absolute' : 'relative'}`}
    >
      {/* Logo and Brand */}
      <div
        className={`w-full flex items-center gap-[2px] pb-[30px] ${isCollapsed ? 'justify-center' : ''}`}
      >
        <div className='text-[2rem]'>
          <Logo />
        </div>
        {!isCollapsed && (
          <Link
            href='/dashboard'
            className='text-[1.24rem] text-[#5932ea] flex gap-[2px] items-end font-bold'
          >
            <h1>AvenCRM</h1>
            <span className='text-[10px] opacity-70 pb-[3px]'>v.01</span>
          </Link>
        )}
      </div>

      <div className='w-full h-[calc(100%-120px)] flex flex-col gap-[2px] overflow-y-auto'>
        {filteredMenuItems.map((item, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={item.path}
                  className={`flex flex-row items-center gap-3 justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors
                    ${pathname === item.path ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}
                    ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className={`flex flex-row gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                    <item.icon className='h-5 w-5' />
                    {!isCollapsed && (
                      <span className='whitespace-nowrap truncate'>{item.heading}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div>
                      <FaAngleRight />
                    </div>
                  )}
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side={isCollapsed ? 'right' : 'top'}
                className='bg-white text-gray-700 shadow-lg border border-gray-100 px-3 py-2'
              >
                <p>{item.heading}</p>
                {isCollapsed && <p className='text-xs text-gray-500'>{item.description}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Collapse/Expand Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className={`absolute bottom-4 transition-all duration-300 ease-in-out
                ${isCollapsed ? 'right-1/2 transform translate-x-1/2' : 'right-2'}`}
              onClick={toggleSidebar}
            >
              {isCollapsed ? (
                <ChevronRight className='h-4 w-4' />
              ) : (
                <ChevronLeft className='h-4 w-4' />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side='right'
            className='bg-white text-gray-700 shadow-lg border border-gray-100 px-3 py-2'
          >
            <p>{isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default Sidebar;
