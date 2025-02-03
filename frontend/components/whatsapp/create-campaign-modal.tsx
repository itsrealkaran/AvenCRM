import { useCallback, useEffect, useState } from 'react';
import type React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

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

import type { AudienceGroup } from './audience-list';
import { CreateAudienceModal } from './create-audience-modal';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onCreateCampaign: (campaign: Campaign) => void;
  onCreateAudience: ((audience: AudienceGroup) => AudienceGroup) | null; // Updated prop type
  audiences?: AudienceGroup[];
  editingCampaign?: Campaign | null;
}

export type Campaign = {
  id?: string;
  name: string;
  type: 'text' | 'image' | 'template';
  message: string;
  imageUrl?: string;
  templateId?: string;
  templateParams?: { [key: string]: string };
  audience: AudienceGroup;
  status: 'Active' | 'Paused';
  createdAt: string;
};

const SAMPLE_TEMPLATES = [
  {
    id: 'template1',
    name: 'Welcome Message',
    content: "Welcome, {{1}}! We're glad to have you on board.",
  },
  {
    id: 'template2',
    name: 'Order Confirmation',
    content: 'Your order #{{1}} has been confirmed. Total: {{2}}',
  },
];

export function CreateCampaignModal({
  open,
  onClose,
  onCreateCampaign,
  onCreateAudience,
  audiences = [],
  editingCampaign,
}: CreateCampaignModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<'text' | 'image' | 'template'>('text');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(SAMPLE_TEMPLATES[0]);
  const [templateParams, setTemplateParams] = useState<{ [key: string]: string }>({});
  const [selectedAudience, setSelectedAudience] = useState<AudienceGroup | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCreateAudienceModalOpen, setIsCreateAudienceModalOpen] = useState(false);

  useEffect(() => {
    if (editingCampaign) {
      setCampaignName(editingCampaign.name);
      setCampaignType(editingCampaign.type);
      setMessage(editingCampaign.message);
      setImageUrl(editingCampaign.imageUrl || '');
      setSelectedTemplate(
        SAMPLE_TEMPLATES.find((t) => t.id === editingCampaign.templateId) || SAMPLE_TEMPLATES[0]
      );
      setTemplateParams(editingCampaign.templateParams || {});
      setSelectedAudience(editingCampaign.audience);
    } else {
      // Reset form fields
      setCampaignName('');
      setCampaignType('text');
      setMessage('');
      setImageUrl('');
      setSelectedTemplate(SAMPLE_TEMPLATES[0]);
      setTemplateParams({});
      setSelectedAudience(null);
    }
  }, [editingCampaign]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!campaignName.trim()) newErrors.name = 'Campaign name is required';
    if (campaignType === 'text' && !message.trim()) newErrors.message = 'Message is required';
    if (campaignType === 'image' && !imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    if (
      campaignType === 'template' &&
      Object.values(templateParams).some((param) => !param.trim())
    ) {
      newErrors.templateParams = 'All template parameters are required';
    }
    if (!selectedAudience) newErrors.audience = 'Audience is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const campaignData: Campaign = {
        id: editingCampaign?.id,
        name: campaignName,
        type: campaignType,
        message: campaignType === 'template' ? selectedTemplate.content : message,
        imageUrl: campaignType === 'image' ? imageUrl : undefined,
        templateId: campaignType === 'template' ? selectedTemplate.id : undefined,
        templateParams: campaignType === 'template' ? templateParams : undefined,
        audience: selectedAudience!,
        status: editingCampaign?.status || 'Active',
        createdAt: editingCampaign?.createdAt || new Date().toISOString(),
      };
      onCreateCampaign(campaignData);
      onClose();
    }
  };

  const handleImageSelection = useCallback((selectedImage: string) => {
    setImageUrl(selectedImage);
    setIsImageModalOpen(false);
  }, []);

  const handleCreateAudience = (newAudience: AudienceGroup) => {
    const createdAudience = onCreateAudience!(newAudience);
    setSelectedAudience(createdAudience);
    setIsCreateAudienceModalOpen(false);
  };

  const renderMessageInput = () => {
    switch (campaignType) {
      case 'text':
        return (
          <div className='space-y-2'>
            <Label htmlFor='message'>Message</Label>
            <Textarea
              id='message'
              placeholder='Enter your campaign message'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            {errors.message && <p className='text-sm text-red-500'>{errors.message}</p>}
          </div>
        );
      case 'image':
        return (
          <div className='space-y-2'>
            <Label htmlFor='imageUrl'>Image</Label>
            <div className='flex space-x-2'>
              <Input
                id='imageUrl'
                placeholder='Enter image URL'
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogTrigger asChild>
                  <Button variant='outline'>Select Image</Button>
                </DialogTrigger>
                <ImageSelectionModal handleImageSelection={handleImageSelection} />
              </Dialog>
            </div>
            {errors.imageUrl && <p className='text-sm text-red-500'>{errors.imageUrl}</p>}
            <Label htmlFor='imageCaption'>Image Caption (optional)</Label>
            <Input
              id='imageCaption'
              placeholder='Enter image caption'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        );
      case 'template':
        return (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='template'>Template</Label>
              <Select
                value={selectedTemplate.id}
                onValueChange={(value) =>
                  setSelectedTemplate(
                    SAMPLE_TEMPLATES.find((t) => t.id === value) || SAMPLE_TEMPLATES[0]
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a template' />
                </SelectTrigger>
                <SelectContent>
                  {SAMPLE_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate.content.match(/{{(\d+)}}/g)?.map((param, index) => (
              <div key={index} className='space-y-2'>
                <Label htmlFor={`param${index + 1}`}>Parameter {index + 1}</Label>
                <Input
                  id={`param${index + 1}`}
                  placeholder={`Enter value for ${param}`}
                  value={templateParams[`${index + 1}`] || ''}
                  onChange={(e) =>
                    setTemplateParams({ ...templateParams, [`${index + 1}`]: e.target.value })
                  }
                />
              </div>
            ))}
            {errors.templateParams && (
              <p className='text-sm text-red-500'>{errors.templateParams}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const renderMessagePreview = () => {
    let previewContent: React.ReactNode;

    switch (campaignType) {
      case 'text':
        previewContent = (
          <p className='text-sm break-words'>
            {message || 'Your message preview will appear here'}
          </p>
        );
        break;
      case 'image':
        previewContent = (
          <div className='space-y-2'>
            <img
              src={imageUrl || '/placeholder.svg'}
              alt='Preview'
              className='max-w-full h-auto rounded'
            />
            {message && <p className='text-sm break-words'>{message}</p>}
          </div>
        );
        break;
      case 'template':
        let previewMessage = selectedTemplate.content;
        Object.entries(templateParams).forEach(([key, value]) => {
          previewMessage = previewMessage.replace(`{{${key}}}`, value || `{{${key}}}`);
        });
        previewContent = <p className='text-sm break-words'>{previewMessage}</p>;
        break;
    }

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
              {previewContent}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[900px]'>
        <DialogHeader>
          <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create Campaign'}</DialogTitle>
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
              <Label htmlFor='campaign-type'>Campaign Type</Label>
              <Select
                value={campaignType}
                onValueChange={(value: 'text' | 'image' | 'template') => setCampaignType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select campaign type' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='text'>Text Message</SelectItem>
                  <SelectItem value='image'>Image Message</SelectItem>
                  <SelectItem value='template'>Template Message</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderMessageInput()}

            <div className='space-y-2'>
              <Label htmlFor='audience'>Audience</Label>
              <div className='flex items-center space-x-2'>
                <Select
                  value={selectedAudience?.id}
                  onValueChange={(value) =>
                    setSelectedAudience(audiences.find((a) => a.id === value) || null)
                  }
                >
                  <SelectTrigger className='flex-grow'>
                    <SelectValue placeholder='Select an audience group' />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences.map((audience) => (
                      <SelectItem key={audience.id} value={audience.id}>
                        {audience.name} ({audience.phoneNumbers.length} contacts)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant='outline' onClick={() => setIsCreateAudienceModalOpen(true)}>
                  Create New
                </Button>
              </div>
              {errors.audience && <p className='text-sm text-red-500'>{errors.audience}</p>}
            </div>

            <Button className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90' onClick={handleSubmit}>
              {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
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

const ImageSelectionModal = ({
  handleImageSelection,
}: {
  handleImageSelection: (imageData: string) => void;
}) => {
  return (
    <DialogContent className='sm:max-w-[425px]'>
      <DialogHeader>
        <DialogTitle>Select Image</DialogTitle>
        <DialogDescription>
          Choose an image from your CRM or upload from your device.
        </DialogDescription>
      </DialogHeader>
      <div className='grid gap-4 py-4'>
        <Button
          className='bg-[#5932EA] hover:bg-[#5932EA]/90 text-white'
          onClick={() => {
            // TODO: Implement CRM image selection
            console.log('CRM image selection clicked');
          }}
        >
          Select from CRM
        </Button>
        <div>
          <input
            type='file'
            id='image-upload'
            accept='image/*'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    handleImageSelection(event.target.result as string);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <Button
            className='bg-[#5932EA] hover:bg-[#5932EA]/90 text-white w-full'
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            Upload from Device
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};
