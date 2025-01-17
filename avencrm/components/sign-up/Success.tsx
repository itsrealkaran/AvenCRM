'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface StepProps {
  onNext: () => void
}

export default function Success({ onNext }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold">Sign Up Successful!</h2>
        <p className="text-sm text-gray-500">For a smoother experience, connect your accounts or skip to get started.</p>
      </div>

      <div className="space-y-4">
        <Button variant="outline" className="w-full">
          <Image src="/google.svg" alt="Google" width={20} height={20} className="mr-2" />
          Connect Google Account
        </Button>
        <Button variant="outline" className="w-full">
          <Image src="/outlook.svg" alt="Outlook" width={20} height={20} className="mr-2" />
          Connect Outlook Account
        </Button>
        <Button variant="outline" className="w-full">
          <Image src="/facebook.svg" alt="Facebook" width={20} height={20} className="mr-2" />
          Connect Facebook Account
        </Button>
      </div>

      <Button onClick={onNext} className="w-full">Skip and Get Started</Button>
    </motion.div>
  )
}

