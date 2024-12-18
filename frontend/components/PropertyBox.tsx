import Image, { StaticImageData } from 'next/image';
import { Share1Icon } from '@radix-ui/react-icons';
import { Heart } from 'lucide-react';

interface PropertyBoxProps {
  imgurl: string;
  address: string;
  price: number;
  landSize: number;
  bedrooms: number;
  bathrooms: number;
}

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
          </div>
          <div className='flex items-center gap-2'>
            <Share1Icon className='h-4 w-4 ' />
            <Heart className='h-4 w-4' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyBox;
