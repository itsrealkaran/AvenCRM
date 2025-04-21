'use client';

import { useState } from 'react';

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
  const [currentPageId, setCurrentPageId] = useState<string | undefined>(undefined);

  const navigateTo = (view: string, pageId?: string) => {
    console.log(`Navigating to ${view} with pageId:`, pageId);
    setCurrentView(view);
    setCurrentPageId(pageId);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'portfolio':
        return <PortfolioPage navigateTo={navigateTo} pageId={currentPageId} />;
      case 'location-search':
        return <LocationSearch navigateTo={navigateTo} pageId={currentPageId} />;
      case 'document-download':
        return <DocumentDownload navigateTo={navigateTo} pageId={currentPageId} />;
      case 'contact':
        return <Contact navigateTo={navigateTo} pageId={currentPageId} />;
      case 'dashboard':
      default:
        return <Dashboard navigateTo={navigateTo} />;
    }
  };

  return <div className='min-h-screen'>{renderView()}</div>;
}
