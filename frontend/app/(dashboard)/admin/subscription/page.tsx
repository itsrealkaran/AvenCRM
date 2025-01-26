"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import { FaCheck } from "react-icons/fa"

import { StripeModal } from "@/components/stripe/stripe-modal"
import { Card } from "@/components/ui/card"
import { TransactionHistoryTable } from "./transaction-history"

interface Payment {
  id: string
  amount: number
  date: string
  planType: string
  isSuccessfull: boolean
  createdAt: string
}

const plans = {
  basic: {
    id: "BASIC",
    name: "Basic",
    price: 99,
    features: [
      "All Analytics features",
      "Up to 250,000 tracked visits",
      "Normal support",
      "Up to 3 team members",
      "All analytics features",
      "Normal support",
    ],
  },
  popular: {
    id: "PROFESSIONAL",
    name: "Proffesional",
    price: 199,
    features: [
      "All Analytics features",
      "Up to 1,000,000 tracked visits",
      "Premium support",
      "Up to 10 team members",
      "All analytics features",
      "Priority support",
    ],
  },
}

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof plans.basic | typeof plans.popular | null>(null)

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/subscription/getsubscription`, {
          withCredentials: true,
        })
        setPayments(response.data || [])
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const handlePayment = (plan: typeof plans.basic | typeof plans.popular) => {
    setSelectedPlan(plan)
    setIsModalOpen(true)
  }

  return (
    <section className="h-full">
      <Card className="container space-y-4 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your plan and subscription</p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Basic plan */}
          <div className="rounded-2xl bg-blue-50 shadow-sm transition hover:shadow-md">
            <div className="flex">
              <div className="flex-1 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100">
                    <div className="h-8 w-8 overflow-hidden rounded-full">
                      <div className="flex h-full w-full">
                        <div className="h-full w-1/2 bg-blue-400"></div>
                        <div className="h-full w-1/2 bg-blue-600"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">For individuals</p>
                    <h2 className="mt-1 text-2xl font-semibold text-blue-900">Basic</h2>
                  </div>
                </div>
                <p className="mt-4 text-blue-600">
                  Perfect for individuals and small teams getting started with our platform.
                </p>
                <div className="flex gap-4">
                  <div className="flex-col">
                    <div className="text-blue-900 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium">Status</div>
                    <div className="mt-2 px-4 text-sm font-medium text-emerald-600">Active</div>
                  </div>
                  <div className="flex-col">
                    <div className="text-blue-900 rounded-lg bg-blue-100 px-4 py-2 text-sm font-medium">DueDate</div>
                    <div className="mt-2 px-4 text-sm font-medium text-blue-600">14/05/25</div>
                  </div>
                </div>
                <button
                  onClick={() => handlePayment(plans.basic)}
                  className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Pay now
                </button>
              </div>
              <div className="flex-1 border-l border-blue-100 p-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-900">${plans.basic.price}</span>
                  <span className="text-sm text-blue-600">/monthly</span>
                </div>
                <h3 className="mt-6 font-semibold text-blue-900">What&apos;s included</h3>
                <ul className="mt-4 space-y-3">
                  {plans.basic.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">
                        <FaCheck />
                      </div>
                      <span className="text-sm text-blue-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Popular plan details */}
          <div className="rounded-2xl bg-yellow-50 shadow-sm transition hover:shadow-md">
            <div className="flex">
              <div className="flex-1 p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100">
                    <div className="h-8 w-8 overflow-hidden rounded-lg">
                      <div className="flex h-full w-full">
                        <div className="h-full w-1/2 bg-yellow-400"></div>
                        <div className="h-full w-1/2 bg-yellow-600"></div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-600">For larger agencies</p>
                    <h2 className="mt-1 text-2xl font-semibold text-yellow-900">Proffestional</h2>
                  </div>
                </div>
                <p className="mt-4 text-yellow-600">Ideal for growing businesses that need more power and features.</p>
                <button
                  onClick={() => handlePayment(plans.popular)}
                  className="mt-16 w-full rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-yellow-700"
                >
                  Upgrade
                </button>
              </div>
              <div className="flex-1 border-l border-yellow-100 p-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-yellow-900">${plans.popular.price}</span>
                  <span className="text-sm text-yellow-600">/monthly</span>
                </div>
                <h3 className="mt-6 font-semibold text-yellow-900">What&apos;s included</h3>
                <ul className="mt-4 space-y-3">
                  {plans.popular.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-600 text-[10px] text-white">
                        <FaCheck />
                      </div>
                      <span className="text-sm text-yellow-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">Transaction History</h3>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-4">No payment history found</div>
          ) : (
            <TransactionHistoryTable data={payments} />
          )}
        </div>

        {/* Stripe Modal */}
        {selectedPlan && (
          <StripeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            planId={selectedPlan.id}
            planName={selectedPlan.name}
            price={selectedPlan.price}
          />
        )}
      </Card>
    </section>
  )
}

export default Page

