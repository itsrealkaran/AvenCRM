import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import SideNavBar from './components/SideNavBar';
import { TopNavigation } from './components/TopNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SideNavBar />
      <main className='w-full bg-[#f0f5fc] overflow-hidden h-full'>
        <TopNavigation />
        {children}
      </main>
    </SidebarProvider>
  );
}
