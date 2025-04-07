'use client';

import { useEffect, useState } from 'react';

import Contact from '@/components/page-builder/contact-view';
import Dashboard from '@/components/page-builder/dashboard-view';
import DocumentDownload from '@/components/page-builder/document-download-view';
import LocationSearch from '@/components/page-builder/location-search-view';
import PortfolioPage from '@/components/page-builder/portfolio-view';
import UpdateContact from '@/components/page-builder/update/contact/page';
import UpdateDocumentDownload from '@/components/page-builder/update/document-download/page';
import UpdateLocationSearch from '@/components/page-builder/update/location-search/page';
import SetupForm from '@/components/page-builder/update/portfolio/page';

export default function PageBuilder() {
  const [currentView, setCurrentView] = useState('dashboard');

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className='h-full'>
      {currentView === 'dashboard' && <Dashboard navigateTo={navigateTo} />}
      {currentView === 'portfolio' && <PortfolioPage navigateTo={navigateTo} />}
      {currentView === 'location-search' && <LocationSearch navigateTo={navigateTo} />}
      {currentView === 'document-download' && <DocumentDownload navigateTo={navigateTo} />}
      {currentView === 'contact' && <Contact navigateTo={navigateTo} />}
    </div>
  );
}
