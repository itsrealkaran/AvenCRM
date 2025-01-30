"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useSignUp } from "@/contexts/SignUpContext"
import { Check, X, Users, CalendarDays } from "lucide-react"

interface StepProps {
  onNext: (userCount?: number) => void
}

const FreeTrial = () => (
  <div className="border-2 border-[#5932EA] rounded-xl p-6 space-y-4">
    <h3 className="text-xl font-bold text-[#5932EA]">14-Day Free Trial</h3>
    <p className="text-gray-600">Experience all features with no commitment.</p>
    <div className="flex items-center text-gray-600">
      <CalendarDays className="mr-2 h-5 w-5" />
      <span>Full access for 14 days</span>
    </div>
  </div>
)

const planOptions = {
  individual: [
    { name: "Basic", price: { monthly: 19, yearly: 190 } },
    { name: "Premium", price: { monthly: 39, yearly: 390 } },
    { name: "Enterprise", price: { monthly: 79, yearly: 790 } },
  ],
  company: [
    { name: "Basic", price: { monthly: 29, yearly: 290 } },
    { name: "Premium", price: { monthly: 59, yearly: 590 } },
    { name: "Enterprise", price: { monthly: 99, yearly: 990 } },
  ],
}

export default function PlanSelection({ onNext }: StepProps) {
  const { billingFrequency, updateField } = useSignUp()
  const [plan, setPlan] = useState("")
  const [userCount, setUserCount] = useState(1)
  const [showFreeTrial, setShowFreeTrial] = useState(false)
  const [totalPrice, setTotalPrice] = useState(0)

  const isYearly = billingFrequency === "yearly"

  const handlePlanChange = (value: string) => {
    if (value === plan) {
      setPlan("")
      updateField("plan", "")
    } else {
      setPlan(value)
      updateField("plan", value)
    }
    setShowFreeTrial(false)
  }

  const toggleFreeTrial = () => {
    setShowFreeTrial(!showFreeTrial)
    if (!showFreeTrial) {
      setPlan("basic")
      updateField("plan", "basic")
    } else {
      setPlan("")
      updateField("plan", "")
    }
  }

  useEffect(() => {
    if (!showFreeTrial) {
      const accountType = "company"
      const selectedPlan = planOptions[accountType].find((p) => p.name.toLowerCase() === plan)
      if (selectedPlan) {
        const price = isYearly ? selectedPlan.price.yearly : selectedPlan.price.monthly
        setTotalPrice(price * userCount)
      }
    } else {
      setTotalPrice(0)
    }
  }, [plan, billingFrequency, userCount, showFreeTrial, isYearly])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Choose your plan</h2>
        <p className="text-sm text-gray-500">Select the plan that suits your needs or start with a free trial.</p>
      </div>

      {!showFreeTrial && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Billing Frequency</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${!isYearly ? "font-medium" : ""}`}>Monthly</span>
            <Switch
              checked={isYearly}
              onCheckedChange={(checked) => updateField("billingFrequency", checked ? "yearly" : "monthly")}
              className="bg-gray-200 data-[state=checked]:bg-[#5932EA]"
            />
            <span className={`text-sm ${isYearly ? "font-medium" : ""}`}>Yearly</span>
          </div>
        </div>
      )}

      <div className="space-y-3 max-w-5xl mx-auto">
        <Button
          variant="outline"
          onClick={toggleFreeTrial}
          className={`w-full justify-between ${showFreeTrial ? "border-[#5932EA] text-[#5932EA]" : ""}`}
        >
          <span>Try Free for 14 Days</span>
          {showFreeTrial ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>

        {showFreeTrial ? (
          <FreeTrial />
        ) : (
          <>
            <div className={`grid ${plan ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"} gap-2 pt-4`}>
              {planOptions.company.map((option) =>
                plan === "" || plan === option.name.toLowerCase() ? (
                  <Button
                    key={option.name}
                    onClick={() => handlePlanChange(option.name.toLowerCase())}
                    variant="outline"
                    className={`flex flex-col h-full items-start justify-between rounded-xl border-2 p-6 hover:bg-gray-50 hover:border-gray-300 
                    ${
                      plan === option.name.toLowerCase() ? "border-[#5932EA] ring-1 ring-[#5932EA]" : "border-muted"
                    } transition-all duration-200 text-left`}
                  >
                    <div className="flex w-full flex-col space-y-4">
                      <h3 className="text-lg font-bold text-left">{option.name}</h3>
                      <div>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold">
                            ${(isYearly ? option.price.yearly : option.price.monthly) * userCount}
                          </span>
                          <span className="text-sm font-normal text-gray-500 ml-1">/{isYearly ? "year" : "month"}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-2">
                          <Users className="inline-block mr-1 h-4 w-4" />
                          <span>
                            {userCount} user{userCount > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Button>
                ) : null,
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-count">Number of Users</Label>
              <Input
                id="user-count"
                type="number"
                min="1"
                max={planOptions.company.find((p) => p.name.toLowerCase() === plan)?.maxUsers || 999}
                value={userCount}
                onChange={(e) => {
                  const newUserCount = Math.max(1, Number.parseInt(e.target.value) || 1)
                  setUserCount(newUserCount)
                  updateField("userCount", newUserCount)
                }}
                className="w-full"
                disabled={!plan}
              />
            </div>
          </>
        )}
      </div>

      <Button
        onClick={() => onNext(userCount)}
        className="w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!showFreeTrial && !plan}
      >
        {showFreeTrial
          ? "Start Free Trial"
          : plan
            ? "Continue with " + plan.charAt(0).toUpperCase() + plan.slice(1)
            : "Select a Plan"}
      </Button>
    </motion.div>
  )
}

