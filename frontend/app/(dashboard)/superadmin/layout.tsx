import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import SideNavBar from './components/SideNavBar';
import { TopNavigation } from './components/TopNavigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SideNavBar />
      <main className='w-full min-w-[80%] bg-[#f0f5fc] overflow-hidden h-screen'>
        <TopNavigation />
        {children}
      </main>
    </SidebarProvider>
  );
}
