'use client';

import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { toast } from '@/hooks/use-toast';

type AdData = {
  name: string;
  message: string;
  image: File | null;
  redirectUrl: string;
  callToAction: string;
};

export function AdStep({
  data,
  updateData,
  adAccountId,
  accessToken,
  formData,
  pageId,
  currency,
}: {
  data: AdData;
  updateData: (data: Partial<AdData>) => void;
  adAccountId: string;
  accessToken: string;
  formData: any;
  pageId: string;
  currency: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewIFrame, setPreviewIFrame] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (data.image) {
      const creative = {
        ...(data.name ? { name: data.name } : {}),
        image_url: data.image,
        ...(data.redirectUrl ? { link: data.redirectUrl } : {}),
        ...(data.message ? { message: data.message } : {}),
        object_story_spec: {
          link_data: {
            picture: data.image,
            ...(!formData.campaign.formId &&
              data.callToAction && {
                call_to_action: {
                  type: data.callToAction,
                },
              }),
            ...(formData.campaign.formId && {
              call_to_action: {
                ...(data.callToAction && { type: data.callToAction }),
                value: {
                  lead_gen_form_id: formData.campaign.formId,
                },
              },
            }),
            link: data.redirectUrl,
            message: data.message,
          },
          page_id: pageId,
        },
      };

      //@ts-ignore
      FB.api(
        `/act_${adAccountId}/generatepreviews?access_token=${accessToken}&ad_format=MOBILE_FEED_STANDARD&creative=${JSON.stringify(creative)}`,
        'GET',
        (response: any) => {
          if (response && !response.error) {
            setPreviewIFrame(response.data[0].body);
          } else {
            toast({
              title: response.error.error_user_title || 'Error creating ad',
              description: response.error.error_user_msg || response.error.message,
            });
          }
        }
      );
    }
  }, [data]);

  if (!currency) {
    return (
      //make a modal with the title "No currency selected" and the message "Please select a currency"
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Something went wrong</DialogTitle>
          </DialogHeader>
          <DialogDescription>Try reloading the page</DialogDescription>
          <DialogFooter>
            <Button
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log(file, 'file');
      const response = await api.post(
        '/meta-ads/upload-image',
        { image: file },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log(response);
      updateData({ image: response.data.imageUrl.url });
      setPreviewUrl(response.data.imageUrl.url);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card className='flex'>
      <CardContent className='pt-6 flex-1 w-[50%]'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='adName'>Ad Name</Label>
            <Input
              id='adName'
              name='name'
              value={data.name}
              onChange={handleChange}
              placeholder='Enter ad name'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='message'>Description</Label>
            <Input
              id='message'
              name='message'
              value={data.message}
              onChange={handleChange}
              placeholder='Enter description'
            />
          </div>

          {/* make a dropdown for the call to action with the options OPEN_LINK, WHATSAPP_MESSAGE, MAKE_AN_APPOINTMENT, LEARN_MORE */}
          <div className='grid gap-2'>
            <Label htmlFor='callToAction'>Call to Action</Label>
            <Select
              name='callToAction'
              value={data.callToAction}
              onValueChange={(value) => updateData({ callToAction: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select a call to action' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='OPEN_LINK'>OPEN_LINK</SelectItem>
                <SelectItem value='WHATSAPP_MESSAGE'>WHATSAPP_MESSAGE</SelectItem>
                <SelectItem value='MAKE_AN_APPOINTMENT'>MAKE_AN_APPOINTMENT</SelectItem>
                <SelectItem value='LEARN_MORE'>LEARN_MORE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label>Upload Image</Label>
            <div
              className='border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors'
              onClick={triggerFileInput}
            >
              <input
                type='file'
                ref={fileInputRef}
                className='hidden'
                accept='image/*'
                onChange={handleImageChange}
              />

              {previewUrl ? (
                <div className='space-y-2 w-full'>
                  <div className='relative aspect-video w-full overflow-hidden rounded-md'>
                    <img
                      src={previewUrl || '/placeholder.svg'}
                      alt='Ad preview'
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <p className='text-sm text-center text-muted-foreground'>Click to change image</p>
                </div>
              ) : (
                <div className='flex flex-col items-center space-y-2'>
                  <div className='p-2 rounded-full bg-muted'>
                    <ImageIcon className='h-6 w-6 text-muted-foreground' />
                  </div>
                  <div className='flex flex-col items-center'>
                    <p className='text-sm font-medium'>Click to upload image</p>
                    <p className='text-xs text-muted-foreground'>SVG, PNG, JPG or GIF (max. 5MB)</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='redirectUrl'>Redirect URL</Label>
            <Input
              id='redirectUrl'
              name='redirectUrl'
              type='url'
              value={data.redirectUrl}
              onChange={handleChange}
              placeholder='https://example.com'
            />
          </div>
        </div>
      </CardContent>
      <CardContent className='pt-6 w-[50%]'>
        {previewIFrame ? (
          <div className='overflow-x-auto' dangerouslySetInnerHTML={{ __html: previewIFrame }} />
        ) : (
          <div className='flex items-center justify-center h-full'>
            <p className='text-muted-foreground'>No preview available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
