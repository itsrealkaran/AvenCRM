import Image, { StaticImageData } from 'next/image';
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
import { useRouter } from 'next/navigation';

interface PropertyBoxProps {
  id: string;
  img: StaticImageData;
  address: string;
  price: number;
  landSize: number;
  bedrooms: number;
  bathrooms: number;
}

const PropertyBox = ({ id, img, address, price, landSize, bedrooms, bathrooms }: PropertyBoxProps) => {
  const router = useRouter();
  return (
    <Card className='flex flex-col w-80 rounded-md border-[1px] bg-white border-gray-300 justify-between'>
      <Image src={img} alt={address} width={300} height={300} className='w-full rounded-t-md' />
      <div>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>{address}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between items-center mb-2'>
            <div className='flex items-center'>
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
        <CardFooter>
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
