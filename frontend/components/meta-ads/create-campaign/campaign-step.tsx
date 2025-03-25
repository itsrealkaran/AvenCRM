'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
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
import { useDebounce } from '@/hooks/useDebounce';

type CampaignData = {
  name: string;
  objective: string;
  special_ad_categories: string;
  special_ad_category_country: string;
  start_time: string;
};

interface Location {
  key: string;
  name: string;
  type: string;
  country_code: string;
}

export function CampaignStep({
  data,
  updateData,
  accessToken,
}: {
  data: CampaignData;
  updateData: (data: Partial<CampaignData>) => void;
  accessToken: string;
}) {
  const [countryInput, setCountryInput] = useState('');
  const debouncedSearch = useDebounce(countryInput, 300);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const searchLocations = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setLocations([]);
        return;
      }

      setIsLoading(true);
      try {
        //@ts-ignore
        FB.api(
          `/search?q=${debouncedSearch}&type=adgeolocation&location_types=["country"]&access_token=${accessToken}`,
          'GET',
          {},
          function (response: any) {
            console.log(response, 'search response from campaign step');
            setLocations(response.data || []);
          }
        );
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchLocations();
  }, [debouncedSearch]);

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
                <SelectItem value='OUTCOME_TRAFFIC'>Brand Awareness</SelectItem>
                <SelectItem value='OUTCOME_LEADS'>Lead Generation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='special_ad_categories'>Ad Category</Label>
            <Select
              value={data.special_ad_categories}
              onValueChange={(value) => handleSelectChange('special_ad_categories', value)}
            >
              <SelectTrigger id='special_ad_categories'>
                <SelectValue placeholder='Select ad category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='NONE'>None</SelectItem>
                <SelectItem value='EMPLOYMENT'>Employment</SelectItem>
                <SelectItem value='HOUSING'>Housing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='special_ad_category_country'>Ad Category Country</Label>
            <div className='relative'>
              <div className='flex gap-2'>
                <div className='relative flex-1'>
                  <Input
                    id='special_ad_category_country'
                    value={countryInput}
                    onChange={(e) => {
                      setCountryInput(e.target.value);
                      setIsOpen(true);
                    }}
                    placeholder='Search for countries'
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && locations.length > 0) {
                        e.preventDefault();
                        const firstLocation = locations[0];
                        updateData({ special_ad_category_country: firstLocation.country_code });
                        setCountryInput('');
                        setIsOpen(false);
                      }
                    }}
                  />
                  {isLoading && (
                    <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                      <Loader2 className='h-4 w-4 animate-spin text-gray-500' />
                    </div>
                  )}
                </div>
              </div>

              {isOpen && (countryInput || isLoading) && (
                <div className='absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto'>
                  {locations.length > 0 ? (
                    <ul className='py-1'>
                      {locations.map((location) => (
                        <li
                          key={location.key}
                          className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                          onClick={() => {
                            updateData({ special_ad_category_country: location.country_code });
                            setCountryInput('');
                            setIsOpen(false);
                          }}
                        >
                          <div className='font-medium'>{location.name}</div>
                          <div className='text-xs text-gray-500'>
                            {location.country_code && `${location.country_code}`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : !isLoading && countryInput ? (
                    <div className='px-4 py-2 text-sm text-gray-500'>No countries found</div>
                  ) : null}
                </div>
              )}

              {data.special_ad_category_country && (
                <div className='flex flex-wrap gap-2 mt-2'>
                  <Badge variant='secondary' className='flex items-center gap-1'>
                    {locations.find((loc) => loc.country_code === data.special_ad_category_country)
                      ?.name || data.special_ad_category_country}
                    <X
                      className='h-3 w-3 cursor-pointer'
                      onClick={() => updateData({ special_ad_category_country: '' })}
                    />
                  </Badge>
                </div>
              )}
            </div>
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
