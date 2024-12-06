'use client';

import * as React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import { columns } from './columns';
import { SheetProvider } from '@/components/providers/sheet-provider';
import { DataTableForm } from '@/components/data-table/data-table-form';
import { useQuery } from '@tanstack/react-query';
import * as z from 'zod';

// Sample data - replace with your API call
const sampleContacts = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Inc',
    status: 'active',
  },
  // Add more sample data...
];

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  status: z.enum(['active', 'inactive']),
});

const formFields = [
  {
    name: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'John Doe',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'john@example.com',
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: '+1234567890',
  },
  {
    name: 'company',
    label: 'Company',
    type: 'text',
    placeholder: 'Acme Inc',
  },
  {
    name: 'status',
    label: 'Status',
    type: 'text',
    placeholder: 'active',
  },
];

export default function ContactsPage() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  // Replace with your API call
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return sampleContacts;
    },
  });

  const handleCreateContact = async (data: z.infer<typeof contactSchema>) => {
    // Replace with your API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Creating contact:', data);
  };

  return (
    <div className='container mx-auto py-10'>
      <div className='mb-6 flex items-center justify-between'>
        <h1 className='text-3xl font-bold'>Contacts</h1>
        <Button onClick={() => setIsSheetOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Add Contact
        </Button>
      </div>

      <DataTable columns={columns} data={contacts || []} isLoading={isLoading} />

      <SheetProvider
        title='Create Contact'
        description='Add a new contact to your CRM'
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      >
        <DataTableForm
          schema={contactSchema}
          fields={formFields}
          onSubmit={handleCreateContact}
          queryKey='contacts'
          onSuccess={() => setIsSheetOpen(false)}
        />
      </SheetProvider>
    </div>
  );
}
