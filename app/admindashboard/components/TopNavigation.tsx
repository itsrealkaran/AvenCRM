import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { CiBellOn } from 'react-icons/ci';
import { FaQuestion } from 'react-icons/fa6';
import { FaAngleDown } from 'react-icons/fa6';
import Image from 'next/image';

// done with it for now

export const TopNavigation = () => {
  return (
    <div className="z-50 flex h-[9%] w-full items-center justify-between bg-white px-5 shadow-lg shadow-black/10">
      {/* this is the search bar  */}

      <div className="relative w-[20%]">
        <input
          className="w-full rounded-[7px] border border-[#e8f0f6] bg-[#f3f7fa] px-3 py-1 text-[12.5px] outline-none"
          type="text"
          placeholder="Search anything..."
        />
        <div className="absolute right-4 top-[5px] text-[1rem] font-bold opacity-50">
          <FaSearch />
        </div>
      </div>

      {/* this is the notification section  */}

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border-[1px] border-black/70 text-[1.2rem] opacity-50">
          <CiBellOn />
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border-[1px] border-black/70 text-[1.1rem] opacity-50">
          <FaQuestion />
        </div>

        <div className="dropdown relative flex h-fit w-fit cursor-pointer items-center gap-[6px]">
          <div className="ml-6 h-[37px] w-[37px] overflow-hidden rounded-full">
            <Image
              height={100}
              width={100}
              className="h-full w-full object-cover"
              src="https://cdn.pixabay.com/photo/2022/12/01/04/43/girl-7628308_640.jpg"
              alt="not showing"
            />
          </div>
          <div className="leading-[0.8rem]">
            <h1 className="text-[0.8rem] font-semibold opacity-90">Profile</h1>
            <p className="text-[0.55rem] opacity-70">Manager</p>
          </div>

          <div className="ml-1 opacity-70">
            <FaAngleDown />
          </div>

          <div className="hover absolute left-2 top-[100%] z-10 w-full bg-black"></div>
        </div>
      </div>
    </div>
  );
};
