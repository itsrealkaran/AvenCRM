'use client'

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useSignUp } from '@/contexts/SignUpContext'

interface StepProps {
  onNext: () => void
}

const planOptions = {
  individual: [
    { name: 'Basic', price: { monthly: 19, yearly: 190 } },
    { name: 'Premium', price: { monthly: 39, yearly: 390 } },
    { name: 'Enterprise', price: { monthly: 79, yearly: 790 } },
  ],
  company: [
    { name: 'Basic', price: { monthly: 29, yearly: 290 } },
    { name: 'Premium', price: { monthly: 59, yearly: 590 } },
    { name: 'Enterprise', price: { monthly: 99, yearly: 990 } },
  ],
}

export default function PlanSelection({ onNext }: StepProps) {
  const { accountType, plan, billingFrequency, updateField } = useSignUp()

  const isYearly = billingFrequency === 'yearly'
  const currentPlanOptions = planOptions[accountType as keyof typeof planOptions]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Choose your plan</h2>
        <p className="text-sm text-gray-500">Select the type of account and plan that suits your needs.</p>
      </div>

      <div className="space-y-4">
        <Label>Account Type</Label>
        <RadioGroup 
          value={accountType} 
          onValueChange={(value) => updateField('accountType', value)} 
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <Label htmlFor="company">Company</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="individual" />
            <Label htmlFor="individual">Individual</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label>Select Plan</Label>
        <RadioGroup 
          value={plan} 
          onValueChange={(value) => updateField('plan', value)} 
          className="grid gap-4 sm:grid-cols-3"
        >
          {currentPlanOptions.map((option) => (
            <div key={option.name} className="relative">
              <RadioGroupItem
                value={option.name.toLowerCase()}
                id={option.name.toLowerCase()}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.name.toLowerCase()}
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary"
              >
                <span className="text-lg font-semibold">{option.name}</span>
                <span className="text-sm text-gray-500">
                  ${isYearly ? option.price.yearly : option.price.monthly}/{isYearly ? 'year' : 'month'}
                </span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Billing Frequency</span>
        <div className="flex items-center space-x-2">
          <span className={`text-sm ${!isYearly ? 'font-medium' : ''}`}>Monthly</span>
          <Switch
            checked={isYearly}
            onCheckedChange={(checked) => updateField('billingFrequency', checked ? 'yearly' : 'monthly')}
          />
          <span className={`text-sm ${isYearly ? 'font-medium' : ''}`}>Yearly</span>
        </div>
      </div>

      <Button onClick={onNext} className="w-full">Continue</Button>
    </motion.div>
  )
}

