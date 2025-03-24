'use client';

import type React from 'react';
import { useRef, useState } from 'react';
import { ImageIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AdData = {
  name: string;
  callToAction: string;
  image: File | null;
  redirectUrl: string;
};

export function AdStep({
  data,
  updateData,
}: {
  data: AdData;
  updateData: (data: Partial<AdData>) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateData({ image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className='pt-6'>
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
            <Label htmlFor='callToAction'>Call To Action</Label>
            <Select
              value={data.callToAction}
              onValueChange={(value) => handleSelectChange('callToAction', value)}
            >
              <SelectTrigger id='callToAction'>
                <SelectValue placeholder='Select call to action' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='learn_more'>Learn More</SelectItem>
                <SelectItem value='sign_up'>Sign Up</SelectItem>
                <SelectItem value='shop_now'>Shop Now</SelectItem>
                <SelectItem value='book_now'>Book Now</SelectItem>
                <SelectItem value='contact_us'>Contact Us</SelectItem>
                <SelectItem value='download'>Download</SelectItem>
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
    </Card>
  );
}
