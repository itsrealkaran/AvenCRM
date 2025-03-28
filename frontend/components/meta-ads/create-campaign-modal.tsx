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
  pageId,
}: {
  isOpen: boolean;
  onClose: () => void;
  adAccountId: string[] | null;
  accessToken: string;
  pageId: string;
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const defaultValues = {
    campaign: {
      id: '',
      name: '',
      objective: '',
      special_ad_categories: '',
      special_ad_category_country: '',
      start_time: '',
      formId: '',
      pageId: pageId,
    },
    adset: {
      id: '',
      name: '',
      daily_budget: '',
      end_time: '',
      targetAudience: {
        geo_locations: {
          cities: [],
        },
        facebook_positions: ['feed'],
        age_min: 18,
        age_max: 65,
      },
    },
    ad: {
      id: '',
      adCreativeId: '',
      name: '',
      message: '',
      image: null,
      redirectUrl: '',
    },
  };
  const [formData, setFormData] = useState(defaultValues);

  const setCampaignData = async (data: any) => {
    //@ts-ignore
    await FB.api(
      `/act_${adAccountId}/campaigns?access_token=${accessToken}`,
      'POST',
      {
        name: data.name,
        objective: data.objective,
        special_ad_categories: data.special_ad_categories,
        special_ad_category_country: data.special_ad_category_country,
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

  const setAdsetData = async (data: any) => {
    //@ts-ignore
    await FB.api(
      `/act_${adAccountId}/adsets?access_token=${accessToken}`,
      'POST',
      {
        name: data.name,
        daily_budget: data.daily_budget,
        targeting: data.targetAudience,
        end_time: data.end_time,
        billing_event: 'IMPRESSIONS',
        optimization_goal: 'IMPRESSIONS',
        bid_amount: data.daily_budget,
        campaign_id: formData.campaign.id,
      },
      function (response: any) {
        console.log(formData, 'form data from adset step');
        console.log(response, 'response from adset step');
        setFormData({
          ...formData,
          adset: {
            ...formData.adset,
            id: response.id,
          },
        });
      }
    );
  };

  const setAdCreative = async (data: any) => {
    try {
      // Create a Promise for the first API call
      const adCreativeResponse = await new Promise((resolve, reject) => {
        //@ts-ignore
        FB.api(
          `/act_${adAccountId}/adcreatives?access_token=${accessToken}`,
          'POST',
          {
            name: data.name,
            image_url: data.image,
            object_story_spec: {
              link_data: {
                ...(formData.campaign.formId && {
                  call_to_action: {
                    type: 'LEARN_MORE',
                    lead_gen_form_id: formData.campaign.formId,
                  },
                }),
                link: data.redirectUrl,
                message: data.message,
              },
              page_id: pageId,
            },
          },
          function (response: any) {
            if (response && !response.error) {
              console.log(response, 'response from ad creative step');
              setFormData({
                ...formData,
                ad: {
                  ...formData.ad,
                  adCreativeId: response.id,
                },
              });
              resolve(response.id);
            } else {
              reject(response?.error || 'Failed to create ad creative');
            }
          }
        );
      });

      // Only proceed with the second API call after the first one succeeds
      await new Promise((resolve, reject) => {
        //@ts-ignore
        FB.api(
          `/act_${adAccountId}/ads?access_token=${accessToken}`,
          'POST',
          {
            name: formData.ad.name,
            adset_id: formData.adset.id,
            creative: {
              creative_id: adCreativeResponse, // Use the ID from the first response
            },
            status: 'ACTIVE',
          },
          function (response: any) {
            if (response && !response.error) {
              console.log(response, 'response from ad step');
              resolve(response);
            } else {
              reject(response?.error || 'Failed to create ad');
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in setAdCreative:', error);
      throw error;
    }
  };

  const handleNext = () => {
    if (step < 3) {
      if (
        step === 1 &&
        formData.campaign.name !== '' &&
        formData.campaign.objective !== '' &&
        formData.campaign.special_ad_categories !== '' &&
        formData.campaign.special_ad_category_country !== '' &&
        formData.campaign.start_time !== ''
      ) {
        setCampaignData(formData.campaign);
      } else if (step === 2 && formData.adset.name !== '' && formData.adset.daily_budget !== '') {
        setAdsetData(formData.adset);
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
      if (
        formData.ad.name !== '' &&
        formData.ad.message !== '' &&
        formData.ad.image !== null &&
        formData.ad.redirectUrl !== ''
      ) {
        setAdCreative(formData.ad);
      }
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
              accessToken={accessToken}
            />
          )}
          {step === 2 && (
            <AdsetStep
              data={formData.adset}
              updateData={(data) => updateFormData('adset', data)}
              accessToken={accessToken}
            />
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
