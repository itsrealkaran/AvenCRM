'use client';

import React, { useCallback, useEffect, useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';

interface EmailAccount {
  id: string;
  provider: 'GMAIL' | 'OUTLOOK';
  email: string;
  isActive: boolean;
  updatedAt: string;
}

export default function EmailAccountsSection() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmailAccounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmailAccounts();
  }, [fetchEmailAccounts]);

  const connectAccount = async (provider: 'GMAIL' | 'OUTLOOK') => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/config?provider=${provider}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to get redirect URL');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect email account',
        variant: 'destructive',
      });
    }
  };

  const disconnectAccount = async (accountId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/accounts/${accountId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to disconnect account');
      await fetchEmailAccounts();
      toast({
        title: 'Success',
        description: 'Email account disisActive successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect email account',
        variant: 'destructive',
      });
    }
  };

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
        <Button onClick={() => connectAccount('GMAIL')}>
          <Mail className='mr-2 h-4 w-4' />
          Connect Gmail
        </Button>
        <Button onClick={() => connectAccount('OUTLOOK')} variant={'outline'}>
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
                    {account.isActive ? 'Connected' : 'Disconnected'}
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
                        <AlertDialogAction onClick={() => disconnectAccount(account.id)}>
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
          <h3 className='text-lg font-medium'>No email accounts isActive</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Connect your email account to start sending emails
          </p>
        </div>
      )}
    </div>
  );
}
