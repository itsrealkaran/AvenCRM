'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const dummyAccounts = [
  { id: 1, email: 'john@example.com', provider: 'Gmail' },
  { id: 2, email: 'jane@example.com', provider: 'Outlook' },
];

export function EmailAccounts() {
  const [accounts, setAccounts] = useState(dummyAccounts);
  const [newAccount, setNewAccount] = useState({ email: '', provider: '' });

  const handleAddAccount = () => {
    if (newAccount.email && newAccount.provider) {
      setAccounts([...accounts, { id: accounts.length + 1, ...newAccount }]);
      setNewAccount({ email: '', provider: '' });
    }
  };

  const handleRemoveAccount = (id: number) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Connect New Email Account</CardTitle>
          <CardDescription>Add a new email account to send emails from</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              value={newAccount.email}
              onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='provider'>Email Provider</Label>
            <Select onValueChange={(value) => setNewAccount({ ...newAccount, provider: value })}>
              <SelectTrigger>
                <SelectValue placeholder='Select provider' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Gmail'>Gmail</SelectItem>
                <SelectItem value='Outlook'>Outlook</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddAccount}>Connect Account</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Connected Email Accounts</CardTitle>
          <CardDescription>Manage your connected email accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email Address</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.email}</TableCell>
                  <TableCell>{account.provider}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveAccount(account.id)}
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
