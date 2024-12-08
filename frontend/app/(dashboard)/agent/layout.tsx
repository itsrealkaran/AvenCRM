import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import SideNavBar from './components/SideNavBar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SideNavBar />
      <main className='w-full min-w-[80%]'>{children}</main>
    </SidebarProvider>
  );
}
