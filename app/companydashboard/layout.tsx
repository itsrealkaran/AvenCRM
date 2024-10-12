import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { LayoutProps } from '@/.next/types/app/layout';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='w-full max-h-screen overflow-hidden  flex'>

        <Sidebar/>
      
      {/* <main className='px-5 py-4 bg-red-500 w-[90%] flex 
      flex-col'> */}
      <div className='w-[83%] bg-[#FAFBFF]'>
        <DashboardNav/>
        {children} 
        </div>
      {/* </main> */}
      
    </div>
  );
};

export default Layout;
