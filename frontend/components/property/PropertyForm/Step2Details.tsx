import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const Step2Details: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='propertyName'>Property Name</Label>
          <Input
            id='propertyName'
            name='propertyName'
            value={formData.propertyName || ''}
            onChange={handleInputChange}
            placeholder='Enter property name'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='price'>Price</Label>
          <Input
            id='price'
            name='price'
            type='number'
            value={formData.price || ''}
            onChange={handleInputChange}
            placeholder='Enter price'
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='bedrooms'>Bedrooms</Label>
          <Input
            id='bedrooms'
            name='bedrooms'
            type='number'
            value={formData.bedrooms || ''}
            onChange={handleInputChange}
            placeholder='Number of bedrooms'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='bathrooms'>Bathrooms</Label>
          <Input
            id='bathrooms'
            name='bathrooms'
            type='number'
            value={formData.bathrooms || ''}
            onChange={handleInputChange}
            placeholder='Number of bathrooms'
          />
        </div>
      </div>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='parking'>Parking</Label>
          <Input
            id='parking'
            name='parking'
            type='number'
            value={formData.parking || ''}
            onChange={handleInputChange}
            placeholder='Number of parking spaces'
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='sqft'>Sq.Ft</Label>
          <Input
            id='sqft'
            name='sqft'
            type='number'
            value={formData.sqft || ''}
            onChange={handleInputChange}
            placeholder='Square footage'
          />
        </div>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          name='description'
          value={formData.description || ''}
          onChange={handleInputChange}
          placeholder='Enter property description'
          rows={4}
        />
      </div>
    </div>
  );
};

export default Step2Details;
