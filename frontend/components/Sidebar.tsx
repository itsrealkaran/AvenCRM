'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { FaAngleRight } from 'react-icons/fa6';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MenuItem {
  heading: string;
  icon: LucideIcon;
  path: string;
  description: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
}

const Sidebar = ({ menuItems }: SidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsCollapsed(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      className={`h-screen z-50 sticky top-0 select-none overflow-x-hidden bg-white shadow-xl shadow-black/20 pt-6 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-[60px] px-2' : 'w-[18%] px-8'}
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
        {menuItems.map((item, index) => (
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
