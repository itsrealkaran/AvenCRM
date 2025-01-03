'use client';

import React from 'react';
import { EmailAccount } from '@/types/email';
import { Loader2, Mail, Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EmailAccountsSectionProps {
  accounts: EmailAccount[];
  loading: boolean;
  onConnect: (provider: 'GMAIL' | 'OUTLOOK') => Promise<void>;
  onDisconnect: (accountId: string) => Promise<void>;
}

export default function EmailAccountsSection({
  accounts,
  loading,
  onConnect,
  onDisconnect,
}: EmailAccountsSectionProps) {
  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex gap-4'>
        <Button onClick={() => onConnect('GMAIL')}>
          <Mail className='mr-2 h-4 w-4' />
          Connect Gmail
        </Button>
        <Button onClick={() => onConnect('OUTLOOK')} variant={'outline'}>
          <Mail className='mr-2 h-4 w-4' />
          Connect Outlook
        </Button>
      </div>

      {accounts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Synced</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.email}</TableCell>
                <TableCell>{account.provider}</TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? 'default' : 'destructive'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {account.updatedAt ? new Date(account.updatedAt).toLocaleString() : 'Never'}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant='destructive' size='sm'>
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect Email Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to disconnect this email account? This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDisconnect(account.id)}>
                          Disconnect
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className='text-center p-8 border rounded-lg bg-muted'>
          <Mail className='mx-auto h-12 w-12 opacity-50 mb-4' />
          <h3 className='text-lg font-medium'>No Email Accounts Connected</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Connect your email account to start sending emails
          </p>
        </div>
      )}
    </div>
  );
}
