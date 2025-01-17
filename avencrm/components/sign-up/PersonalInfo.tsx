'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSignUp } from '@/contexts/SignUpContext'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export default function PersonalInfo({ onNext, onBack }: StepProps) {
  const { fullName, email, phone, gender, updateField } = useSignUp()

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Personal Information</h2>
        <p className="text-sm text-gray-500">Please provide your personal details.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            placeholder="Enter your full name" 
            value={fullName}
            onChange={(e) => updateField('fullName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => updateField('email', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={gender}
            onValueChange={(value) => updateField('gender', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input 
            id="phone" 
            placeholder="Enter your phone number" 
            value={phone}
            onChange={(e) => updateField('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="w-full">Back</Button>
        <Button onClick={onNext} className="w-full">Continue</Button>
      </div>
    </motion.div>
  )
}

