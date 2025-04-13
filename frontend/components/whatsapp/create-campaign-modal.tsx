import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { WhatsAppAccount, WhatsAppTemplate } from '@/types/whatsapp.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { api } from '@/lib/api';

import type { AudienceGroup } from './audience-list';
import { CreateAudienceModal } from './create-audience-modal';
import { RegisterNumberModal } from './register-number';

// Types
interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCampaign: (campaign: Campaign) => void;
  audiences?: AudienceGroup[];
  editingCampaign?: Campaign | null;
  templates?: WhatsAppTemplate[];
}

export type Campaign = {
  id?: string;
  name: string;
  type: 'TEXT' | 'IMAGE' | 'TEMPLATE';
  message: string;
  imageUrl?: string;
  template?: {
    name: string;
    id: string;
  };
  templateParams?: { [key: string]: string };
  audience: AudienceGroup;
  audienceId: string;
  status: 'Successfull' | 'Failed';
  createdAt: string;
  accountId?: string;
  scheduledAt?: Date;
};

interface TemplateParam {
  param_name: string;
  example: string;
}

// Form Schema
const campaignFormSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  accountId: z.string().min(1, 'WhatsApp account is required'),
  type: z.enum(['TEXT', 'IMAGE', 'TEMPLATE']),
  message: z.string().optional(),
  imageUrl: z.string().optional(),
  templateId: z.string().optional(),
  templateParams: z.record(z.string()).optional(),
  audienceId: z.string().min(1, 'Audience is required'),
});

type CampaignFormData = z.infer<typeof campaignFormSchema>;

// Message Preview Component
const MessagePreview = React.memo(
  ({ template, params }: { template: WhatsAppTemplate | null; params: Record<string, string> }) => {
    const previewMessage = useMemo(() => {
      if (!template) return '';

      let message = '';
      template.components.forEach((component) => {
        if (component.type === 'BODY') {
          let text = component.text;
          Object.entries(params).forEach(([key, value]) => {
            text = text.replace(
              `{{${key}}}`,
              value ||
                component.example?.body_text_named_params?.find(
                  (p: { param_name: string; example: string }) => p.param_name === key
                )?.example ||
                `{{${key}}}`
            );
          });
          message += text + '\n\n';
        }
        if (component.type === 'HEADER') {
          let text = component.text;
          Object.entries(params).forEach(([key, value]) => {
            text = text.replace(
              `{{${key}}}`,
              value ||
                component.example?.header_text_named_params?.find(
                  (p: { param_name: string; example: string }) => p.param_name === key
                )?.example ||
                `{{${key}}}`
            );
          });
          message = text + '\n\n' + message;
        }
        if (component.type === 'FOOTER') {
          message += '\n' + component.text;
        }
      });
      return message;
    }, [template, params]);

    if (!template) return null;

    return (
      <Card className='bg-gray-50'>
        <CardContent className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Message Preview</h3>
          <div className='bg-white rounded-lg p-4 shadow-sm'>
            <div className='flex items-center mb-4'>
              <FaWhatsapp className='text-[#25D366] w-6 h-6 mr-2' />
              <span className='font-medium'>WhatsApp Business</span>
            </div>
            <div className='bg-[#DCF8C6] rounded-lg p-3 inline-block max-w-full'>
              <p className='text-sm break-words whitespace-pre-wrap'>{previewMessage}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

MessagePreview.displayName = 'MessagePreview';

// Template Parameters Component
const TemplateParameters = React.memo(
  ({
    template,
    params,
    onChange,
  }: {
    template: WhatsAppTemplate;
    params: Record<string, string>;
    onChange: (params: Record<string, string>) => void;
  }) => {
    const handleParamChange = useCallback(
      (key: string, value: string) => {
        onChange({ ...params, [key]: value });
      },
      [params, onChange]
    );

    return (
      <div className='space-y-4'>
        {template.components.map((component, index) => {
          if (component.type === 'BODY') {
            const params = component.example?.body_text_named_params || [];
            return (
              <div key={index} className='space-y-4'>
                {params.map((param: TemplateParam) => (
                  <div key={param.param_name} className='space-y-2'>
                    <Label htmlFor={param.param_name}>{param.param_name}</Label>
                    <Input
                      id={param.param_name}
                      placeholder={param.example}
                      value={params[param.param_name] || ''}
                      onChange={(e) => handleParamChange(param.param_name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            );
          }
          if (component.type === 'HEADER') {
            const params = component.example?.header_text_named_params || [];
            return (
              <div key={index} className='space-y-4'>
                {params.map((param: TemplateParam) => (
                  <div key={param.param_name} className='space-y-2'>
                    <Label htmlFor={param.param_name}>{param.param_name}</Label>
                    <Input
                      id={param.param_name}
                      placeholder={param.example}
                      value={params[param.param_name] || ''}
                      onChange={(e) => handleParamChange(param.param_name, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  }
);

TemplateParameters.displayName = 'TemplateParameters';

export function CreateCampaignModal({
  open,
  onClose,
  onCreateCampaign,
  audiences = [],
  editingCampaign,
  templates = [],
}: CreateCampaignModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<WhatsAppAccount>();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isCreateAudienceModalOpen, setIsCreateAudienceModalOpen] = useState(false);
  const [isRegisteringModalOpen, setIsRegisteringModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const form = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      type: 'TEMPLATE',
      templateParams: {},
    },
  });

  // Fetch accounts when modal opens
  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  // Initialize form with editing campaign data
  useEffect(() => {
    if (!open) return;

    if (editingCampaign) {
      const initialValues = {
        name: editingCampaign.name,
        type: editingCampaign.type,
        accountId: editingCampaign.accountId || '',
        audienceId: editingCampaign.audienceId,
        templateId: editingCampaign.template?.id,
        templateParams: editingCampaign.templateParams || {},
      };

      form.reset(initialValues);
      const template = templates.find((t) => t.id === editingCampaign.template?.id);
      setSelectedTemplate(template || null);
      setSelectedAccountId(editingCampaign.accountId || '');
    } else {
      form.reset({
        type: 'TEMPLATE',
        templateParams: {},
      });
      setSelectedTemplate(null);
      setSelectedAccountId('');
    }
  }, [open, editingCampaign, templates, form]);

  const fetchAccounts = async () => {
    try {
      const accountsData = await whatsAppService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error fetching WhatsApp accounts:', error);
      toast.error('Failed to load WhatsApp accounts');
    }
  };

  // Handle account selection
  const handleAccountSelect = useCallback(
    (value: string) => {
      setSelectedAccountId(value);
      const account = accounts?.phoneNumbers.find((acc) => acc.phoneNumberId === value);
      if (account) {
        if (!account.isRegistered) {
          setIsRegisteringModalOpen(true);
        } else {
          form.setValue('accountId', value);
        }
      }
    },
    [accounts?.phoneNumbers, form]
  );

  const handleTemplateChange = useCallback(
    (value: string) => {
      const template = templates.find((t) => t.name === value);
      setSelectedTemplate(template || null);
      form.setValue('templateParams', {});
    },
    [templates, form]
  );

  const handleCreateAudience = useCallback(
    (newAudience: AudienceGroup) => {
      form.setValue('audienceId', newAudience.id);
      setIsCreateAudienceModalOpen(false);
    },
    [form]
  );

  const onSubmit = async (data: CampaignFormData) => {
    if (!selectedTemplate || !data.accountId) return;

    setIsLoading(true);

    try {
      const campaignData: Omit<Campaign, 'accountId'> & { accountId: string } = {
        id: editingCampaign?.id,
        name: data.name,
        type: data.type,
        message: selectedTemplate.components?.[0]?.text || '',
        template: {
          name: selectedTemplate.name,
          id: selectedTemplate.id,
        },
        templateParams: data.templateParams,
        audience: audiences.find((a) => a.id === data.audienceId)!,
        audienceId: data.audienceId,
        status: 'Successfull',
        createdAt: editingCampaign?.createdAt || new Date().toISOString(),
        accountId: data.accountId,
        scheduledAt: editingCampaign?.scheduledAt,
      };

      if (data.type === 'TEMPLATE') {
        let isSuccessFull = true;
        const messageData = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          type: 'text',
          text: {
            preview_url: true,
            body: selectedTemplate.components?.[0]?.text || '',
          },
        };

        const selectedAudience = audiences.find((a) => a.id === data.audienceId);
        if (!selectedAudience?.recipients) {
          throw new Error('No recipients found in selected audience');
        }

        for (const recipient of selectedAudience.recipients) {
          try {
            const messageWithRecipient = {
              ...messageData,
              to: recipient.phoneNumber,
            };

            const response = await new Promise((resolve, reject) => {
              if (typeof window !== 'undefined' && (window as any).FB) {
                (window as any).FB.api(
                  `/${data.accountId}/messages?access_token=${accounts?.accessToken}`,
                  'POST',
                  messageWithRecipient,
                  (response: any) => {
                    if (response.error) {
                      reject(response.error);
                    } else {
                      resolve(response);
                    }
                  }
                );
              } else {
                reject(new Error('Facebook API not available'));
              }
            });

            if (response) {
              const wamid = (response as any).messages?.[0]?.id;
              if (wamid) {
                await api.post('/whatsapp/campaigns/saveMessage', {
                  phoneNumberId: data.accountId,
                  phoneNumber: recipient.phoneNumber,
                  campaignData: { ...messageWithRecipient, wamid },
                  recipientNumber: recipient.phoneNumber,
                  message: messageWithRecipient.text.body,
                  wamid,
                  sentAt: new Date().toISOString(),
                });
              }
            }
          } catch (error) {
            console.error('Error sending message:', error);
            isSuccessFull = false;
            toast.error(`Failed to send message to ${recipient.phoneNumber}`);
          }
        }

        campaignData.status = isSuccessFull ? 'Successfull' : 'Failed';
        await whatsAppService.createCampaign(campaignData);
        onClose();
        return;
      }

      onCreateCampaign(campaignData);
      onClose();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error(editingCampaign ? 'Failed to update campaign' : 'Failed to create campaign');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
          <DialogDescription>
            {editingCampaign
              ? 'Update your WhatsApp campaign details'
              : 'Create a new WhatsApp campaign to reach your audience'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className='grid grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Campaign Name</Label>
              <Input id='name' placeholder='Enter campaign name' {...form.register('name')} />
              {form.formState.errors.name && (
                <p className='text-sm text-red-500'>{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='accountId'>WhatsApp Account</Label>
              <Select value={selectedAccountId} onValueChange={handleAccountSelect}>
                <SelectTrigger>
                  <SelectValue placeholder='Select WhatsApp account' />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.phoneNumbers.map((account) => (
                    <SelectItem key={account.phoneNumberId} value={account.phoneNumberId}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.accountId && (
                <p className='text-sm text-red-500'>{form.formState.errors.accountId.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='type'>Campaign Type</Label>
              <Select
                disabled={true}
                value={form.watch('type')}
                onValueChange={(value: 'TEMPLATE') => form.setValue('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select campaign type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='TEMPLATE'>Template Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.watch('type') === 'TEMPLATE' && (
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='template'>Template</Label>
                  <Select value={selectedTemplate?.name || ''} onValueChange={handleTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a template' />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedTemplate && (
                  <TemplateParameters
                    template={selectedTemplate}
                    params={form.watch('templateParams') || {}}
                    onChange={(params) => form.setValue('templateParams', params)}
                  />
                )}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='audienceId'>Audience</Label>
              <div className='flex gap-2'>
                <Select
                  value={form.watch('audienceId')}
                  onValueChange={(value) => form.setValue('audienceId', value)}
                >
                  <SelectTrigger className='flex-grow'>
                    <SelectValue placeholder='Select audience' />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id}>
                        {audience.name} ({audience.recipients?.length || 0} recipients)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setIsCreateAudienceModalOpen(true)}
                  className='whitespace-nowrap'
                >
                  <Plus className='h-4 w-4 mr-1' />
                  New
                </Button>
              </div>
              {form.formState.errors.audienceId && (
                <p className='text-sm text-red-500'>{form.formState.errors.audienceId.message}</p>
              )}
            </div>

            <Button
              type='submit'
              className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90'
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className='animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-current rounded-full'></span>
                  {editingCampaign ? 'Updating...' : 'Creating...'}
                </>
              ) : editingCampaign ? (
                'Update Campaign'
              ) : (
                'Create Campaign'
              )}
            </Button>
          </div>

          <div>
            <MessagePreview
              template={selectedTemplate}
              params={form.watch('templateParams') || {}}
            />
          </div>
        </form>
      </DialogContent>

      <CreateAudienceModal
        open={isCreateAudienceModalOpen}
        onClose={() => setIsCreateAudienceModalOpen(false)}
        onCreateAudience={handleCreateAudience}
      />

      <RegisterNumberModal
        open={isRegisteringModalOpen}
        onClose={() => setIsRegisteringModalOpen(false)}
        accessToken={accounts?.accessToken || ''}
        phoneNumberId={form.watch('accountId')}
        wabaId={accounts?.wabaid || ''}
        phoneNumbers={accounts?.phoneNumbers || []}
      />
    </Dialog>
  );
}
