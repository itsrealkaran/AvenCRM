'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Loader2, Mail, Plus, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

interface EmailCampaign {
  id: string;
  title: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED';
  scheduledAt: string;
  recipientCount: number;
  sentCount: number;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
}

export default function EmailCampaignSection() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    templateId: '',
    subject: '',
    content: '',
    scheduledAt: new Date(),
    recipients: [] as { email: string; name?: string; type: string }[],
  });

  const fetchCampaigns = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/campaigns`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      console.log(data);
      setCampaigns(data.campaigns);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/templates`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      console.log(data);
      setTemplates(data.templates);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch email templates',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [fetchCampaigns, fetchTemplates]);

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateId,
        subject: template.subject,
        content: template.content,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/email/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          scheduledAt: formData.scheduledAt.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to create campaign');

      await fetchCampaigns();
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: 'Success',
        description: 'Campaign created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create campaign',
        variant: 'destructive',
      });
    }
  };

  const cancelCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/email/campaigns/${campaignId}/cancel`,
        {
          method: 'POST',
        }
      );
      if (!response.ok) throw new Error('Failed to cancel campaign');

      await fetchCampaigns();
      toast({
        title: 'Success',
        description: 'Campaign cancelled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel campaign',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      templateId: '',
      subject: '',
      content: '',
      scheduledAt: new Date(),
      recipients: [],
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'SENDING':
        return 'default';
      case 'SCHEDULED':
        return 'secondary';
      default:
        return 'outline';
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
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogTrigger asChild>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[725px]'>
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign to send to your recipients
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid w-full gap-4'>
              <div className='grid w-full gap-2'>
                <Label htmlFor='title'>Campaign Title</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder='Monthly Newsletter'
                  required
                />
              </div>

              <div className='grid w-full gap-2'>
                <Label htmlFor='template'>Email Template</Label>
                <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select a template' />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid w-full gap-2'>
                <Label htmlFor='subject'>Email Subject</Label>
                <Input
                  id='subject'
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder='Your Monthly Newsletter'
                  required
                />
              </div>

              <div className='grid w-full gap-2'>
                <Label htmlFor='content'>Email Content</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className='min-h-[200px]'
                  required
                />
              </div>

              <div className='grid w-full gap-2'>
                <Label>Schedule Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formData.scheduledAt && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className='mr-2 h-4 w-4' />
                      {formData.scheduledAt ? (
                        format(formData.scheduledAt, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={formData.scheduledAt}
                      onSelect={(date) => date && setFormData({ ...formData, scheduledAt: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='flex justify-end gap-4'>
              <Button type='button' variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>Create Campaign</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className='font-medium'>{campaign.title}</div>
                  <div className='text-sm text-muted-foreground'>
                    Created {new Date(campaign.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(campaign.status)}>{campaign.status}</Badge>
                </TableCell>
                <TableCell>{new Date(campaign.scheduledAt).toLocaleString()}</TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 mr-2' />
                    {campaign.recipientCount}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='space-y-2'>
                    <Progress value={(campaign.sentCount / campaign.recipientCount) * 100} />
                    <div className='text-xs text-muted-foreground'>
                      {campaign.sentCount} of {campaign.recipientCount} sent
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {campaign.status === 'SCHEDULED' && (
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => cancelCampaign(campaign.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {campaigns.length === 0 && (
        <div className='text-center p-8 border rounded-lg bg-muted'>
          <Mail className='mx-auto h-12 w-12 opacity-50 mb-4' />
          <h3 className='text-lg font-medium'>No email campaigns</h3>
          <p className='text-sm text-muted-foreground mt-2'>
            Create your first email campaign to get started
          </p>
        </div>
      )}
    </div>
  );
}
