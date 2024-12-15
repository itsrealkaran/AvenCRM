'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface ComposeEmailProps {
  open: boolean;
  onClose: () => void;
}

export function ComposeEmail({ open, onClose }: ComposeEmailProps) {
  const [loading, setLoading] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    recipients: '',
    template: '',
    scheduledFor: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...emailData,
          recipients: emailData.recipients.split(',').map((email) => email.trim()),
        }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast.success('Email sent successfully'); // Add this line to show a success toast notifc
      onClose();
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>Create and schedule your email campaign</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label htmlFor='recipients'>Recipients</Label>
            <Input
              id='recipients'
              placeholder='Enter email addresses (comma-separated)'
              value={emailData.recipients}
              onChange={(e) => setEmailData({ ...emailData, recipients: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor='template'>Template</Label>
            <Select onValueChange={(value) => setEmailData({ ...emailData, template: value })}>
              <SelectTrigger>
                <SelectValue placeholder='Select a template' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='template1'>Template 1</SelectItem>
                <SelectItem value='template2'>Template 2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor='subject'>Subject</Label>
            <Input
              id='subject'
              value={emailData.subject}
              onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor='body'>Message</Label>
            <Textarea
              id='body'
              rows={8}
              value={emailData.body}
              onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor='scheduledFor'>Schedule For</Label>
            <Input
              id='scheduledFor'
              type='datetime-local'
              value={emailData.scheduledFor}
              onChange={(e) => setEmailData({ ...emailData, scheduledFor: e.target.value })}
            />
          </div>

          <div className='flex justify-end gap-4'>
            <Button type='button' variant='outline' onClick={onClose}>
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
