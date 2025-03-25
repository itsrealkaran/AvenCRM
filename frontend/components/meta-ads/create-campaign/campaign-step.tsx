'use client';

import type React from 'react';

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

type CampaignData = {
  name: string;
  objective: string;
  start_time: string;
};

export function CampaignStep({
  data,
  updateData,
}: {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Campaign Name</Label>
            <Input
              id='name'
              name='name'
              value={data.name}
              onChange={handleChange}
              placeholder='Enter campaign name'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='objective'>Objective</Label>
            <Select
              value={data.objective}
              onValueChange={(value) => handleSelectChange('objective', value)}
            >
              <SelectTrigger id='objective'>
                <SelectValue placeholder='Select objective' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='OUTCOME_AWARENESS'>Brand Awareness</SelectItem>
                <SelectItem value='OUTCOME_LEADS'>Lead Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='startTime'>Start Time</Label>
            <Input
              id='start_time'
              name='start_time'
              type='datetime-local'
              value={data.start_time}
              onChange={handleChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
