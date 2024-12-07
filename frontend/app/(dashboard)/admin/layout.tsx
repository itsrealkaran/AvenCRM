import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import SideNavBar from './components/SideNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className='w-full flex items-center justify-center'>
      <SideNavBar current={'Admin'} />
      {children}
    </main>
  );
}

/***
 * 
 * <SidebarProvider>
      <AdminSidebar />
      <main className='w-full'>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
 */
