'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { ConciergeBell } from 'lucide-react';
import { BsGenderNeuter } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa6';
import { IoIosSearch, IoMdPerson } from 'react-icons/io';
import { IoClose, IoDownloadOutline } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import { MdEmail, MdOutlineDriveFileRenameOutline, MdOutlineLocalPhone } from 'react-icons/md';
import { VscRefresh } from 'react-icons/vsc';

import ManageUserList from './components/ManageUserList';

interface FormData {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
  role: 'AGENT' | 'TEAM_LEADER';
  teamLead?: string;
}

const Page = () => {
  const [adduser, setadd] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [updateOrCreate, setUpdateOrCreate] = useState<'UPDATE' | 'CREATE'>();
  const [openDeletePopup, setOpenDeletePopup] = useState(false);

  const [agent, setagent] = useState('false');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    role: 'AGENT',
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [list, setList] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getUser = useCallback(async () => {

    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setList(res.data);
      setRefresh(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setRefresh(false);
    }
  }, []);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    getUser();
  }, [agent, selectedList, refresh, getUser]);

  const addItem = (i: number, id: string) => {
    if (selectedList.includes(id)) {
      setSelectedList(selectedList.filter((item) => item !== id));
    } else {
      setSelectedList([...selectedList, id]);
    }
  };

  const addUser = async () => {
    console.log(formData);
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`,
      {
        name: formData.name,
        dob: new Date(),
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        gender: formData.gender,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    setadd(false);
    setRefresh(true);
    console.log(response.data);
  };

  const updateUser = async () => {
    console.log(formData, 'update');
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/agent/${selectedList[0]}`,
      {
        name: formData.name,
        dob: new Date(),
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        gender: formData.gender,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      }
    );
    setadd(false);
    setRefresh(true);
    console.log(response.data);
  };

  const deleteUser = async () => {
    console.log(selectedList);
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      data: {
        agentIds: selectedList,
      },
    });
    setOpenDeletePopup(false);
    setRefresh(true);
    console.log(response.data);
  };

  const openadd = (state?: 'UPDATE') => {
    if (state === 'UPDATE') {
      setUpdateOrCreate('UPDATE');
      setadd((prev) => !prev);
    } else {
      setagent('');
      setUpdateOrCreate('CREATE');
      setadd((prev) => !prev);
    }
  };

  return (
    <>
      <div className='relative flex h-[91vh] w-full flex-col p-3'>
        {/* Filter options div */}
        <div className='w-full flex-none bg-white rounded-md'>
          {/* this is the top level filter div  */}
          <div className='flex w-full items-center justify-between border-b-[1px] border-black/20 px-5 py-3'>
            {/* this is the main heading */}
            <div className='text-[1.2rem] font-bold tracking-tight opacity-90'>Manage Users</div>

            <div className='flex items-center gap-3 text-[1rem]'>
              <div
                onClick={() => setOpenDeletePopup(true)}
                className={`bg-red-500 px-2 py-1 text-sm text-white ${selectedList.length > 0 ? 'block' : 'hidden'} rounded-[4px] tracking-tight`}
              >
                <button>Delete User</button>
              </div>

              <div
                onClick={() => openadd('UPDATE')}
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

          {/* delete popup */}

          {openDeletePopup && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all'>
              <div className='w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all'>
                <div className='flex items-center justify-between'>
                  <div className='text-xl font-semibold text-gray-900'>Delete User</div>
                  <button 
                    onClick={() => setOpenDeletePopup(false)}
                    className='rounded-full p-1 hover:bg-gray-100 transition-colors'
                  >
                    <IoClose className='h-5 w-5 text-gray-500' />
                  </button>
                </div>
                <div className='mt-4 text-sm text-gray-600'>
                  Are you sure you want to delete the selected user?
                </div>
                <div className='mt-6 flex items-center justify-end gap-3'>
                  <button
                    onClick={() => setOpenDeletePopup(false)}
                    className='rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteUser}
                    type='button'
                    className='rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors'
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

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

        {/* List container with proper height calculation */}
        <div className='mt-3 flex-1 overflow-hidden rounded-md bg-white'>
          <div className='h-full overflow-y-auto px-3 py-5 text-sm font-semibold'>
            <div className='space-y-3'>
              {loading
                ? // Skeleton UI
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div
                        key={i}
                        className='relative grid grid-cols-[auto_2fr_2fr_2fr_1fr] items-center gap-4 py-6 rounded-lg bg-[#F5F5F5] px-5'
                      >
                        <div className='flex items-center'>
                          <div className='h-4 w-4 rounded bg-gray-200 animate-pulse'></div>
                        </div>
                        <div className='h-4 w-3/4 rounded bg-gray-200 animate-pulse'></div>
                        <div className='h-4 w-2/3 rounded bg-gray-200 animate-pulse'></div>
                        <div className='h-4 w-1/2 rounded bg-gray-200 animate-pulse'></div>
                        <div className='h-4 w-16 rounded bg-gray-200 animate-pulse'></div>
                      </div>
                    ))
                : list.map((user, i) => (
                    <ManageUserList
                      func={addItem}
                      name={user.name}
                      email={user.email}
                      phone={user.phone}
                      role={user.role}
                      id={user.id}
                      key={i}
                      index={i}
                    />
                  ))}
            </div>
          </div>
        </div>

        {adduser ? (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
            <div className='w-full max-w-xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all'>
              <div className='relative p-6'>
                {/* Header */}
                <div className='mb-6 flex items-center justify-between border-b pb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {updateOrCreate === 'UPDATE' ? 'Update User' : 'Create User'}
                  </h2>
                  <button
                    onClick={() => openadd()}
                    className='rounded-full p-1 hover:bg-gray-100'
                  >
                    <IoClose className='h-6 w-6 text-gray-500' />
                  </button>
                </div>

                {/* Form Fields */}
                <div className='space-y-4'>
                  {/* Name Field */}
                  <div className='group relative'>
                    <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <MdOutlineDriveFileRenameOutline className='h-4 w-4' />
                      Name
                    </label>
                    <input
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder='Enter name'
                    />
                  </div>

                  {/* Age Field */}
                  <div className='group relative'>
                    <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <IoMdPerson className='h-4 w-4' />
                      Age
                    </label>
                    <input
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      type='text'
                      name='age'
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder='Enter age'
                    />
                  </div>

                  {/* Gender Field */}
                  <div className='group relative'>
                    <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <BsGenderNeuter className='h-4 w-4' />
                      Gender
                    </label>
                    <select
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      name='gender'
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value=''>Select Gender</option>
                      <option value='MALE'>Male</option>
                      <option value='FEMALE'>Female</option>
                    </select>
                  </div>

                  {/* Phone Field */}
                  <div className='group relative'>
                    <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <MdOutlineLocalPhone className='h-4 w-4' />
                      Phone
                    </label>
                    <input
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      type='text'
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder='Enter phone number'
                    />
                  </div>

                  {/* Email Field */}
                  <div className='group relative'>
                    <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <MdEmail className='h-4 w-4' />
                      Email
                    </label>
                    <input
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      type='email'
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder='Enter email'
                    />
                  </div>

                  {/* User Status Field */}
                  <div className='group relative'>
                    <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                      <FaUser className='h-4 w-4' />
                      User Status
                    </label>
                    <select
                      className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      name='role'
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value='user'>Agent</option>
                      <option value='agent'>Team Leader</option>
                    </select>
                  </div>

                  {/* Team Lead Field - Conditional */}
                  {agent === 'agent' && (
                    <div className='group relative'>
                      <label className='mb-1 flex items-center gap-2 text-sm font-medium text-gray-700'>
                        <FaUser className='h-4 w-4' />
                        Team Lead
                      </label>
                      <select
                        className='w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        name='cars'
                      >
                        <option value='Lead 1'>Lead 1</option>
                        <option value='Lead 2'>Lead 2</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className='mt-6 flex items-center justify-end gap-3 border-t pt-4'>
                  <button
                    onClick={() => openadd()}
                    className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateOrCreate === 'UPDATE' ? updateUser : addUser}
                    disabled={loading}
                    className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                  >
                    {loading ? 'Loading...' : updateOrCreate === 'UPDATE' ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Page;
