import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

import { TopNavbar } from '../agent/components/TopNavbar';
import SideNavBar from './components/SideNavbar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
      <main>
        {children}
      </main>
  );
}
