'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';

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
  recipients: Recipient[];
  successfulSends: number;
  failedSends: number;
  totalRecipients: number;
  createdAt: string;
}

interface Recipient {
  type: 'EXTERNAL' | 'AGENT' | 'ADMIN' | 'CLIENT';
  email: string;
  name?: string;
  variables?: Record<string, string>;
  recipientId?: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

export default function EmailCampaignSection() {
  debugger;
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedRecipientType, setSelectedRecipientType] = useState<
    'AGENT' | 'ADMIN' | 'CLIENT' | 'EXTERNAL'
  >('AGENT');
  const [customRecipient, setCustomRecipient] = useState({ email: '', name: '' });
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('template');
  const [formData, setFormData] = useState({
    title: '',
    templateId: '',
    subject: '',
    content: '',
    scheduledAt: new Date(),
    recipients: [] as Recipient[],
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
      console.log(data.campaigns);
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

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      console.log('agnets', data);
      setAgents(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch agents',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
    fetchAgents();
  }, [fetchCampaigns, fetchTemplates, fetchAgents]);

  // Filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery) return agents;
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [agents, searchQuery]);

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

  const handleRecipientTypeChange = (type: 'AGENT' | 'ADMIN' | 'CLIENT' | 'EXTERNAL') => {
    setSelectedRecipientType(type);
    setCustomRecipient({ email: '', name: '' });
  };

  const addRecipient = (recipient: Recipient) => {
    if (!formData.recipients.some((r) => r.email === recipient.email)) {
      setFormData((prev) => ({
        ...prev,
        recipients: [...prev.recipients, recipient],
      }));
    }
  };

  const removeRecipient = (email: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r.email !== email),
    }));
  };

  const addCustomRecipient = () => {
    if (customRecipient.email && customRecipient.name) {
      addRecipient({
        type: 'EXTERNAL',
        email: customRecipient.email,
        name: customRecipient.name,
      });
      setCustomRecipient({ email: '', name: '' });
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <DialogDescription>
            Create a new email campaign to send to your recipients
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">Template & Content</TabsTrigger>
            <TabsTrigger value="recipients">Recipients</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="template" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Campaign Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Monthly Newsletter"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
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

                <div className="grid gap-2">
                  <Label htmlFor="subject">Email Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Your Monthly Newsletter"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="content">Email Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-[200px]"
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recipients" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <Label>Recipients ({formData.recipients.length})</Label>
                  <span className="text-sm text-muted-foreground">
                    Selected {formData.recipients.length} recipients
                  </span>
                </div>

                <Command className="border rounded-lg">
                  <CommandInput
                    placeholder="Search recipients..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>No recipients found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {filteredAgents.map((agent) => (
                      <CommandItem
                        key={agent.id}
                        onSelect={() => {
                          addRecipient({
                            type: 'AGENT',
                            email: agent.email,
                            name: agent.name,
                            recipientId: agent.id,
                          });
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>{agent.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ({agent.email})
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>

                {formData.recipients.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {formData.recipients.map((recipient) => (
                        <Badge
                          key={recipient.email}
                          className="flex items-center gap-2"
                        >
                          <span>
                            {recipient.name} ({recipient.email})
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0"
                            onClick={() => removeRecipient(recipient.email)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <Label>Schedule Date and Time</Label>
                <div className="flex gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-[240px] justify-start text-left font-normal',
                          !formData.scheduledAt && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.scheduledAt ? (
                          format(formData.scheduledAt, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduledAt}
                        onSelect={(date) =>
                          date && setFormData({ ...formData, scheduledAt: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex gap-2 items-center">
                    <Select
                      value={formData.scheduledAt.getHours().toString().padStart(2, '0')}
                      onValueChange={(value) => {
                        const newDate = new Date(formData.scheduledAt);
                        newDate.setHours(parseInt(value));
                        setFormData({ ...formData, scheduledAt: newDate });
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-2xl">:</span>
                    <Select
                      value={formData.scheduledAt.getMinutes().toString().padStart(2, '0')}
                      onValueChange={(value) => {
                        const newDate = new Date(formData.scheduledAt);
                        newDate.setMinutes(parseInt(value));
                        setFormData({ ...formData, scheduledAt: newDate });
                      }}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue placeholder="MM" />
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
              </div>
            </TabsContent>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Campaign</Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
