import React from 'react';
import Image from 'next/image';
import { Property } from '@/types/propertyTypes';
import { Edit, Trash2 } from 'lucide-react';

import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface PropertyCardProps {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onEdit, onDelete }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className='overflow-hidden'>
      <div className='relative h-48'>
        {property.images[0] ? (
          <Image src={property.images[0]} alt={property.title} fill className='object-cover' />
        ) : (
          <div className='w-full h-full bg-gray-200 flex items-center justify-center'>No Image</div>
        )}
        <div className='absolute top-2 right-2 flex space-x-2'>
          <Button size='sm' variant='ghost' className='bg-white/90 hover:bg-white' onClick={onEdit}>
            <Edit className='h-4 w-4' />
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='bg-white/90 hover:bg-white text-red-600 hover:text-red-700'
            onClick={onDelete}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <div className='p-4 space-y-2'>
        <div className='flex justify-between items-start'>
          <h3 className='font-semibold truncate'>{property.title}</h3>
          <span className='text-sm px-2 py-1 rounded-full bg-gray-100'>{property.status}</span>
        </div>
        <p className='text-sm text-gray-600 truncate'>{property.address}</p>
        <div className='flex justify-between items-center'>
          <span className='font-semibold text-lg'>{formatPrice(property.price)}</span>
          <div className='text-sm text-gray-600'>{property.sqft} sqft</div>
        </div>
        <div className='flex items-center space-x-4 text-sm text-gray-600'>
          <span>{property.propertyType}</span>
          {property.bedrooms && <span>{property.bedrooms} beds</span>}
        </div>
      </div>
    </Card>
  );
};
