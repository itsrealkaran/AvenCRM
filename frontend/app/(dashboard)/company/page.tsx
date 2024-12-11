'use client';

import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { set } from 'date-fns';
import { ConciergeBell } from 'lucide-react';
import { BsGenderNeuter } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa6';
import { IoIosSearch, IoMdPerson } from 'react-icons/io';
import { IoClose, IoDownloadOutline } from 'react-icons/io5';
import { LuFilter } from 'react-icons/lu';
import { MdEmail, MdOutlineDriveFileRenameOutline, MdOutlineLocalPhone } from 'react-icons/md';
import { VscRefresh } from 'react-icons/vsc';

import { Skeleton } from '@/components/ui/skeleton';

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
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async () => {
    setLoading(true);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUser();
    console.log(selectedList);
  }, [agent, selectedList, refresh, getUser]);

  const addItem = (id: string, name: string, email: string, phone: number, role: string) => {
    const isSelected = selectedList.some((item) => item.id === id);
    if (isSelected) {
      setSelectedList(selectedList.filter((item) => item.id !== id));
    } else {
      setSelectedList([...selectedList, { id, name, email, phone, role }]);
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
        phoneNo: formData.phone,
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/agent`,
      {
        name: formData.name,
        dob: new Date(),
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        gender: formData.gender,
        agentId: selectedList[0],
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        params: {
          id: selectedList[0],
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

  const openadd = (
    name: string,
    age: string,
    gender: string,
    phone: string,
    email: string,
    state?: 'UPDATE' | 'CREATE'
  ) => {
    if (state === 'UPDATE') {
      console.log(name, age, gender, phone, email);
      console.log(formData);
      setFormData({
        name,
        age,
        gender,
        phone,
        email,
        role: 'AGENT',
      });
      setUpdateOrCreate('UPDATE');
      setadd((prev) => !prev);
    } else {
      setFormData({
        name: '',
        age: '',
        gender: '',
        phone: '',
        email: '',
        role: 'AGENT',
      });
      setagent('');
      setUpdateOrCreate('CREATE');
      setadd((prev) => !prev);
    }
  };

  if (loading) {
    return (
      <div className='container mx-auto py-10'>
        <div className='flex justify-between items-center p-5'>
          <div className='space-y-3'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-48' />
          </div>
          <Skeleton className='h-10 w-40' />
        </div>

        <div className='space-y-4 p-6'>
          <div className='flex justify-between items-center'>
            <Skeleton className='h-10 w-64' />
            <Skeleton className='h-10 w-32' />
          </div>

          <div className='rounded-md border'>
            <div className='space-y-4'>
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className='flex items-center justify-between p-4 border-b'>
                  <div className='flex items-center space-x-4'>
                    <Skeleton className='h-4 w-4' />
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-8 w-40' />
                    <Skeleton className='h-4 w-24' />
                  </div>
                  <Skeleton className='h-8 w-8' />
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end space-x-2 mt-4'>
            <Skeleton className='h-8 w-24' />
            <Skeleton className='h-8 w-24' />
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => setOpenDeletePopup(true)}
                className={`bg-red-500 px-2 py-1 text-sm text-white ${selectedList.length > 0 ? 'block' : 'hidden'} rounded-[4px] tracking-tight`}
              >
                <button>Delete User</button>
              </div>

              <div
                onClick={() =>
                  openadd(
                    selectedList[0].name,
                    selectedList[0].age,
                    selectedList[0].gender,
                    selectedList[0].phone,
                    selectedList[0].email,
                    'UPDATE'
                  )
                }
                className={`bg-[#5932EA] px-2 py-1 text-sm text-white ${selectedList.length > 0 && selectedList.length < 2 ? 'block' : 'hidden'} rounded-[4px] tracking-tight`}
              >
                <button>Update User</button>
              </div>
              <div
                onClick={() => openadd('', '', '', '', '', 'CREATE')}
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
            <div className='absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-black/50'>
              <div className='w-[30%] rounded-lg bg-white p-5'>
                <div className='flex items-center justify-between'>
                  <div className='text-[1.2rem] font-semibold'>Delete User</div>
                  <div className='cursor-pointer' onClick={() => setOpenDeletePopup(false)}>
                    <IoClose />
                  </div>
                </div>
                <div className='mt-5 text-[0.9rem]'>
                  Are you sure you want to delete the selected user?
                </div>
                <div className='mt-5 flex items-center justify-end gap-3'>
                  <div className='cursor-pointer rounded-[4px] bg-[#5932EA] px-2 py-1 text-sm tracking-tight text-white'>
                    <button onClick={deleteUser}>Yes</button>
                  </div>
                  <div className='cursor-pointer rounded-[4px] bg-[#5932EA] px-2 py-1 text-sm tracking-tight text-white'>
                    <button>No</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* this is the option designation div  */}

          <div className='mt-10 flex w-full items-center justify-between pb-5 px-10 text-sm'>
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

          {list.map((user, i) => (
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

        {adduser ? (
          <div className='absolute right-0 top-0 flex h-full w-full items-start justify-center bg-blue-500/30 pt-10 backdrop-blur-sm'>
            {/* this is the internal div  */}

            <div className='h-[80%] w-[40%] rounded-lg bg-white py-5 pl-14 pr-10'>
              {/* this is the close button div */}
              <div
                onClick={() => setadd(false)}
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
                      name='name'
                      id='name'
                      value={formData.name}
                      onChange={handleInputChange}
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
                      name='age'
                      id='age'
                      value={formData.age}
                      onChange={handleInputChange}
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
                    <select
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold text-black/50 outline-none'
                      name='gender'
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value=''>Select Gender</option>
                      <option value='MALE'>MALE</option>
                      <option value='FEMALE'>FEMALE</option>
                    </select>
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
                      name='phone'
                      value={formData.phone}
                      onChange={handleInputChange}
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
                      name='email'
                      value={formData.email}
                      onChange={handleInputChange}
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
                      className='h-full w-full rounded-md bg-black/10 px-3 font-semibold text-black/50 outline-none'
                      name='role'
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value='user'>AGENT</option>
                      <option value='agent'>TEAM_LEADER</option>
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
                  onClick={() => setadd(false)}
                  className='cursor-pointer rounded-sm border px-3 py-1'
                >
                  Cancel
                </div>
                <div
                  onClick={updateOrCreate === 'UPDATE' ? updateUser : addUser}
                  className='cursor-pointer rounded-sm bg-[#5932EA] px-3 py-1 text-white'
                >
                  {updateOrCreate === 'UPDATE' ? 'Update' : 'Add'}
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
