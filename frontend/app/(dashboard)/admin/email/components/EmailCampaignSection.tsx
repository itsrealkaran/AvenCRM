'use client';

import React, { useEffect, useState } from 'react';
import { EmailCampaign, EmailRecipient, EmailTemplate } from '@/types/email';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Loader2, Mail, Plus, Users, X } from 'lucide-react';

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

import {
  cancelEmailCampaign,
  createEmailCampaign,
  fetchEmailCampaigns,
  fetchEmailRecipients,
  fetchEmailTemplates,
} from '../api';

export default function EmailCampaignSection() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    templateId: '',
    subject: '',
    content: '',
    scheduledAt: new Date(),
    recipientIds: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [campaignsData, templatesData, recipientsData] = await Promise.all([
        fetchEmailCampaigns(),
        fetchEmailTemplates(),
        fetchEmailRecipients(),
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
      setRecipients(recipientsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
      await createEmailCampaign({
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        recipientIds: formData.recipientIds,
        templateId: formData.templateId || undefined,
        scheduledAt: formData.scheduledAt.toISOString(),
      });

      await loadData();
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

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      await cancelEmailCampaign(campaignId);
      await loadData();
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
      recipientIds: [],
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

  const addRecipient = (recipientId: string) => {
    if (!formData.recipientIds.includes(recipientId)) {
      setFormData((prev) => ({
        ...prev,
        recipientIds: [...prev.recipientIds, recipientId],
      }));
    }
  };

  const removeRecipient = (recipientId: string) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.filter((id) => id !== recipientId),
    }));
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Create Campaign
          </Button>
        </DialogTrigger>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>
              Create a new email campaign to send to your recipients
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='grid gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='title'>Campaign Title</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder='Monthly Newsletter'
                  required
                />
              </div>

              <div className='grid gap-2'>
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

              <div className='grid gap-2'>
                <Label htmlFor='subject'>Email Subject</Label>
                <Input
                  id='subject'
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder='Your Monthly Newsletter'
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='content'>Email Content</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className='min-h-[200px]'
                  required
                />
              </div>

              <div className='grid gap-2'>
                <Label>Schedule Date and Time</Label>
                <div className='flex gap-2'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-[240px] justify-start text-left font-normal',
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
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = formData.scheduledAt;
                            const newDate = new Date(date);
                            newDate.setHours(currentTime.getHours());
                            newDate.setMinutes(currentTime.getMinutes());
                            setFormData({ ...formData, scheduledAt: newDate });
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-[140px] justify-start text-left font-normal',
                          !formData.scheduledAt && 'text-muted-foreground'
                        )}
                      >
                        <Clock className='mr-2 h-4 w-4' />
                        {formData.scheduledAt ? (
                          format(formData.scheduledAt, 'HH:mm')
                        ) : (
                          <span>Pick time</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0'>
                      <div className='p-4 space-y-2'>
                        <div className='flex gap-2'>
                          <Select
                            value={formData.scheduledAt.getHours().toString().padStart(2, '0')}
                            onValueChange={(value) => {
                              const newDate = new Date(formData.scheduledAt);
                              newDate.setHours(parseInt(value));
                              setFormData({ ...formData, scheduledAt: newDate });
                            }}
                          >
                            <SelectTrigger className='w-[70px]'>
                              <SelectValue placeholder='HH' />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 24 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className='text-2xl'>:</span>
                          <Select
                            value={formData.scheduledAt.getMinutes().toString().padStart(2, '0')}
                            onValueChange={(value) => {
                              const newDate = new Date(formData.scheduledAt);
                              newDate.setMinutes(parseInt(value));
                              setFormData({ ...formData, scheduledAt: newDate });
                            }}
                          >
                            <SelectTrigger className='w-[70px]'>
                              <SelectValue placeholder='MM' />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 60 }, (_, i) => (
                                <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                                  {i.toString().padStart(2, '0')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className='grid gap-2'>
                <Label>Recipients</Label>
                <Select onValueChange={(value) => addRecipient(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder='Select recipients' />
                  </SelectTrigger>
                  <SelectContent>
                    {recipients.map((recipient) => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name} ({recipient.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {formData.recipientIds.length > 0 && (
                  <div className='border rounded-lg p-4 space-y-2'>
                    <Label>Selected Recipients</Label>
                    <div className='flex flex-wrap gap-2'>
                      {formData.recipientIds.map((id) => {
                        const recipient = recipients.find((r) => r.id === id);
                        return (
                          recipient && (
                            <Badge key={id} className='flex items-center gap-2'>
                              <span>
                                {recipient.name} ({recipient.email})
                              </span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='h-4 w-4 p-0'
                                onClick={() => removeRecipient(id)}
                              >
                                <X className='h-3 w-3' />
                              </Button>
                            </Badge>
                          )
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex justify-end gap-4'>
              <Button type='button' variant='outline' onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' disabled={formData.recipientIds.length === 0}>
                Create Campaign
              </Button>
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
                <TableCell>
                  {campaign.scheduledAt ? new Date(campaign.scheduledAt).toLocaleString() : 'N/A'}
                </TableCell>
                <TableCell>
                  <div className='flex items-center'>
                    <Users className='h-4 w-4 mr-2' />
                    {campaign.recipientCount}
                  </div>
                </TableCell>
                <TableCell>
                  <div className='space-y-2'>
                    <Progress
                      value={
                        campaign.recipientCount > 0
                          ? (campaign.sentCount / campaign.recipientCount) * 100
                          : 0
                      }
                    />
                    <div className='text-xs text-muted-foreground'>
                      {campaign.sentCount} of {campaign.recipientCount} sent
                      {campaign.failedCount > 0 && ` (${campaign.failedCount} failed)`}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {campaign.status === 'SCHEDULED' && (
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => handleCancelCampaign(campaign.id)}
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
