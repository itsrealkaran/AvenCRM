import Image from 'next/image';

interface val {
  func: (i: number) => void;
  index: number;
}

const ManageUserList: React.FC<val> = ({ func, index }) => {
  return (
    <div className='relative flex w-full items-center justify-between rounded-lg bg-[#F5F5F5] px-5 py-4'>
      {/* this is teh checkbox div */}
      <div className='flex w-fit cursor-pointer items-center justify-center'>
        <input
          onClick={() => func(index)}
          className='h-5 w-5 cursor-pointer'
          type='checkbox'
          name=''
          id=''
        />
      </div>

      {/* this is the name with the image div  */}

      <div className='flex w-[23%] items-center justify-center gap-[5.5px] pr-10'>
        <div className='h-6 w-6 overflow-hidden rounded-full'>
          <Image
            height={100}
            width={100}
            className='h-full w-full object-cover'
            src='https://images.pexels.com/photos/22468584/pexels-photo-22468584/free-photo-of-woman-sitting-on-bed-with-flowers.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load'
            alt='not showing '
          />
        </div>
        <h1 className='opacity-70'>isagi yoichi</h1>
      </div>

      {/* this is the email div */}
      <div className='flex w-[23%] justify-center pr-5 opacity-70'>
        <h1>nikochan@256.com</h1>
      </div>

      {/* this is the phone number div  */}

      <div className='flex w-[25%] justify-center pr-20 opacity-70'>
        <h1>8005602455</h1>
      </div>

      {/* this is the status of the user div */}

      <div className='flex w-[15%] justify-center capitalize text-blue-700'>
        <h1>agent</h1>
      </div>
    </div>
  );
};

export default ManageUserList;
