'use client'

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSignUp } from '../../contexts/SignUpContext'
import { AlertCircle, Check, X } from 'lucide-react'
import { signUp } from '../../app/utils/api'
import { useRouter } from 'next/navigation'

interface StepProps {
  onNext: () => void
  onBack: () => void
}

const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters' },
  { id: 'uppercase', text: 'At least one uppercase letter' },
  { id: 'lowercase', text: 'At least one lowercase letter' },
  { id: 'number', text: 'At least one number' },
  { id: 'special', text: 'At least one special character' },
]

export default function SetPassword({ onNext, onBack }: StepProps) {
  const router = useRouter()
  const { password, updateField, ...formData } = useSignUp()
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [requirements, setRequirements] = useState<{[key: string]: boolean}>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPasswordStrength = (pwd: string) => {
    const newRequirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
    }
    setRequirements(newRequirements)
    return Object.values(newRequirements).filter(Boolean).length
  }

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password))
    setPasswordMatch(password === confirmPassword)
  }, [password, confirmPassword])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('password', e.target.value)
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
  }

  const isNextDisabled = password.length < 8 || !passwordMatch || passwordStrength < 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const data = await signUp({ ...formData, password })
      console.log('Sign-up successful:', data)
      onNext() // Move to the Success step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
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
        <h2 className="text-2xl font-semibold">Set Password</h2>
        <p className="text-sm text-gray-500">Create a strong password to secure your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="Enter your password" 
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input 
            id="confirm-password" 
            type="password" 
            placeholder="Confirm your password" 
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </div>
        {!passwordMatch && confirmPassword.length > 0 && (
          <p className="text-sm text-destructive flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Passwords do not match
          </p>
        )}


        <div className="space-y-2">
          <Label>Password Requirements</Label>
          <ul className="space-y-1">
            {passwordRequirements.map((req) => (
              <li key={req.id} className="flex items-center text-sm">
                {requirements[req.id] ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <X className="w-4 h-4 mr-2 text-red-500" />
                )}
                {req.text}
              </li>
            ))}
          </ul>
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={onBack} className="w-full">
            Back
          </Button>
          <Button type="submit" className="w-full" disabled={isLoading || isNextDisabled}>
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

