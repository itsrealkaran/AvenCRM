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
<<<<<<< HEAD
  id: string;
=======
  imgurl: string;
>>>>>>> main
  address: string;
  price: number;
  landSize: number;
  bedrooms: number;
  bathrooms: number;
  imageUrl: string
}

<<<<<<< HEAD
const PropertyBox = ({ id, address, price, landSize, bedrooms, bathrooms, imageUrl }: PropertyBoxProps) => {
  const router = useRouter();
  return (
    <Card className='flex flex-col w-80 rounded-md border-[1px] bg-white border-gray-300 justify-between'>
      <Image src={imageUrl} alt={address} width={300} height={300} className='w-full rounded-t-md' />
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
=======
const PropertyBox = ({
  imgurl,
  address,
  price,
  landSize,
  bedrooms,
  bathrooms,
}: PropertyBoxProps) => {
  return (
    <div className='flex flex-col w-72 rounded-md border-[1px] bg-white border-gray-300 justify-between pb-4'>
      <div className=''>
        <Image
          src={
            'https://plus.unsplash.com/premium_photo-1689609950097-1e6b05dfdba6?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8'
          }
          alt={address}
          height={100}
          width={100}
          className='w-full h-full rounded-t-md'
        />
      </div>
      <div className='mx-2'>
        <div className='flex flex-col'>
          <h2 className='text-lg mt-2 font-semibold mb-1'>{address}</h2>
          <p className='text-gray-500'>{price}</p>
        </div>
        <div className='flex gap-2'>
          <p className='text-gray-500'>{landSize}</p>
          <p className='text-gray-500'>{bedrooms}</p>
          <p className='text-gray-500'>{bathrooms}</p>
        </div>

        <div className='flex items-center gap-2 justify-between mt-2 border-t-[1px] border-gray-300 pt-2'>
          <div className='flex items-center gap-2'>
            <div className='h-6 w-6 rounded-full bg-black' />
            <p className='text-sm'>Pushkar</p>
>>>>>>> main
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
