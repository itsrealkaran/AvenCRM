"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp } from "@/contexts/SignUpContext"

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export default function CompanyDetails({ onNext, onBack }: StepProps) {
  const { companyName, companyEmail, companyPhone, companyWebsite, updateField } = useSignUp()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Company Details</h2>
        <p className="text-sm text-gray-500">Please provide your company information.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="Enter company name"
            value={companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-email">Company Email</Label>
          <Input
            id="company-email"
            type="email"
            placeholder="Enter company email"
            value={companyEmail}
            onChange={(e) => updateField("companyEmail", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-phone">Company Phone</Label>
          <Input
            id="company-phone"
            placeholder="Enter company phone number"
            value={companyPhone}
            onChange={(e) => updateField("companyPhone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-website">Website</Label>
          <Input
            id="company-website"
            placeholder="Enter company website"
            value={companyWebsite}
            onChange={(e) => updateField("companyWebsite", e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full border-2 border-[#5932EA] text-[#5932EA] font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#5932EA] hover:text-white"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  )
}

