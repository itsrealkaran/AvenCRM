'use client';

import type React from 'react';
import { useState } from 'react';
import { X } from 'lucide-react';

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

type AdsetData = {
  name: string;
  optimizationGoal: string;
  targetAudience: {
    geo_location: {
      countries: string[];
      cities: string[];
    };
    min_age: number;
    max_age: number;
  };
};

export function AdsetStep({
  data,
  updateData,
}: {
  data: AdsetData;
  updateData: (data: Partial<AdsetData>) => void;
}) {
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({
      targetAudience: {
        ...data.targetAudience,
        [name]: Number.parseInt(value) || 0,
      },
    });
  };

  const addCountry = () => {
    if (
      countryInput.trim() &&
      !data.targetAudience.geo_location.countries.includes(countryInput.trim())
    ) {
      updateData({
        targetAudience: {
          ...data.targetAudience,
          geo_location: {
            ...data.targetAudience.geo_location,
            countries: [...data.targetAudience.geo_location.countries, countryInput.trim()],
          },
        },
      });
      setCountryInput('');
    }
  };

  const removeCountry = (country: string) => {
    updateData({
      targetAudience: {
        ...data.targetAudience,
        geo_location: {
          ...data.targetAudience.geo_location,
          countries: data.targetAudience.geo_location.countries.filter((c) => c !== country),
        },
      },
    });
  };

  const addCity = () => {
    if (cityInput.trim() && !data.targetAudience.geo_location.cities.includes(cityInput.trim())) {
      updateData({
        targetAudience: {
          ...data.targetAudience,
          geo_location: {
            ...data.targetAudience.geo_location,
            cities: [...data.targetAudience.geo_location.cities, cityInput.trim()],
          },
        },
      });
      setCityInput('');
    }
  };

  const removeCity = (city: string) => {
    updateData({
      targetAudience: {
        ...data.targetAudience,
        geo_location: {
          ...data.targetAudience.geo_location,
          cities: data.targetAudience.geo_location.cities.filter((c) => c !== city),
        },
      },
    });
  };

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='adsetName'>Adset Name (Demographics)</Label>
            <Input
              id='adsetName'
              name='name'
              value={data.name}
              onChange={handleChange}
              placeholder='Enter adset name'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='optimizationGoal'>Optimization Goal</Label>
            <Select
              value={data.optimizationGoal}
              onValueChange={(value) => handleSelectChange('optimizationGoal', value)}
            >
              <SelectTrigger id='optimizationGoal'>
                <SelectValue placeholder='Select optimization goal' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='lead_generation'>Lead Generation</SelectItem>
                <SelectItem value='impressions'>Impressions</SelectItem>
                <SelectItem value='link_clicks'>Link Clicks</SelectItem>
                <SelectItem value='conversions'>Conversions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Target Audience</h3>

            <div className='space-y-2'>
              <Label htmlFor='countries'>Countries</Label>
              <div className='flex gap-2'>
                <Input
                  id='countries'
                  value={countryInput}
                  onChange={(e) => setCountryInput(e.target.value)}
                  placeholder='Enter country'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCountry();
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={addCountry}
                  className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                >
                  Add
                </Button>
              </div>
              <div className='flex flex-wrap gap-2 mt-2'>
                {data.targetAudience.geo_location.countries.map((country, index) => (
                  <Badge key={index} variant='secondary' className='flex items-center gap-1'>
                    {country}
                    <X className='h-3 w-3 cursor-pointer' onClick={() => removeCountry(country)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='cities'>Cities</Label>
              <div className='flex gap-2'>
                <Input
                  id='cities'
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  placeholder='Enter city'
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCity();
                    }
                  }}
                />
                <Button
                  type='button'
                  variant='outline'
                  onClick={addCity}
                  className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                >
                  Add
                </Button>
              </div>
              <div className='flex flex-wrap gap-2 mt-2'>
                {data.targetAudience.geo_location.cities.map((city, index) => (
                  <Badge key={index} variant='secondary' className='flex items-center gap-1'>
                    {city}
                    <X className='h-3 w-3 cursor-pointer' onClick={() => removeCity(city)} />
                  </Badge>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='min_age'>Minimum Age</Label>
                <Input
                  id='min_age'
                  name='min_age'
                  type='number'
                  min='13'
                  max='65'
                  value={data.targetAudience.min_age}
                  onChange={handleAgeChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='max_age'>Maximum Age</Label>
                <Input
                  id='max_age'
                  name='max_age'
                  type='number'
                  min='13'
                  max='65'
                  value={data.targetAudience.max_age}
                  onChange={handleAgeChange}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
}) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium';
  const variantClasses =
    props.variant === 'outline'
      ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return (
    <button className={`${baseClasses} ${variantClasses} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}
