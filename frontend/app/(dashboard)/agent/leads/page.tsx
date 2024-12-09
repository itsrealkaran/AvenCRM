import { Metadata } from 'next';

import { LeadsDataTable } from './components/leads-data-table';
import { LeadsTableToolbar } from './components/leads-data-toolbar';

export const metadata: Metadata = {
  title: 'Leads | Agent Dashboard',
  description: 'Manage your leads efficiently',
};

export default function LeadsPage() {
  return (
    <div className='container mx-auto p-10'>
      <h1 className='text-4xl font-bold mb-8'>Leads Management</h1>
      <LeadsTableToolbar />
      <LeadsDataTable />
    </div>
  );
}
