import { useCallback, useEffect, useMemo, useState } from 'react';
import type React from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { WhatsAppAccount, WhatsAppTemplate } from '@/types/whatsapp.types';
import { Plus } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';

import type { AudienceGroup } from './audience-list';
import { CreateAudienceModal } from './create-audience-modal';

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

const SAMPLE_TEMPLATES = [
  {
    id: 'template1',
    name: 'Hello World',
    content:
      'Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.',
  },
];

export function CreateCampaignModal({
  open,
  onClose,
  onCreateCampaign,
  audiences,
  editingCampaign,
  templates,
}: CreateCampaignModalProps) {
  console.log('CreateCampaignModal received templates:', templates);

  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<'TEXT' | 'IMAGE' | 'TEMPLATE'>('TEMPLATE');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [templateParams, setTemplateParams] = useState<{ [key: string]: string }>({});
  const [selectedAudience, setSelectedAudience] = useState<AudienceGroup | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCreateAudienceModalOpen, setIsCreateAudienceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<WhatsAppAccount>();
  const [selectedAccountId, setSelectedAccountId] = useState<{
    phoneNumberId: string;
    phoneNumber: string;
  }>({
    phoneNumberId: accounts?.phoneNumberData[0]?.phoneNumberId || '',
    phoneNumber: accounts?.phoneNumberData[0]?.phoneNumber || '',
  });

  // Ensure audiences is always an array
  const safeAudiences = useMemo(() => audiences || [], [audiences]);

  // Fetch accounts when modal opens
  useEffect(() => {
    if (open) {
      fetchAccounts();
      fetchTemplates();
    }
  }, [open]);

  const fetchAccounts = async () => {
    try {
      const accountsData = await whatsAppService.getAccounts();
      setAccounts(accountsData);

      // Set default account if available
      if (accountsData && !selectedAccountId) {
        setSelectedAccountId(accountsData.id);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp accounts:', error);
      toast.error('Failed to load WhatsApp accounts');
    }
  };

  const fetchTemplates = async () => {
    try {
      // If we have a real API for templates, use it
      // const templatesData = await whatsAppService.getTemplates();
      // setTemplates(templatesData);
      // For now, we're using sample templates
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load message templates');
    }
  };
  const sendMessage = async (campaignData: any) => {
    try {
      console.log('Attempting to save message with data:', campaignData);
      const response = await api.post('/whatsapp/campaigns/saveMessage', {
        phoneNumberId: selectedAccountId.phoneNumberId,
        phoneNumber: selectedAccountId.phoneNumber,
        campaignData: campaignData,
        recipientNumber: campaignData.to,
        message: campaignData.text?.body || campaignData.template?.name,
        wamid: campaignData.wamid,
        sentAt: new Date().toISOString(),
      });
      console.log('Message saved successfully:', response);
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error('Failed to save message');
    }
  };

  useEffect(() => {
    if (editingCampaign) {
      setCampaignName(editingCampaign.name);
      setCampaignType(editingCampaign.type);
      setMessage(editingCampaign.message);
      setImageUrl(editingCampaign.imageUrl || '');
      setSelectedTemplate(templates?.find((t) => t.id === editingCampaign.template?.id) || null);
      setTemplateParams(editingCampaign.templateParams || {});
      setSelectedAudience(editingCampaign.audience);
      setSelectedAccountId({
        phoneNumberId: editingCampaign.accountId || '',
        phoneNumber: editingCampaign.audience.phoneNumbers?.[0] || '',
      });
    } else {
      // Reset form fields but preserve template selection
      setCampaignName('');
      setCampaignType('TEMPLATE');
      setMessage('');
      setImageUrl('');
      // Don't reset template selection
      setTemplateParams({});
      setSelectedAudience(null);
      // Don't reset account ID to preserve the selected account
    }
  }, [editingCampaign, templates]);

  const handleTemplateChange = (value: string) => {
    const template = templates?.find((t) => t.name === value);
    console.log('Selected template:', template);
    setSelectedTemplate(template || null);
    // Reset template params when template changes
    setTemplateParams({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!campaignName.trim()) newErrors.name = 'Campaign name is required';
    if (!selectedAccountId) newErrors.account = 'WhatsApp account is required';
    if (campaignType === 'TEXT' && !message.trim()) newErrors.message = 'Message is required';
    if (campaignType === 'IMAGE' && !imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    if (
      campaignType === 'TEMPLATE' &&
      Object.values(templateParams).some((param) => !param.trim())
    ) {
      newErrors.templateParams = 'All template parameters are required';
    }
    if (!selectedAudience) newErrors.audience = 'Audience is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !selectedTemplate) return;

    setIsLoading(true);

    try {
      let isSuccessFull = true;
      const campaignData: Campaign = {
        id: editingCampaign?.id,
        name: campaignName,
        type: campaignType,
        message: selectedTemplate.components?.[0]?.text || '',
        template: {
          name: selectedTemplate.name,
          id: selectedTemplate.id,
        },
        templateParams: templateParams,
        audience: selectedAudience!,
        audienceId: selectedAudience!.id,
        status: isSuccessFull ? 'Successfull' : 'Failed',
        createdAt: editingCampaign?.createdAt || new Date().toISOString(),
        accountId: selectedAccountId.phoneNumberId,
        scheduledAt: editingCampaign?.scheduledAt || undefined,
      };

      if (campaignType === 'TEMPLATE') {
        // Build the message text from template components
        let messageText = '';
        selectedTemplate.components.forEach((component) => {
          if (component.type === 'BODY') {
            let text = component.text;
            Object.entries(templateParams).forEach(([key, value]) => {
              text = text.replace(`{{${key}}}`, value || '');
            });
            messageText += text + '\n\n';
          }
          if (component.type === 'HEADER') {
            let text = component.text;
            Object.entries(templateParams).forEach(([key, value]) => {
              text = text.replace(`{{${key}}}`, value || '');
            });
            messageText = text + '\n\n' + messageText;
          }
          if (component.type === 'FOOTER') {
            messageText += '\n' + component.text;
          }
        });

        const messageData = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: selectedAudience?.recipients?.[0]?.phoneNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: messageText,
          },
        };

        console.log('Starting to send messages to recipients');
        for (const recipient of selectedAudience?.recipients || []) {
          console.log('Processing recipient:', recipient.phoneNumber);
          messageData.to = recipient.phoneNumber;
          try {
            // @ts-ignore
            const response = await new Promise((resolve, reject) => {
              console.log('Sending message to Facebook API');
              // @ts-ignore
              FB.api(
                `/${selectedAccountId.phoneNumberId}/messages?access_token=${accounts?.accessToken}`,
                'POST',
                messageData,
                (response: any) => {
                  console.log('Facebook API response:', response);
                  if (response.error) {
                    reject(response.error);
                  } else {
                    resolve(response);
                  }
                }
              );
            });

            if (response) {
              console.log('Facebook API call successful, saving message');
              // @ts-ignore
              const wamid = response.messages?.[0]?.id;
              if (wamid) {
                // @ts-ignore
                messageData.wamid = wamid;
                await sendMessage(messageData);
              } else {
                console.error('No message ID received from Facebook API');
                toast.error('Failed to get message ID from Facebook');
              }
            }
          } catch (error) {
            console.error('Error sending message:', error);
            isSuccessFull = false;
            toast.error(`Failed to send message to ${recipient.phoneNumber}`);
          }
        }
        campaignData.status = isSuccessFull ? 'Successfull' : 'Failed';
        await whatsAppService.createCampaign({
          ...campaignData,
          accountId: selectedAccountId.phoneNumberId,
        });

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

  const handleImageSelection = useCallback((selectedImage: string) => {
    setImageUrl(selectedImage);
    setIsImageModalOpen(false);
  }, []);

  const handleCreateAudience = (newAudience: AudienceGroup) => {
    setSelectedAudience(newAudience);
    setIsCreateAudienceModalOpen(false);
  };

  const renderMessageInput = () => {
    switch (campaignType) {
      case 'IMAGE':
        return (
          <div className='space-y-2'>
            <Label htmlFor='imageUrl'>Image</Label>
            <Input
              id='imageUrl'
              placeholder='Enter image URL'
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            {errors.imageUrl && <p className='text-sm text-red-500'>{errors.imageUrl}</p>}
          </div>
        );
      case 'TEMPLATE':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='template'>Template</Label>
              <Select value={selectedTemplate?.name || ''} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Select a template' />
                </SelectTrigger>
                <SelectContent>
                  {templates?.map((template) => (
                    <SelectItem key={template.name} value={template.name}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate && renderTemplateParams()}
            {errors.templateParams && (
              <p className='text-sm text-red-500'>{errors.templateParams}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderTemplateParams = () => {
    if (!selectedTemplate) return null;

    return selectedTemplate.components.map((component, index) => {
      if (component.type === 'BODY') {
        const params = component.example?.body_text_named_params || [];
        return (
          <div key={index} className='space-y-4'>
            {params.map((param: { param_name: string; example: string }) => (
              <div key={param.param_name} className='space-y-2'>
                <Label htmlFor={param.param_name}>{param.param_name}</Label>
                <Input
                  id={param.param_name}
                  placeholder={param.example}
                  value={templateParams[param.param_name] || ''}
                  onChange={(e) =>
                    setTemplateParams({ ...templateParams, [param.param_name]: e.target.value })
                  }
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
            {params.map((param: { param_name: string; example: string }) => (
              <div key={param.param_name} className='space-y-2'>
                <Label htmlFor={param.param_name}>{param.param_name}</Label>
                <Input
                  id={param.param_name}
                  placeholder={param.example}
                  value={templateParams[param.param_name] || ''}
                  onChange={(e) =>
                    setTemplateParams({ ...templateParams, [param.param_name]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        );
      }
      return null;
    });
  };

  const renderMessagePreview = () => {
    if (!selectedTemplate) return null;

    let previewMessage = '';
    selectedTemplate.components.forEach((component) => {
      if (component.type === 'BODY') {
        let text = component.text;
        Object.entries(templateParams).forEach(([key, value]) => {
          text = text.replace(
            `{{${key}}}`,
            value ||
              component.example?.body_text_named_params?.find(
                (p: { param_name: string; example: string }) => p.param_name === key
              )?.example ||
              `{{${key}}}`
          );
        });
        previewMessage += text + '\n\n';
      }
      if (component.type === 'HEADER') {
        let text = component.text;
        Object.entries(templateParams).forEach(([key, value]) => {
          text = text.replace(
            `{{${key}}}`,
            value ||
              component.example?.header_text_named_params?.find(
                (p: { param_name: string; example: string }) => p.param_name === key
              )?.example ||
              `{{${key}}}`
          );
        });
        previewMessage = text + '\n\n' + previewMessage;
      }
      if (component.type === 'FOOTER') {
        previewMessage += '\n' + component.text;
      }
    });

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

        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='campaign-name'>Campaign Name</Label>
              <Input
                id='campaign-name'
                placeholder='Enter campaign name'
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
              {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='account'>WhatsApp Account</Label>
              <Select
                value={selectedAccountId.phoneNumberId}
                onValueChange={(value) => {
                  const selectedAccount = accounts?.phoneNumberData.find(
                    (acc) => acc.phoneNumberId === value
                  );
                  if (selectedAccount) {
                    setSelectedAccountId({
                      phoneNumberId: selectedAccount.phoneNumberId,
                      phoneNumber: selectedAccount.phoneNumber,
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select WhatsApp account' />
                </SelectTrigger>
                <SelectContent>
                  {accounts?.phoneNumberData.map((account: any) => (
                    <SelectItem key={account.phoneNumberId} value={account.phoneNumberId}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account && <p className='text-sm text-red-500'>{errors.account}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='campaign-type'>Campaign Type</Label>
              <Select
                disabled={true}
                value={campaignType}
                onValueChange={(value: 'TEMPLATE') => setCampaignType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select campaign type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='TEMPLATE'>Template Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderMessageInput()}

            <div className='space-y-2'>
              <Label htmlFor='audience'>Audience</Label>
              <div className='flex gap-2'>
                <Select
                  value={selectedAudience?.id || ''}
                  onValueChange={(value) =>
                    setSelectedAudience(safeAudiences.find((a) => a.id === value) || null)
                  }
                >
                  <SelectTrigger className='flex-grow'>
                    <SelectValue placeholder='Select audience' />
                  </SelectTrigger>
                  <SelectContent>
                    {safeAudiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id}>
                        {audience.name} ({audience.recipients?.length || 0} recipients)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  onClick={() => setIsCreateAudienceModalOpen(true)}
                  className='whitespace-nowrap'
                >
                  <Plus className='h-4 w-4 mr-1' />
                  New
                </Button>
              </div>
              {errors.audience && <p className='text-sm text-red-500'>{errors.audience}</p>}
            </div>

            <Button
              className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90'
              onClick={handleSubmit}
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

          <div>{renderMessagePreview()}</div>
        </div>
      </DialogContent>

      <CreateAudienceModal
        open={isCreateAudienceModalOpen}
        onClose={() => setIsCreateAudienceModalOpen(false)}
        onCreateAudience={handleCreateAudience}
      />
    </Dialog>
  );
}

// const ImageSelectionModal = ({
//   handleImageSelection,
// }: {
//   handleImageSelection: (imageData: string) => void;
// }) => {
//   return (
//     <DialogContent className='sm:max-w-[425px]'>
//       <DialogHeader>
//         <DialogTitle>Select Image</DialogTitle>
//         <DialogDescription>
//           Choose an image from your CRM or upload from your device.
//         </DialogDescription>
//       </DialogHeader>
//       <div className='grid gap-4 py-4'>
//         <Button
//           className='bg-[#5932EA] hover:bg-[#5932EA]/90 text-white'
//           onClick={() => {
//             // TODO: Implement CRM image selection
//             console.log('CRM image selection clicked');
//           }}
//         >
//           Select from CRM
//         </Button>
//         <div>
//           <input
//             type='file'
//             id='image-upload'
//             accept='image/*'
//             className='hidden'
//             onChange={(e) => {
//               const file = e.target.files?.[0];
//               if (file) {
//                 const reader = new FileReader();
//                 reader.onload = (event) => {
//                   if (event.target?.result) {
//                     handleImageSelection(event.target.result as string);
//                   }
//                 };
//                 reader.readAsDataURL(file);
//               }
//             }}
//           />
//           <Button
//             className='bg-[#5932EA] hover:bg-[#5932EA]/90 text-white w-full'
//             onClick={() => document.getElementById('image-upload')?.click()}
//           >
//             Upload from Device
//           </Button>
//         </div>
//       </div>
//     </DialogContent>
//   );
// };
