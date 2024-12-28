'use client';

import { useState } from 'react';
import { Search, Star, Trash2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const dummyEmails = [
  { id: 1, from: 'John Doe', subject: 'New Property Listing', date: '2023-06-01', read: false },
  { id: 2, from: 'Jane Smith', subject: 'Meeting Reminder', date: '2023-05-31', read: true },
  { id: 3, from: 'Bob Johnson', subject: 'Contract Update', date: '2023-05-30', read: false },
];

export function EmailInbox() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<number[]>([]);

  const toggleEmailSelection = (id: number) => {
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((emailId) => emailId !== id) : [...prev, id]
    );
  };

  const filteredEmails = dummyEmails.filter(
    (email) =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className='space-y-4'>
      <div className='flex space-x-2'>
        <Input
          placeholder='Search emails'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='max-w-sm'
        />
        <Button variant='outline'>
          <Search className='mr-2 h-4 w-4' />
          Search
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[50px]'></TableHead>
            <TableHead>From</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className='w-[100px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmails.map((email) => (
            <TableRow key={email.id} className={email.read ? '' : 'font-medium'}>
              <TableCell>
                <Checkbox
                  checked={selectedEmails.includes(email.id)}
                  onCheckedChange={() => toggleEmailSelection(email.id)}
                />
              </TableCell>
              <TableCell>
                <div className='flex items-center space-x-2'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${email.from}`}
                    />
                    <AvatarFallback>{email.from[0]}</AvatarFallback>
                  </Avatar>
                  <span>{email.from}</span>
                </div>
              </TableCell>
              <TableCell>{email.subject}</TableCell>
              <TableCell>{email.date}</TableCell>
              <TableCell>
                <div className='flex space-x-2'>
                  <Button variant='ghost' size='icon'>
                    <Star className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='icon'>
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
