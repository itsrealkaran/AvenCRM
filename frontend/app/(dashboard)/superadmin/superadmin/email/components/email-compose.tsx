'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Paperclip, Send } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export function EmailCompose() {
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [isBulkEmail, setIsBulkEmail] = useState(false);

  const handleSendEmail = () => {
    // Implement email sending logic here
    console.log('Sending email:', { recipients, subject, body, scheduleDate, isBulkEmail });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose New Email</CardTitle>
        <CardDescription>Create and send emails to your clients and team members</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center space-x-2'>
          <Label htmlFor='bulk-email' className='flex items-center space-x-2 cursor-pointer'>
            <Switch id='bulk-email' checked={isBulkEmail} onCheckedChange={setIsBulkEmail} />
            <span>Bulk Email</span>
          </Label>
        </div>
        <Select onValueChange={(value) => setRecipients((prev) => [...prev, value])}>
          <SelectTrigger>
            <SelectValue placeholder='Select recipients' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all-clients'>All Clients</SelectItem>
            <SelectItem value='all-agents'>All Agents</SelectItem>
            <SelectItem value='admins'>Admins</SelectItem>
          </SelectContent>
        </Select>
        <div className='flex flex-wrap gap-2'>
          {recipients.map((recipient, index) => (
            <Badge key={index} variant='secondary'>
              {recipient}
              <button
                className='ml-1'
                onClick={() => setRecipients((prev) => prev.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
        <Input placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea
          placeholder='Email body'
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
        />
        <div className='flex items-center space-x-2'>
          <Button variant='outline'>
            <Paperclip className='mr-2 h-4 w-4' />
            Attach Files
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline'>
                <CalendarIcon className='mr-2 h-4 w-4' />
                {scheduleDate ? format(scheduleDate, 'PPP') : 'Schedule Email'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={scheduleDate}
                onSelect={setScheduleDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSendEmail}>
          {scheduleDate ? (
            <>
              <Clock className='mr-2 h-4 w-4' /> Schedule
            </>
          ) : (
            <>
              <Send className='mr-2 h-4 w-4' /> Send
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
