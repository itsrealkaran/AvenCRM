import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

import SideNavBar from './components/SideNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SideNavBar />
      <main className='w-full min-w-[80%]'>{children}</main>
    </SidebarProvider>
  );
}
