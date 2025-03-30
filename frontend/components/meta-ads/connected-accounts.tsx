import { ActivityStatus, MetaAdAccount } from '@/types/meta-ads';
import { useMutation } from '@tanstack/react-query';
import { Facebook } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export function ConnectedAccounts({ metaAdAccounts }: { metaAdAccounts: MetaAdAccount[] }) {
  const { mutate: deleteMetaAdAccount } = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/meta-ads/account/${id}`);
      return response.data;
    },
    onSuccess: () => {
      window.location.reload();
    },
  });
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
          {metaAdAccounts.map((account) => (
            <div
              key={account.id}
              className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
            >
              <div className='flex items-center space-x-4'>
                <Facebook className='w-8 h-8 text-[#4F46E5]' />
                <div>
                  <h3 className='font-medium'>{account.name}</h3>
                  <p className='text-sm text-muted-foreground'>{account.email}</p>
                </div>
              </div>
              <div className='flex items-center space-x-2'>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    account.status === ActivityStatus.ACTIVE
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {account.status}
                </span>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-red-800 hover:bg-red-500/50 text-xs bg-red-500/20 rounded-full'
                  onClick={() => deleteMetaAdAccount(account.id)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
