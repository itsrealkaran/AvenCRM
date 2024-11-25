const ManageUserList = () => {

  return (
    <div className=' w-full py-4 px-5 relative bg-[#F5F5F5] rounded-lg flex justify-between items-center'>
    {/* this is teh checkbox div */}
    <div className='w-fit  flex items-center cursor-pointer justify-center'>
      <input className='w-5 h-5 cursor-pointer' type="checkbox" name="" id="" />
    </div>

    {/* this is the name with the image div  */}

    <div className='flex items-center  justify-center pr-10 gap-[5.5px] w-[23%]'>
                <div className='w-6 h-6 rounded-full overflow-hidden '>
                  <img className='w-full h-full object-cover' src="https://images.pexels.com/photos/22468584/pexels-photo-22468584/free-photo-of-woman-sitting-on-bed-with-flowers.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="not showing " />
                </div>
                <h1 className=' opacity-70'>isagi yoichi</h1>
    </div>

{/* this is the email div */}
    <div className='opacity-70 w-[23%] flex justify-center pr-5'> 
      <h1>nikochan@256.com</h1>
    </div>

    {/* this is the phone number div  */}

    <div className='opacity-70 w-[25%] flex justify-center pr-20'>
      <h1>8005602455</h1>
    </div>

    {/* this is the status of the user div */}

    <div className='capitalize w-[15%] flex justify-center text-blue-700'>
      <h1>
        agent
      </h1>
    </div>



  </div>
  )
}

export default ManageUserList