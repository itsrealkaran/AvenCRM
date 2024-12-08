import Image from 'next/image';
import { Contact } from 'lucide-react';

interface ManageUserListProps {
  func: (i: number, id: string) => void;
  index: number;
  name: string;
  email: string;
  phone: number;
  role: string;
  id: string;
}

const ManageUserList = ({ func, index, name, email, phone, role, id }: ManageUserListProps) => {
  return (
    <div className='relative grid grid-cols-[auto_2fr_2fr_2fr_1fr] items-center text-md gap-4  py-6 rounded-lg bg-[#F5F5F5] px-5 py-4'>
      {/* Checkbox */}
      <div className='flex items-center'>
        <input
          onClick={() => func(index, id)}
          className='h-5 w-5 cursor-pointer'
          type='checkbox'
          name=''
          id=''
        />
      </div>

      {/* Name with image */}
      <div className='flex items-center gap-2'>
          <Contact className='h-4 w-4' />
        <h1 className='opacity-70'>{name}</h1>
      </div>

      {/* Email */}
      <div className='text-center opacity-70'>
        <h1>{email}</h1>
      </div>

      {/* Phone number */}
      <div className='text-center opacity-70'>
        <h1>{phone}</h1>
      </div>

      {/* User status */}
      <div className='text-center capitalize text-blue-700'>
        <h1>{role}</h1>
      </div>
    </div>
  );
};

export default ManageUserList;
