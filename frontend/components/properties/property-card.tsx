'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Property, PropertyStatus } from '@/types/property';
import { Edit, MoreHorizontal, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Badge } from '../ui/badge';

interface PropertyCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
}

const statusColorMap: Record<PropertyStatus, string> = {
  [PropertyStatus.ACTIVE]: 'bg-green-500',
  [PropertyStatus.SOLD]: 'bg-blue-500',
  [PropertyStatus.PENDING]: 'bg-yellow-500',
  [PropertyStatus.INACTIVE]: 'bg-gray-500',
};

export function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  const [isImageError, setIsImageError] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className='w-full max-w-sm transition-all hover:shadow-lg'>
      <CardHeader className='relative p-0'>
        <div className='relative h-48 w-full overflow-hidden'>
          {!isImageError && property.images[0] ? (
            <Image
              src={property.images[0].imageUrl}
              alt={property.title}
              fill
              className='object-cover'
              onError={() => setIsImageError(true)}
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-gray-200'>
              <span className='text-gray-400'>No image available</span>
            </div>
          )}
          <Badge className={`absolute right-2 top-2 ${statusColorMap[property.status]} text-white`}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='p-4'>
        <div className='mb-2 flex items-center justify-between'>
          <CardTitle className='text-xl font-bold'>{formatPrice(property.price)}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='h-8 w-8 p-0'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => onEdit?.(property)}>
                <Edit className='mr-2 h-4 w-4' />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className='text-red-600' onClick={() => onDelete?.(property.id)}>
                <Trash className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className='line-clamp-1'>{property.address}</CardDescription>
        <div className='mt-4 grid grid-cols-3 gap-2 text-sm'>
          <div className='text-center'>
            <p className='font-semibold'>{property.bedrooms}</p>
            <p className='text-gray-500'>Beds</p>
          </div>
          <div className='text-center'>
            <p className='font-semibold'>{property.bathrooms}</p>
            <p className='text-gray-500'>Baths</p>
          </div>
          <div className='text-center'>
            <p className='font-semibold'>{property.sqft}</p>
            <p className='text-gray-500'>Sqft</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className='p-4 pt-0'>
        <Link href={`/agent/property/${property.id}`} className='w-full'>
          <Button className='w-full' variant='outline'>
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
