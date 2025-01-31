import { Facebook } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ConnectedAccounts() {
  const accounts = [
    { id: 1, name: 'Main Business Page', type: 'Page', status: 'Active' },
    { id: 2, name: 'Ad Account 1', type: 'Ad Account', status: 'Active' },
    { id: 3, name: 'Pixel 1', type: 'Pixel', status: 'Active' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Accounts</CardTitle>
        <CardDescription>
          Manage your connected Facebook accounts, pages, and pixels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {accounts.map((account) => (
            <div
              key={account.id}
              className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
            >
              <div className='flex items-center space-x-4'>
                <Facebook className='w-8 h-8 text-[#4F46E5]' />
                <div>
                  <h3 className='font-medium'>{account.name}</h3>
                  <p className='text-sm text-muted-foreground'>{account.type}</p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    account.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {account.status}
                </span>
                <Button variant='outline' size='sm'>
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
