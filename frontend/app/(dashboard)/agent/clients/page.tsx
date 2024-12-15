import React from 'react';

import { ClientManagement } from './components/client-manangment';

function Clients() {
  return (
    <section className='container mx-auto p-6 h-full overflow-y-auto'>
      <ClientManagement />
    </section>
  );
}

export default Clients;
