import Image from 'next/image';
import React from 'react';

const MonitoringList = () => {
  return (
    <div className="flex w-full justify-between rounded-lg bg-[#F5F5F5] px-10 py-4 text-[14px] font-semibold tracking-tight">
      {/* this is the images div with name */}
      <div className="flex w-[14%] items-center gap-[7px]">
        <div className="h-5 w-5 overflow-hidden rounded-full">
          <Image
            height={100}
            width={100}
            src="https://images.pexels.com/photos/10414204/pexels-photo-10414204.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
            alt="not showing"
          />
        </div>
        <h1 className="opacity-80">nikochan</h1>
      </div>

      {/* this is the status div  */}

      <div className="w-[14%] pl-3 text-blue-700 opacity-80">
        <h1>proposal</h1>
      </div>

      {/* this is the deal value div  */}

      <div className="w-[14%] pl-5 opacity-80">
        <h1>$ 70,000</h1>
      </div>

      {/* this is the email div */}

      <div className="w-[14%] opacity-80">
        <h1>niko@chan356.gmail.com</h1>
      </div>

      {/* this is the expected close date div */}

      <div className="w-[14%] pl-10 opacity-80">
        <h1>12/02/34</h1>
      </div>

      {/* this is the close probabilty div */}

      <div className="w-[14%] pl-10 text-green-600 opacity-80">
        <h1>90%</h1>
      </div>

      {/* this is the forcast valuse div  */}

      <div className="w-[8%] opacity-80">
        <h1>$80,000</h1>
      </div>
    </div>
  );
};

export default MonitoringList;
