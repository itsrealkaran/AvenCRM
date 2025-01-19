import React, { useState } from 'react';
import { PropertyFormData } from '@/types/propertyTypes';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

const propertyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  listingPrice: z.number().positive('Listing price must be positive'),
  address: z.string().min(1, 'Address is required'),
  sqft: z.number().positive('Square footage must be positive'),
  propertyType: z.string().min(1, 'Property type is required'),
  buildingType: z.string().optional(),
  yearBuilt: z.number().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SOLD', 'INACTIVE']).default('ACTIVE'),
  images: z.array(z.string()),
});

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData) => void;
  isLoading?: boolean;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: initialData || {
      status: 'ACTIVE',
      images: [],
    },
  });

  const propertyTypes = ['Residential', 'Commercial', 'Industrial', 'Land'];

  const buildingTypes = [
    'Single Family',
    'Multi Family',
    'Apartment',
    'Condo',
    'Office',
    'Retail',
    'Warehouse',
  ];

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(
      (file) => file.type.includes('image/jpeg') || file.type.includes('image/png')
    );

    if (validFiles.length === 0) {
      alert('Please upload only JPEG or PNG files');
      return;
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('accessToken');
      const uploadFormData = new FormData();

      validFiles.forEach((file) => {
        uploadFormData.append('images', file);
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/property/upload-images`,
        uploadFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the form data with the new image URLs
      const newImageUrls = response.data.images.map((img: any) => img.imageUrl);
      setValue('images', [...(initialData?.images || []), ...newImageUrls]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setValue(
      'images',
      (initialData?.images || []).filter((image) => image !== imageToRemove)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <Controller
          name='title'
          control={control}
          render={({ field }) => <Input placeholder='Title' {...field} />}
        />

        <Controller
          name='propertyType'
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <SelectTrigger />
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          name='price'
          control={control}
          render={({ field }) => (
            <Input
              type='number'
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
            />
          )}
        />

        <Controller
          name='listingPrice'
          control={control}
          render={({ field }) => (
            <Input
              type='number'
              {...field}
              onChange={(e) => field.onChange(parseFloat(e.target.value))}
            />
          )}
        />

        <Controller
          name='address'
          control={control}
          render={({ field }) => <Input placeholder='Address' {...field} />}
        />

        <Controller
          name='sqft'
          control={control}
          render={({ field }) => (
            <Input
              type='number'
              {...field}
              onChange={(e) => field.onChange(parseInt(e.target.value))}
            />
          )}
        />

        <Controller
          name='buildingType'
          control={control}
          render={({ field }) => (
            <Select {...field} label='Building Type' error={errors.buildingType?.message}>
              <SelectTrigger />
              <SelectContent>
                {buildingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <Controller
          name='yearBuilt'
          control={control}
          render={({ field }) => <Input type='number' placeholder='Year Built' {...field} />}
        />
      </div>

      <Controller
        name='description'
        control={control}
        render={({ field }) => <Textarea rows={4} placeholder='Description' {...field} />}
      />

      <div className='space-y-4'>
        <label className='block text-sm font-medium text-gray-700'>Property Images</label>

        {/* Image Upload Input */}
        <div className='flex items-center justify-between'>
          <input
            type='file'
            multiple
            accept='image/jpeg,image/png'
            onChange={handleFileUpload}
            disabled={isUploading}
            className='block w-full text-sm text-gray-500 
              file:mr-4 file:py-2 file:px-4 
              file:rounded-full file:border-0 
              file:text-sm file:font-semibold 
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100'
          />
        </div>

        {/* Image Preview Grid */}
        {watch('images')?.length > 0 && (
          <div className='grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4'>
            {watch('images')
              .filter(Boolean)
              .map((imageUrl, index) => (
                <div key={index} className='relative group'>
                  <img
                    src={imageUrl}
                    alt={`Property image ${index + 1}`}
                    className='w-full h-24 object-cover rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={() => handleRemoveImage(imageUrl)}
                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                    hover:bg-red-600 focus:outline-none'
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className='flex justify-end space-x-4'>
        <Button type='button' variant='outline'>
          Cancel
        </Button>
        <Button type='submit' disabled={isUploading}>
          {initialData ? 'Update' : 'Create'} Property
        </Button>
      </div>
    </form>
  );
};
