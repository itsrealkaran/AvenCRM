import React from 'react'
import CrashStatus from "@/components/crashReport/CrashStatus"

export default function page() {
  return (
    <div className='p-4 flex flex-col gap-6'>
      <div className='flex'>

<CrashStatus/>
      </div>
    </div>
  )
}
