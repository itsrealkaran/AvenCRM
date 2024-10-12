//@ts-nocheck
import React from 'react'
import { Progress } from '../ui/progress'

export default function CrashStatus() {
  return (
    <div className='py-14 px-14 rounded-2xl bg-white w-[60%] space-y-8 '>
        <p className='text-lg'># Crash Status</p>

        <div>
            <div className='flex font-semibold text-gray-400 text-sm   gap-10 items-center'>
                <p>Reported Issues</p>
                <div className='w-[70%]'>
                <Progress className='h-1'   value={44} progressColor={"orange"} />
                </div>
            </div>
        </div>
        
        
    </div>
  )
}
