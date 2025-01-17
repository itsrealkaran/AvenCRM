'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { SignUpProvider } from '@/contexts/SignUpContext'
import PlanSelection from '@/components/sign-up/PlanSelection'
import CompanyDetails from '@/components/sign-up/CompanyDetails'
import CompanyAddress from '@/components/sign-up/CompanyAddress'
import CompanySize from '@/components/sign-up/CompanySize'
import PersonalInfo from '@/components/sign-up/PersonalInfo'
import SetPassword from '@/components/sign-up/SetPassword'
import Preferences from '@/components/sign-up/Preferences'
import Success from '@/components/sign-up/Success'
import { Loader2 } from 'lucide-react'

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  const handleSignUpComplete = () => {
    setIsLoading(true)
    // Simulate some processing time
    setTimeout(() => {
      setIsLoading(false)
      nextStep()
    }, 1500)
  }

  return (
    <SignUpProvider>
      <div className="min-h-screen w-full flex">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col">
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center">
              <div className="w-8 h-8">
                <svg viewBox="0 0 32 32" className="w-full h-full">
                  <path
                    fill="#00A0A0"
                    d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 24c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
                  />
                </svg>
              </div>
              <span className="ml-2 text-xl font-semibold">AvenCRM</span>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center space-y-4"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Processing your sign-up...</p>
                  </motion.div>
                ) : (
                  <>
                    {step === 1 && <PlanSelection onNext={nextStep} />}
                    {step === 2 && <CompanyDetails onNext={nextStep} onBack={prevStep} />}
                    {step === 3 && <CompanyAddress onNext={nextStep} onBack={prevStep} />}
                    {step === 4 && <CompanySize onNext={nextStep} onBack={prevStep} />}
                    {step === 5 && <PersonalInfo onNext={nextStep} onBack={prevStep} />}
                    {step === 6 && <Preferences onNext={nextStep} onBack={prevStep} />}
                    {step === 7 && <SetPassword onNext={handleSignUpComplete} onBack={prevStep} />}
                    {step === 8 && <Success onNext={() => {}} />}
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:block lg:w-1/2 bg-[#E5F9F9] relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute inset-0 flex items-center justify-center p-12"
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-[#00A0A0] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-[#4A3AFF] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#00A0A0] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              <div className="relative">
                <Image
                  src={step <= 2 ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-10%20123756-KZ1WIw1V45o3xHARjw9wjPgmlAIFCq.png" : 
                       step === 3 || step === 4 ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-10%20124317-jUAELr7FIaZcXJwJRMQZILgoLIhvsS.png" : 
                       step === 5 || step === 6 || step === 7 ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-10%20123717-qvSxKbrtI7iE5k71Ldp9BFsBLRTdsd.png" :
                       "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-10%20124641-wQqzVRZEeZI3G2QJjq8zBGNw1yeKRy.png"}
                  alt="Sign up illustration"
                  width={800}
                  height={600}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SignUpProvider>
  )
}

