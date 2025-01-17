"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface PricingPlan {
  name: string
  description: string
  price: {
    monthly: number
    annually: number
  }
  features: string[]
  type: string
  popular?: boolean
}

const companyPlans: PricingPlan[] = [
  {
    name: "Basic",
    description: "For small companies",
    price: {
      monthly: 99,
      annually: 89
    },
    features: [
      "All analytics features",
      "Up to 250,000 tracked visits",
      "Normal support",
      "Up to 3 team members"
    ],
    type: "basic"
  },
  {
    name: "Premium",
    description: "For companies",
    price: {
      monthly: 199,
      annually: 179
    },
    features: [
      "All analytics features",
      "Up to 1,000,000 tracked visits",
      "Premium support",
      "Up to 10 team members"
    ],
    type: "premium",
    popular: true
  },
  {
    name: "Enterprise",
    description: "For big companies",
    price: {
      monthly: 399,
      annually: 359
    },
    features: [
      "All analytics features",
      "Up to 5,000,000 tracked visits",
      "Dedicated support",
      "Up to 50 team members"
    ],
    type: "enterprise"
  }
]

const individualPlans: PricingPlan[] = [
  {
    name: "Starter",
    description: "For individuals",
    price: {
      monthly: 49,
      annually: 44
    },
    features: [
      "Basic analytics features",
      "Up to 100,000 tracked visits",
      "Email support",
      "1 user"
    ],
    type: "starter"
  },
  {
    name: "Pro",
    description: "For professionals",
    price: {
      monthly: 99,
      annually: 89
    },
    features: [
      "Advanced analytics features",
      "Up to 500,000 tracked visits",
      "Priority email support",
      "1 user"
    ],
    type: "pro",
    popular: true
  },
  {
    name: "Team",
    description: "For small teams",
    price: {
      monthly: 199,
      annually: 179
    },
    features: [
      "All analytics features",
      "Up to 1,000,000 tracked visits",
      "24/7 phone support",
      "Up to 5 team members"
    ],
    type: "team"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 100
    }
  }
}

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [isIndividual, setIsIndividual] = useState(false)

  const plans = isIndividual ? individualPlans : companyPlans

  return (
    <div className="pt-12 pb-16 px-4">
      {/* <div className="pt-12 pb-16 px-4 bg-[#eff0f6]"></div> */}
      <motion.div 
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="text-center mb-14">
          <motion.div variants={itemVariants} className="flex items-center justify-center">
            <span className="text-sm font-bold text-[#303030]">PRICING</span>
          </motion.div>
          <div className="flex justify-end mb-4">
          <Button 
            variant="ghost" 
            className="text-[#6f6c90] group transition-all"
            onClick={() => setIsIndividual(!isIndividual)}
          >
            {isIndividual ? 'For Companies' : 'For Individuals'}
            <motion.span 
              className="ml-2 inline-block"
              initial={false}
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              »
            </motion.span>
          </Button>
        </div>
          <motion.h2 
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold text-[#222222] mb-6"
          >
            Simple, transparent pricing
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-lg text-[#6f6c90] max-w-2xl mx-auto"
          >
            Choose the plan that's right for you with our clear, competitive pricing. Perfect for individuals and businesses alike.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center gap-4 mt-8"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-[#222222]' : 'text-[#6f6c90]'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="bg-[#ecebff] data-[state=checked]:bg-[#4a3aff]"
            />
            <span className={`text-sm font-medium ${isAnnual ? 'text-[#222222]' : 'text-[#6f6c90]'}`}>
              Annually
            </span>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={isIndividual ? 'individual' : 'company'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-3 gap-8 mb-10"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan.type}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <div className={`p-8 h-full flex flex-col rounded-2xl ${
                  plan.popular 
                    ? 'bg-[#2c3b47] text-white' 
                    : 'bg-gray-50 mt-16 border border-[#d9dbe9]'
                }`}>
                  {plan.popular && (
                    <span className="absolute top-4 right-4 text-xs font-medium bg-[#00bdbd] text-white px-3 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                  
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-[#F2F1FF]'>
                        <div className={`h-8 w-8 overflow-hidden ${plan.popular ? 'rounded-lg' : 'rounded-full'}`}>
                          <div className='flex h-full w-full'>
                            <div className='h-full w-1/2 bg-[#00BDBD]'></div>
                            <div className='h-full w-1/2 bg-[#B8B1FF]'></div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className={`text-sm mb-0.2 ${plan.popular ? 'text-white/80' : 'text-[#6f6c90]'}`}>
                          {plan.description}
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${isAnnual ? plan.price.annually : plan.price.monthly}
                      </span>
                      <span className={plan.popular ? 'text-white/80' : 'text-[#6f6c90]'}>
                        /monthly
                      </span>
                    </div>
                  </div>
                  

                  <div className="space-y-6 flex-grow">
                    <h4 className={`text-sm font-medium ${plan.popular ? 'text-white/90' : 'text-[#222222]'}`}>
                      What's included
                    </h4>
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 mt-0.5 ${
                            plan.popular ? 'text-[#00bdbd]' : 'text-[#4a3aff]'
                          }`} />
                          <span className={plan.popular ? 'text-white/80' : 'text-[#6f6c90]'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className={`mt-8 w-full h-12 rounded-full ${
                      plan.popular
                        ? 'bg-white text-[#2c3b47] hover:bg-white/90'
                        : 'bg-[#2c3b47] text-white hover:bg-[#2c3b47]/90'
                    }`}
                  >
                    Get started
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

