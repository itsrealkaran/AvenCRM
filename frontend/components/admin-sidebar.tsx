'use client';

import { Users, LayoutDashboard, Settings, Building2, ShieldCheck, BarChart3 } from 'lucide-react';
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
import { SidebarDropdown } from '@/components/ui/sidebar-dropdown';

const adminItems = [
  {
    title: 'Dashboard',
    url: '/admin/',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    icon: Users,
    hasDropdown: true,
    items: [
      { title: 'All Users', url: '/users' },
      { title: 'Roles', url: '/users/roles' },
      { title: 'Permissions', url: '/users/permissions' },
    ],
  },
  {
    title: 'Companies',
    icon: Building2,
    hasDropdown: true,
    items: [
      { title: 'All Companies', url: '/companies' },
      { title: 'Pending Approval', url: '/companies/pending' },
      { title: 'Subscriptions', url: '/companies/subscriptions' },
    ],
  },
  {
    title: 'Email Campaigns',
    icon: BarChart3,
    url: '/admin/email',
  },
  {
    title: 'Security',
    icon: ShieldCheck,
    hasDropdown: true,
    items: [
      { title: 'Audit Logs', url: '/security/audit' },
      { title: 'Security Settings', url: '/security/settings' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    hasDropdown: true,
    items: [
      { title: 'Profile Settings', url: '/admin/settings' },
      { title: 'Database Settings', url: '/admin/database-settings' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin/dashboard' && pathname === '/admin/dashboard') {
      return true;
    }
    return pathname.startsWith(path) && path !== '/admin/dashboard';
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs uppercase tracking-wider text-muted-foreground/70'>
            Admin Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) =>
                item.hasDropdown ? (
                  <SidebarDropdown
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                    items={item.items}
                    baseUrl='/admin'
                  />
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url as string)}
                      className={
                        isActive(item.url as string)
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'hover:bg-accent'
                      }
                    >
                      <Link href={item.url as string} className='flex items-center gap-3 px-2'>
                        <item.icon className='h-4 w-4' />
                        <span className='font-medium'>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
