'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

interface SubItem {
  title: string;
  url: string;
}

interface SidebarDropdownProps {
  title: string;
  icon: React.ElementType;
  items: SubItem[];
  baseUrl: string;
}

export function SidebarDropdown({ title, icon: Icon, items, baseUrl }: SidebarDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path);
  const isParentActive = items.some((item) => isActive(baseUrl + item.url));

  return (
    <div className='relative'>
      <SidebarMenuItem>
        <SidebarMenuButton
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full justify-between ${isParentActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent'}`}
        >
          <div className='flex items-center gap-3 px-2'>
            <Icon className='h-4 w-4' />
            <span className='font-medium'>{title}</span>
          </div>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='ml-4 border-l border-border pl-4'>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(baseUrl + item.url)}
                    className={
                      isActive(baseUrl + item.url)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'hover:bg-accent'
                    }
                  >
                    <Link href={baseUrl + item.url} className='flex items-center gap-3 px-2'>
                      <span className='font-medium'>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
