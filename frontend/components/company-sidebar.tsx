'use client'

import {
  Users,
  LayoutDashboard,
  Settings,
  Calendar,
  MessageSquare,
  FileText,
  DollarSign,
  Building2,
  ChartLine,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { SidebarDropdown } from '@/components/ui/sidebar-dropdown'

const companyItems = [
  {
    title: 'Home',
    url: '/company/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Leads',
    icon: Users,
    hasDropdown: true,
    items: [
      { title: 'All Leads', url: '/leads' },
      { title: 'Active Leads', url: '/leads/active' },
      { title: 'Converted', url: '/leads/converted' },
      { title: 'Lost', url: '/leads/lost' },
    ],
  },
  {
    title: 'Sales',
    icon: DollarSign,
    hasDropdown: true,
    items: [
      { title: 'Pipeline', url: '/sales/pipeline' },
      { title: 'Deals', url: '/sales/deals' },
      { title: 'Quotations', url: '/sales/quotations' },
    ],
  },
  {
    title: 'Calendar',
    icon: Calendar,
    hasDropdown: true,
    items: [
      { title: 'Meetings', url: '/calendar/meetings' },
      { title: 'Tasks', url: '/calendar/tasks' },
      { title: 'Reminders', url: '/calendar/reminders' },
    ],
  },
  {
    title: 'Communication',
    icon: MessageSquare,
    hasDropdown: true,
    items: [
      { title: 'Messages', url: '/communication/messages' },
      { title: 'Email', url: '/communication/email' },
      { title: 'Chat', url: '/communication/chat' },
    ],
  },
  {
    title: 'Documents',
    icon: FileText,
    hasDropdown: true,
    items: [
      { title: 'All Documents', url: '/documents' },
      { title: 'Contracts', url: '/documents/contracts' },
      { title: 'Invoices', url: '/documents/invoices' },
    ],
  },
  {
    title: 'Reports',
    icon: ChartLine,
    hasDropdown: true,
    items: [
      { title: 'Sales Reports', url: '/reports/sales' },
      { title: 'Lead Reports', url: '/reports/leads' },
      { title: 'Activity Reports', url: '/reports/activity' },
    ],
  },
  {
    title: 'Settings',
    url: '/company/settings',
    icon: Settings,
  },
]

export function CompanySidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/company/dashboard' && pathname === '/company/dashboard') {
      return true
    }
    return pathname.startsWith(path) && path !== '/company/dashboard'
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Company Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {companyItems.map((item) =>
                item.hasDropdown ? (
                  <SidebarDropdown
                    key={item.title}
                    title={item.title}
                    icon={item.icon}
                    items={item.items}
                    baseUrl="/company"
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
                      <Link href={item.url as string} className="flex items-center gap-3 px-2">
                        <item.icon className="h-4 w-4" />
                        <span className="font-medium">{item.title}</span>
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
  )
}
