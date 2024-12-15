import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import SideNavBar from './components/SideNavBar';
import { TopNavbar } from './components/TopNavbar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className='h-screen w-screen'>
      <SideNavBar />
      <main className='w-full h-screen overflow-hidden bg-[#F6F9FE]'>
        <TopNavbar />
        <div className='w-[97%] h-[87vh] rounded-lg bg-white m-auto mt-4'>{children}</div>
      </main>
    </SidebarProvider>
  );
}