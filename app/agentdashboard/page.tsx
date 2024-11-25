import React from 'react'
import PropertyListing from './components/PropertyListing'



const page = () => {
  return (
    <div className='w-full h-full relative justify-between overflow-y-auto flex flex-wrap gap-2'>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
   <PropertyListing/>
    </div>
  )
}

export default page