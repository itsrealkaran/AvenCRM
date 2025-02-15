'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SignUpProvider, useSignUp } from '@/contexts/SignUpContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import Logo from '@/components/logo';
import CompanyAddress from '@/components/sign-up/CompanyAddress';
import CompanyDetails from '@/components/sign-up/CompanyDetails';
import CompanySize from '@/components/sign-up/CompanySize';
import PaymentPage from '@/components/sign-up/PaymentPage';
import PersonalInfo from '@/components/sign-up/PersonalInfo';
import PlanSelection from '@/components/sign-up/PlanSelection';
import Preferences from '@/components/sign-up/Preferences';
import SetPassword from '@/components/sign-up/SetPassword';
import Success from '@/components/sign-up/Success';

export default function SignUp() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSignUpComplete = () => {
    setIsLoading(true);
    // Simulate some processing time
    setTimeout(() => {
      setIsLoading(false);
      nextStep();
    }, 1500);
  };

  return (
    <SignUpProvider>
      <div className='min-h-screen w-full flex bg-gradient-to-br from-[#9BF3F0] via-[#DAFFED] to-[#FFC2B4]'>
        {/* Left Side - Form */}
        <div className='w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col bg-white'>
          <div className='mb-8'>
            <Link href='/' className='inline-flex items-center'>
              <div className='text-[1.6rem] md:text-[2rem]'>
                <Logo />
              </div>
              <div className='text-[#5932ea] text-[1rem] md:text-[1.3rem] flex gap-[2px] items-end font-bold'>
                <h1>AvenCRM</h1>
              </div>
            </Link>
          </div>

          <div className='flex-1 flex items-center justify-center'>
            <div className='w-full max-w-md'>
              <AnimatePresence mode='wait'>
                {isLoading ? (
                  <motion.div
                    key='loading'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='flex flex-col items-center justify-center space-y-4'
                  >
                    <Loader2 className='h-8 w-8 animate-spin text-[#5932EA]' />
                    <p className='text-sm text-gray-500'>Processing your sign-up...</p>
                  </motion.div>
                ) : (
                  <>
                    {step === 1 && <PlanSelection onNext={nextStep} />}
                    {step === 2 && <CompanyDetails onNext={nextStep} onBack={prevStep} />}
                    {step === 3 && <CompanyAddress onNext={nextStep} onBack={prevStep} />}
                    {step === 4 && <CompanySize onNext={nextStep} onBack={prevStep} />}
                    {step === 5 && <PersonalInfo onNext={nextStep} onBack={prevStep} />}
                    {step === 6 && <Preferences onNext={nextStep} onBack={prevStep} />}
                    {step === 7 && <SetPassword onNext={nextStep} onBack={prevStep} />}
                    {step === 8 && (
                      <PaymentPage onComplete={handleSignUpComplete} onBack={prevStep} />
                    )}
                    {step === 9 && <Success onNext={nextStep} onBack={prevStep} />}
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className='hidden lg:block lg:w-1/2 relative overflow-hidden'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className='absolute inset-0 flex items-center justify-center p-12'
          >
            <div className='relative w-full max-w-lg'>
              <div className='absolute top-0 -left-4 w-72 h-72 bg-[#5932EA] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
              <div className='absolute top-0 -right-4 w-72 h-72 bg-[#9BF3F0] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
              <div className='absolute -bottom-8 left-20 w-72 h-72 bg-[#FFC2B4] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>
              <div className='relative'>
                <Image
                  src={
                    step <= 2
                      ? '/sign-in.svg'
                      : step === 3 || step === 4
                        ? '/sign-in.svg'
                        : step === 5 || step === 6 || step === 7
                          ? '/sign-in.svg'
                          : '/sign-in.svg'
                  }
                  alt='Sign up illustration'
                  width={800}
                  height={600}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SignUpProvider>
  );
}
