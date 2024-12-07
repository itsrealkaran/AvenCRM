import { CompanySidebar } from '@/components/company-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <CompanySidebar />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
