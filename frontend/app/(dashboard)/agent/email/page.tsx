import React from 'react';

import { EmailDashboard } from '@/components/email/EmailDashboard';
import { EmailProvider } from '@/components/email/EmailProvider';

function EmailPage() {
  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-6'>Email Management</h1>

      <div className='grid gap-6'>
        <EmailProvider />
        <EmailDashboard />
      </div>
    </div>
  );
}

export default EmailPage;
