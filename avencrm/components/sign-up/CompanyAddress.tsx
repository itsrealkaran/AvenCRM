'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp } from "@/contexts/SignUpContext"
import { useState } from 'react'
import { Upload } from 'lucide-react'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export default function CompanyAddress({ onNext, onBack }: StepProps) {
  const { companyAddress, companyCity, companyCountry, companyLogo, updateField } = useSignUp()
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateField('companyLogo', base64String)
        setLogoPreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Company Address</h2>
        <p className="text-sm text-gray-500">Please provide your company address details.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-logo">Company Logo</Label>
          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('company-logo')?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Logo
            </Button>
            <Input 
              id="company-logo" 
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
            {logoPreview && (
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img src={logoPreview || "/placeholder.svg"} alt="Company Logo" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-address">Address</Label>
          <Input 
            id="company-address" 
            placeholder="Enter company address" 
            value={companyAddress}
            onChange={(e) => updateField('companyAddress', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-city">City</Label>
          <Input 
            id="company-city" 
            placeholder="Enter city" 
            value={companyCity}
            onChange={(e) => updateField('companyCity', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-country">Country</Label>
          <Input 
            id="company-country" 
            placeholder="Enter country" 
            value={companyCountry}
            onChange={(e) => updateField('companyCountry', e.target.value)}
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

