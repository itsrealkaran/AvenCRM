"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from 'lucide-react'

interface Brand {
  name: string
  services: string
  description?: string
}

const brands: Brand[] = [
  {
    name: "REALTOR CRM",
    services: "LEAD MANAGEMENT - CONTACT ORGANIZATION - TASK AUTOMATION",
    description: "Realtor CRM is a comprehensive solution designed specifically for real estate professionals. It offers robust lead management tools, intuitive contact organization, and powerful task automation features to streamline your real estate business operations."
  },
  {
    name: "PROPERTYPRO",
    services: "PROPERTY LISTINGS - CLIENT COMMUNICATION - TRANSACTION MANAGEMENT",
    description: "PropertyPro is an all-in-one platform for real estate agents and brokers. It provides seamless property listing management, efficient client communication tools, and comprehensive transaction management to ensure smooth deal closures."
  },
  {
    name: "ESTATEHUB",
    services: "MARKETING AUTOMATION - ANALYTICS - MOBILE APP",
    description: "EstateHub focuses on empowering real estate professionals with cutting-edge technology. Its marketing automation tools, in-depth analytics, and user-friendly mobile app help agents stay connected and make data-driven decisions on the go."
  },
  {
    name: "HOMEBASE CRM",
    services: "TEAM COLLABORATION - DOCUMENT MANAGEMENT - REPORTING",
    description: "HomeBase CRM is designed for real estate teams and brokerages. It offers robust team collaboration features, centralized document management, and comprehensive reporting tools to boost productivity and transparency across your organization."
  },
  {
    name: "AGENTCONNECT",
    services: "SOCIAL MEDIA INTEGRATION - EMAIL MARKETING - LEAD SCORING",
    description: "AgentConnect specializes in modern real estate marketing. With its social media integration, targeted email marketing campaigns, and intelligent lead scoring system, it helps agents build strong online presence and convert more leads."
  },
  {
    name: "REALESTATE SUITE",
    services: "PROPERTY VALUATION - CUSTOMER SUPPORT - INTEGRATIONS",
    description: "RealEstate Suite offers a comprehensive toolkit for real estate professionals. Its standout features include accurate property valuation tools, dedicated customer support systems, and seamless integrations with other popular real estate software."
  },
  {
    name: "PROPTECH SOLUTIONS",
    services: "AI-POWERED INSIGHTS - VIRTUAL TOURS - BLOCKCHAIN INTEGRATION",
    description: "PropTech Solutions is at the forefront of real estate technology. Leveraging AI for market insights, offering immersive virtual property tours, and utilizing blockchain for secure transactions, it's shaping the future of real estate CRM."
  }
]

export function BrandsSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  return (
    <section className="py-24 px-4 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-medium mb-16 text-[#2a2a2b]"
        >
          BRANDS WE'VE WORKED WITH
        </motion.h2>

        <div className="space-y-px">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-200"
            >
              <div 
                className="py-6 grid grid-cols-1 md:grid-cols-[1fr,2fr,auto] gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="text-lg font-medium text-[#2a2a2b]">{brand.name}</div>
                <div className="text-gray-600">{brand.services}</div>
                <div className="flex items-center justify-end">
                  {expandedIndex === index ? (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">LESS</span>
                      <Minus className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-600">
                      <span className="mr-2">MORE</span>
                      <Plus className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expandedIndex === index && brand.description && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 pr-24">
                      <p className="text-gray-600 leading-relaxed">
                        {brand.description}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

