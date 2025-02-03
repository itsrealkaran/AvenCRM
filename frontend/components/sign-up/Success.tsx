'use client';

import { motion } from 'framer-motion';
import { AiOutlineMail } from 'react-icons/ai';
import { BsFacebook } from 'react-icons/bs';
import { FcGoogle } from 'react-icons/fc';

import { Button } from '@/components/ui/button';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function Success({ onNext, onBack }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-6'
    >
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-semibold'>Sign Up Successful!</h2>
        <p className='text-sm text-gray-500'>
          For a smoother experience, connect your accounts or skip to get started.
        </p>
      </div>

      <div className='space-y-4'>
        <Button variant='outline' className='w-full'>
          <FcGoogle className='w-5 h-5 mr-2' />
          Connect Google Account
        </Button>
        <Button variant='outline' className='w-full'>
          <AiOutlineMail className='w-5 h-5 mr-2' />
          Connect Outlook Account
        </Button>
        <Button variant='outline' className='w-full'>
          <BsFacebook className='w-5 h-5 mr-2 text-blue-600' />
          Connect Facebook Account
        </Button>
      </div>

      <Button
        onClick={onNext}
        className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105'
      >
        Skip and Get Started
      </Button>
    </motion.div>
  );
}
