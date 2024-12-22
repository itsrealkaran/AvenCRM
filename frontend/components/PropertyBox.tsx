import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { Bath, Bed, DollarSign, Home, Plus, Search, Square } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from './ui/button';

interface PropertyBoxProps {
  id: string;
  address: string;
  price: number;
  landSize: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string;
}

const PropertyBox = ({
  id,
  address,
  price,
  landSize,
  bedrooms,
  bathrooms,
  imageUrl,
}: PropertyBoxProps) => {
  const router = useRouter();
  return (
    <Card className='w-80 h-[380px] rounded-md border-[1px] bg-white border-gray-300'>
      <Image
        src={imageUrl}
        alt={address}
        width={300}
        height={300}
        className='w-full h-[50%] rounded-t-md'
      />
      <div className='h-[45%]'>
        <CardHeader className='p-4'>
          <CardTitle className='text-lg font-semibold truncate'>{address}</CardTitle>
        </CardHeader>
        <CardContent className='px-4'>
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center text-purple-600'>
              <DollarSign className='h-4 w-4 mr-1' />
              <span className='font-semibold'>{price.toLocaleString()}</span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='flex items-center'>
                <Bed className='h-4 w-4 mr-1' />
                <span>{bedrooms}</span>
              </div>
              <div className='flex items-center'>
                <Bath className='h-4 w-4 mr-1' />
                <span>{bathrooms}</span>
              </div>
              <div className='flex items-center'>
                <Square className='h-4 w-4 mr-1' />
                <span>{landSize} sqft</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='px-4'>
          <Button onClick={() => router.push(`/${id}`)} variant='outline' className='w-full'>
            <Home className='mr-2 h-4 w-4' />
            View Details
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default PropertyBox;
