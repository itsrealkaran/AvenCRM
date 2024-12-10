import Image, { StaticImageData } from 'next/image';
import { Share1Icon } from '@radix-ui/react-icons';
import { Heart } from 'lucide-react';

interface PropertyBoxProps {
  img: StaticImageData;
  title: string;
  prise: string;
  landSize: string;
  bedrooms: string;
  bathrooms: string;
  agentName: string;
}

const PropertyBox = ({
  img,
  title,
  prise,
  landSize,
  bedrooms,
  bathrooms,
  agentName,
}: PropertyBoxProps) => {
  return (
    <div className='flex flex-col w-72 rounded-md border-[1px] border-gray-300 justify-between py-4'>
      <div className=''>
        <Image src={img} alt={title} height={100} width={100} className='w-full h-full' />
      </div>
      <div className='mx-2'>
        <div className='flex flex-col'>
          <h2 className='text-xl mt-2 font-semibold'>{title}</h2>
          <p className='text-gray-500'>{prise}</p>
        </div>
        <div className='flex gap-2'>
          <p className='text-gray-500'>{landSize}</p>
          <p className='text-gray-500'>{bedrooms}</p>
          <p className='text-gray-500'>{bathrooms}</p>
        </div>

        <div className='flex items-center gap-2 justify-between mt-2'>
          <div className='flex items-center gap-2'>
            <div className='h-6 w-6 rounded-full bg-black' />
            <p className='text-sm'>{agentName}</p>
          </div>
          <div className='flex items-center gap-2'>
            <Share1Icon className='h-4 w-4 bg-gray-300' />
            <Heart className='h-4 w-4 bg-gray-300' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyBox;
