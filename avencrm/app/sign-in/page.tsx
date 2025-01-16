'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-gray-500">
                Sign in to your account to continue.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex justify-between items-center">
                <Link href="/forgot-password" className="text-sm text-[#00A0A0] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button 
                className="w-full h-12 text-base bg-[#00A0A0] hover:bg-[#008080]"
              >
                Sign in
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500">
              By proceeding, you agree to our{" "}
              <Link href="/terms" className="text-[#00A0A0] hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-[#00A0A0] hover:underline">
                Privacy Policy
              </Link>
            </div>

            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-[#00A0A0] hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </motion.div>
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
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-10%20123655-gIB3adoiV1W28XDtGA3agAiNUDEqK4.png"
                alt="CRM Dashboard Preview"
                width={800}
                height={600}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

