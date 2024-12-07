'use client';

import React, { useEffect, useState } from 'react';
import { BsGenderNeuter } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa6';
import { IoIosSearch, IoMdPerson } from 'react-icons/io';
import { IoClose, IoDownloadOutline } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import { MdEmail, MdOutlineDriveFileRenameOutline, MdOutlineLocalPhone } from 'react-icons/md';
import { VscRefresh } from 'react-icons/vsc';

import ManageUserList from './components/ManageUserList';

// default button
// Manage user font size inc ✅
// second componet height dec  --bhul gaya
// bg remove
// updated figma ✅
// update user if selected only once ✅
// delete user for multiple user  ✅
// user , agents in form selection ✅
// if agent then choose team lead , one more select form, ✅
// form padding change

const Page = () => {
  const [adduser, setadd] = useState(false);

  const [agent, setagent] = useState('false');

  const [selectedList, setselectedList] = useState<number[]>([]);
  useEffect(() => {
    console.log(selectedList);
    console.log(agent);
  }, [selectedList, agent]);

  const addItem = (i: number) => {
    if (selectedList.includes(i)) {
      setselectedList(selectedList.filter((item) => item !== i));
    } else {
      setselectedList([...selectedList, i]);
    }
  };

  const openadd = () => {
    setagent('');
    setadd((prev) => !prev);
  };

  const bakaData = [1, 2, 4, 5, 6, 7, 9, 0, 6, 4, 3];

  return (
    <>
      <div className='relative w-full overflow-hidden bg-[#F6F9FE] p-3'>
        {/* this is the top most div with the filter options  */}
        <div className='w-full bg-white'>
          {/* this is the top level filter div  */}
          <div className='flex w-full items-center justify-between px-4 pt-5'>
            {/* this is the main heading */}
            <div className='text-[1.2rem] font-bold tracking-tight opacity-90'>Manage Users</div>

            <div className='flex items-center gap-3 text-[1rem]'>
              <div
                onClick={() => openadd()}
                className={`bg-red-500 px-2 py-1 text-sm text-white ${selectedList.length > 0 ? 'block' : 'hidden'} rounded-[4px] tracking-tight`}
              >
                <button>Delete User</button>
              </div>

              <div
                onClick={() => openadd()}
                className={`bg-[#5932EA] px-2 py-1 text-sm text-white ${selectedList.length > 0 && selectedList.length < 2 ? 'block' : 'hidden'} rounded-[4px] tracking-tight`}
              >
                <button>Update User</button>
              </div>
              <div
                onClick={() => openadd()}
                className='rounded-[4px] bg-[#5932EA] px-2 py-1 text-sm tracking-tight text-white'
              >
                <button>Add Users</button>
              </div>
              <div className='flex gap-3 text-lg opacity-70'>
                <IoIosSearch />
                <VscRefresh />
                <IoDownloadOutline />
              </div>
              <div className='opacity-70'>
                <LuFilter />
              </div>
            </div>
          </div>

          {/* this is the option designation div  */}

          <div className='mt-10 flex w-full items-center justify-between pb-5 pl-28 pr-16 text-sm'>
            <div className='rounded-lg bg-[#F7F7FA] px-8 py-[5px] text-[0.8rem] font-semibold'>
              <h1 className='opacity-80'>Designated person</h1>
            </div>
            <div className='rounded-lg bg-[#F7F7FA] px-8 py-[5px] text-[0.8rem] font-semibold'>
              <h1 className='opacity-80'>Email</h1>
            </div>
            <div className='rounded-lg bg-[#F7F7FA] px-8 py-[5px] text-[0.8rem] font-semibold'>
              <h1 className='opacity-80'>Phone</h1>
            </div>
            <div className='rounded-lg bg-[#F7F7FA] px-8 py-[5px] text-[0.8rem] font-semibold'>
              <h1 className='opacity-80'>User Status</h1>
            </div>
          </div>
        </div>

        {/* this is the bottom scrollabel div with the list thingy don't */}

        <div className='mt-3 flex h-[80vh] flex-col gap-2 overflow-y-auto bg-white px-3 py-5 text-sm font-semibold'>
          {/* this is going to be an component  */}

          {bakaData.map((e, i) => (
            <ManageUserList func={addItem} key={i} index={i} />
          ))}
        </div>

        {adduser ? (
          <div className='absolute right-0 top-0 flex h-full w-full items-start justify-center bg-blue-500/30 pt-10 backdrop-blur-sm'>
            {/* this is the internal div  */}

            <div className='h-[80%] w-[40%] rounded-lg bg-white py-5 pl-14 pr-10'>
              {/* this is the close button div */}
              <div
                onClick={() => openadd()}
                className='flex w-full cursor-pointer items-center justify-end text-[1.5rem] opacity-80'
              >
                <IoClose />
              </div>
              {/* this is the main heading text  */}
              <div className='mt-2 w-full text-[1.1rem] font-semibold tracking-tight opacity-80'>
                <h1>Create Users</h1>
              </div>

              {/* this is the option div */}

              <div className='mt-5 flex w-full flex-col gap-3 border-b-[1px] border-black/20 pb-8'>
                {/* this is one text field  */}
                <div className='flex w-full items-center justify-between gap-2'>
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-1'>
                    <MdOutlineDriveFileRenameOutline />
                    <div></div>
                    <h1>Name</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <input
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold outline-none'
                      type='text'
                      name=''
                      id=''
                    />
                  </div>
                </div>

                {/* this is for the age section */}
                <div className='flex w-full items-center justify-between gap-2'>
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-2'>
                    <div>
                      {' '}
                      <IoMdPerson />
                    </div>
                    <h1>Age</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <input
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold outline-none'
                      type='text'
                      name=''
                      id=''
                    />
                  </div>
                </div>

                {/* this for the gender  */}
                <div className='flex w-full items-center justify-between gap-2'>
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-1'>
                    <div>
                      {' '}
                      <BsGenderNeuter />
                    </div>
                    <h1>Gender</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <input
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold outline-none'
                      type='text'
                      name=''
                      id=''
                    />
                  </div>
                </div>

                {/* this is for the phone */}

                <div className='flex w-full items-center justify-between gap-2'>
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-2'>
                    <div>
                      {' '}
                      <MdOutlineLocalPhone />
                    </div>
                    <h1>Phone</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <input
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold outline-none'
                      type='text'
                      name=''
                      id=''
                    />
                  </div>
                </div>

                {/* this is for the email  */}

                <div className='flex w-full items-center justify-between gap-2'>
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-2'>
                    <div>
                      {' '}
                      <MdEmail />
                    </div>
                    <h1>Email</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <input
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold outline-none'
                      type='text'
                      name=''
                      id=''
                    />
                  </div>
                </div>

                {/* this is the for the user status  */}

                <div className='flex w-full items-center justify-between gap-2'>
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-2'>
                    <div>
                      {' '}
                      <FaUser />
                    </div>
                    <h1>User Status</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <select
                      onChange={(e) => setagent(e.target.value)}
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold text-black/50 outline-none'
                      name='cars'
                      id='cars'
                    >
                      <option value='user'>User</option>
                      <option value='agent'>Agent</option>
                    </select>
                  </div>
                </div>
                <div
                  className={` ${agent === 'agent' ? 'flex' : 'hidden'} w-full items-center justify-between gap-2`}
                >
                  {/* this is the name and the symbol div  */}
                  <div className='flex items-center gap-2'>
                    <div>
                      {' '}
                      <FaUser />
                    </div>
                    <h1>Team Lead</h1>
                  </div>

                  {/* this is the input box field */}

                  <div className='flex h-10 w-[68%] items-center'>
                    <select
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold text-black/50 outline-none'
                      name='cars'
                      id='cars'
                    >
                      <option value='Lead 1 '>Lead 1 </option>
                      <option value='Lead 2 '>Lead 2 </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* this is the last cancel button or add div button  */}

              <div className='mt-5 flex w-full items-center justify-end gap-2 text-sm tracking-tighter'>
                <div
                  onClick={() => openadd()}
                  className='cursor-pointer rounded-sm border px-3 py-1'
                >
                  Cancel
                </div>
                <div className='cursor-pointer rounded-sm bg-[#5932EA] px-3 py-1 text-white'>
                  Add
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default Page;
