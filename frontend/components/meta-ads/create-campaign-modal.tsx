import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { Form } from './create-form-modal';
import { FacebookPreview } from './facebook-preview';
import { SelectFormModal } from './select-form-modal';

interface CreateCampaignModalProps {
  open: boolean;
  onClose: () => void;
  onOpenFormModal: () => void;
  onCreateCampaign: (campaign: Campaign) => void;
  forms: Form[];
}

export type Campaign = {
  name: string;
  type: 'leads' | 'traffic';
  form?: Form;
  budget: string;
  adHeadline: string;
  adDescription: string;
  reach: string;
  status: 'Active' | 'Paused';
  createdAt: string;
};

export function CreateCampaignModal({
  open,
  onClose,
  onOpenFormModal,
  onCreateCampaign,
  forms,
}: CreateCampaignModalProps) {
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<'leads' | 'traffic'>('leads');
  const [selectedForm, setSelectedForm] = useState<Form | undefined>();
  const [budget, setBudget] = useState('');
  const [adHeadline, setAdHeadline] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showSelectFormModal, setShowSelectFormModal] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!campaignName.trim()) newErrors.name = 'Campaign name is required';
    if (!budget.trim()) newErrors.budget = 'Budget is required';
    if (!adHeadline.trim()) newErrors.adHeadline = 'Ad headline is required';
    if (!adDescription.trim()) newErrors.adDescription = 'Ad description is required';
    if (campaignType === 'leads' && !selectedForm) newErrors.form = 'Please select a form';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const newCampaign: Campaign = {
        name: campaignName,
        type: campaignType,
        form: selectedForm,
        budget,
        adHeadline,
        adDescription,
        reach: '0', // Initialize with 0
        status: 'Active',
        createdAt: new Date().toISOString(),
      };
      onCreateCampaign(newCampaign);
      onClose();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-[900px]'>
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className='grid grid-cols-2 gap-6'>
            <div className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Campaign Name</Label>
                <Input
                  id='name'
                  placeholder='Enter campaign name'
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
                {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
              </div>

              <div className='space-y-2'>
                <Label>Campaign Type</Label>
                <Tabs
                  value={campaignType}
                  onValueChange={(value) => setCampaignType(value as 'leads' | 'traffic')}
                >
                  <TabsList className='w-full'>
                    <TabsTrigger value='leads' className='flex-1'>
                      Lead Generation
                    </TabsTrigger>
                    <TabsTrigger value='traffic' className='flex-1'>
                      Traffic
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {campaignType === 'leads' && (
                <div className='space-y-2'>
                  <Label>Form</Label>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setShowSelectFormModal(true)}
                      className='flex-1'
                    >
                      {selectedForm ? 'Change Form' : 'Select Form'}
                    </Button>
                    <Button variant='outline' onClick={onOpenFormModal} className='flex-1'>
                      Create New Form
                    </Button>
                  </div>
                  {selectedForm && (
                    <p className='text-sm text-green-500'>
                      Selected form: {selectedForm.name} ({selectedForm.fields.length} fields)
                    </p>
                  )}
                  {errors.form && <p className='text-sm text-red-500'>{errors.form}</p>}
                </div>
              )}

              <div className='space-y-2'>
                <Label htmlFor='budget'>Budget</Label>
                <Input
                  id='budget'
                  placeholder='Enter budget'
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
                {errors.budget && <p className='text-sm text-red-500'>{errors.budget}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adHeadline'>Ad Headline</Label>
                <Input
                  id='adHeadline'
                  placeholder='Enter ad headline'
                  value={adHeadline}
                  onChange={(e) => setAdHeadline(e.target.value)}
                />
                {errors.adHeadline && <p className='text-sm text-red-500'>{errors.adHeadline}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='adDescription'>Ad Description</Label>
                <Input
                  id='adDescription'
                  placeholder='Enter ad description'
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                />
                {errors.adDescription && (
                  <p className='text-sm text-red-500'>{errors.adDescription}</p>
                )}
              </div>

              <Button className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90' onClick={handleSubmit}>
                Create Campaign
              </Button>
            </div>

            <FacebookPreview headline={adHeadline} description={adDescription} />
          </div>
        </DialogContent>
      </Dialog>

      <SelectFormModal
        open={showSelectFormModal}
        onClose={() => setShowSelectFormModal(false)}
        onSelectForm={(form) => {
          setSelectedForm(form);
          setShowSelectFormModal(false);
        }}
        forms={forms}
      />
    </>
  );
}
