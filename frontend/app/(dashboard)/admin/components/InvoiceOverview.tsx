import React from 'react';

interface val {
  func: () => void;
  open: boolean;
}

const InvoiceOverview: React.FC<val> = ({ func, open }) => {
  return (
    <>
      <div
        onClick={func}
        className='flex flex-shrink-0 cursor-pointer items-center justify-between rounded-xl bg-[#f5f5f5] px-16 py-2 text-[0.8rem]'
      >
        <div className='font-semibold'>
          <h1>Feb 2, 2023</h1>
        </div>

        <div className='text-center font-semibold'>
          <h1>Quaterly true-up</h1>
          <p className='text-[9px] leading-[1.1rem] opacity-60'>july 14,2023 - july 5,2024</p>
        </div>
        <div className='font-semibold'>
          <h1>Rs 50,000.00</h1>
        </div>
        <div className='text-center font-semibold'>
          <h1>paid</h1>
          <p className='text-[12px] leading-[1.1rem] text-blue-600 opacity-90'>view Invoice</p>
        </div>
      </div>
      {open ? (
        <div className='absolute left-0 top-0 h-screen w-full bg-white'>
          <button onClick={func}>go back</button>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default InvoiceOverview;
