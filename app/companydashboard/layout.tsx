import React from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardNav from '@/components/dashboard/DashboardNav';

const Layout: React.FC = ({ children }:any) => {
  return (
    <div className="container flex">

        <Sidebar/>
      
      <main className='px-5 py-4 bg-[#FAFBFF] w-full flex 
      flex-col'>
        <DashboardNav/>
        {children} 
      </main>
      
    </div>
  );
};

export default Layout;
