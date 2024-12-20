import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { TopNavbar } from '../agent/components/TopNavbar';
import SideNavBar from './components/SideNavbar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SideNavBar />
      <main className='w-full h-screen overflow-hidden bg-[#F6F9FE]'>
        <TopNavbar />
        {children}
      </main>
    </SidebarProvider>
  );
}
