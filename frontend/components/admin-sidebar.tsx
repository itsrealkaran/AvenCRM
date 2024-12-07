'use client';

import { Users, LayoutDashboard, Settings, Building2, ShieldCheck, BarChart3, Calendar, MailCheck } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Image from 'next/image';

const adminItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Calendar',
    icon: Calendar,
    url: '/admin/calendar',
  },
  {
    title: 'Companies',
    icon: Building2,
    url: '/admin/companies',
  },
  {
    title: 'Email',
    icon: MailCheck,
    url: '/admin/email',
  },
  {
    title: 'Crash Reports',
    icon: ShieldCheck,
    url: '/admin/crash-reports',
  },
  {
    title: 'Settings',
    icon: Settings,
    url: '/admin/settings',
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (!pathname) return false;
    
    // Remove trailing slash from pathname for consistent comparison
    const currentPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    
    // Special case for root admin path
    if (path === '/admin' && (currentPath === '/admin' || currentPath === '/admin/')) {
      return true;
    }
    
    // Remove trailing slash from path for consistent comparison
    const normalizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    // Check if current path matches exactly
    return currentPath === normalizedPath;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="h-full">
          <Image
            src="/logo.png"
            width={250}
            height={100}
            alt="Logo"
            className="mb-2 lg:mb-10 rounded-md"
            priority
          />
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Admin Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title} className="h-10">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={
                      isActive(item.url)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'hover:bg-accent'
                    }
                    size="lg"
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-2">
                      <item.icon className="h-4 w-4" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
