'use client';

import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AdStep } from './create-campaign/ad-step';
import { AdsetStep } from './create-campaign/adset-step';
import { CampaignStep } from './create-campaign/campaign-step';

export default function CreateCampaignForm({
  isOpen,
  onClose,
  adAccountId,
  accessToken,
}: {
  isOpen: boolean;
  onClose: () => void;
  adAccountId: string[] | null;
  accessToken: string;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    campaign: {
      id: '',
      name: '',
      objective: '',
      special_ad_categories: '',
      start_time: '',
    },
    adset: {
      id: '',
      name: '',
      optimizationGoal: '',
      targetAudience: {
        geo_location: {
          countries: [],
          cities: [],
        },
        min_age: 18,
        max_age: 65,
      },
    },
    ad: {
      id: '',
      name: '',
      callToAction: '',
      image: null,
      redirectUrl: '',
    },
  });

  const setCampaignData = async (data: any) => {
    //@ts-ignore
    const response = await FB.api(
      `/act_${adAccountId}/campaigns?access_token=${accessToken}`,
      'POST',
      {
        name: data.name,
        objective: data.objective,
        special_ad_categories: data.special_ad_categories,
        start_time: data.start_time,
      },
      function (response: any) {
        console.log(response, 'response from campaign step');
        setFormData({
          ...formData,
          campaign: {
            ...formData.campaign,
            id: response.id,
          },
        });
      }
    );
  };

  const handleNext = () => {
    if (step < 3) {
      if (
        step === 1 &&
        formData.campaign.name !== '' &&
        formData.campaign.objective !== '' &&
        formData.campaign.special_ad_categories !== '' &&
        formData.campaign.start_time !== ''
      ) {
        setCampaignData(formData.campaign);
      }
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const updateFormData = (section: string, data: any) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section as keyof typeof formData],
        ...data,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[800px] max-h-[80vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Create Facebook Campaign - Step {step} of 3</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4 overflow-y-auto'>
          {step === 1 && (
            <CampaignStep
              data={formData.campaign}
              updateData={(data) => updateFormData('campaign', data)}
            />
          )}
          {step === 2 && (
            <AdsetStep data={formData.adset} updateData={(data) => updateFormData('adset', data)} />
          )}
          {step === 3 && (
            <AdStep data={formData.ad} updateData={(data) => updateFormData('ad', data)} />
          )}
        </form>
        <DialogFooter>
          {step > 1 && (
            <Button type='button' variant='outline' onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {step < 3 ? (
            <Button
              type='button'
              className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type='submit'
              className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
