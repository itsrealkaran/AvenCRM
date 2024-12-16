'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';

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

interface Email {
  id: string;
  subject: string;
  recipients: number;
  status: string;
  scheduledFor?: string;
  sentAt?: string;
  openRate?: number;
  clickRate?: number;
}

interface EmailListProps {
  type: 'inbox' | 'sent' | 'scheduled';
}

export function EmailList({ type }: EmailListProps) {
  const [emails, setEmails] = React.useState<Email[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchEmails();
  }, [type]);

  const fetchEmails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/${type}`);
      const data = await response.json();
      setEmails(data);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='space-y-4'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Recipients</TableHead>
            <TableHead>Status</TableHead>
            {type === 'scheduled' && <TableHead>Scheduled For</TableHead>}
            {type === 'sent' && <TableHead>Sent At</TableHead>}
            {type === 'sent' && (
              <>
                <TableHead>Open Rate</TableHead>
                <TableHead>Click Rate</TableHead>
              </>
            )}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => (
            <TableRow key={email.id}>
              <TableCell>{email.subject}</TableCell>
              <TableCell>{email.recipients}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    email.status === 'SENT'
                      ? 'default'
                      : email.status === 'FAILED'
                        ? 'destructive'
                        : 'default'
                  }
                >
                  {email.status}
                </Badge>
              </TableCell>
              {type === 'scheduled' && (
                <TableCell>
                  {email.scheduledFor &&
                    formatDistanceToNow(new Date(email.scheduledFor), {
                      addSuffix: true,
                    })}
                </TableCell>
              )}
              {type === 'sent' && (
                <>
                  <TableCell>
                    {email.sentAt &&
                      formatDistanceToNow(new Date(email.sentAt), {
                        addSuffix: true,
                      })}
                  </TableCell>
                  <TableCell>{email.openRate}%</TableCell>
                  <TableCell>{email.clickRate}%</TableCell>
                </>
              )}
              <TableCell>
                <Button variant='ghost' size='sm'>
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
