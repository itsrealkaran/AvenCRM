import { Suspense } from 'react';

import EmailPageContent from '@/components/email/EmailPageContent';

function EmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailPageContent />
    </Suspense>
  );
}

export default EmailPage;
