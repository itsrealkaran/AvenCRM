'use client'

import React, { createContext, useContext, useState } from 'react'

interface SignUpContextType {
  accountType: string
  plan: string
  billingFrequency: string
  companyName: string
  companyEmail: string
  companyWebsite: string
  companyLogo: string // New field for company logo
  companyPhone: string
  companyAddress: string
  companyCity: string
  companyCountry: string
  companySize: string
  fullName: string
  email: string
  phone: string
  password: string
  preferredCurrency: string
  countriesOfOperation: string[]
  gender: string // Added gender field
  updateField: (field: string, value: any) => void
}

const SignUpContext = createContext<SignUpContextType | undefined>(undefined)

export const useSignUp = () => {
  const context = useContext(SignUpContext)
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider')
  }
  return context
}

export const SignUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    accountType: 'company',
    plan: 'basic',
    billingFrequency: 'monthly',
    companyName: '',
    companyEmail: '',
    companyWebsite: '',
    companyLogo: '', // Initialize the new field
    companyPhone: '',
    companyAddress: '',
    companyCity: '',
    companyCountry: '',
    companySize: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    preferredCurrency: 'USD',
    countriesOfOperation: [], // Initialize as an empty array
    gender: '', // Initialize gender field
  })

  const updateField = (field: string, value: any) => {
    setState(prev => {
      const newState = { ...prev, [field]: value }
      console.log(`Updated ${field}:`, value) // Log the update
      return newState
    })
  }

  return (
    <SignUpContext.Provider value={{ ...state, updateField }}>
      {children}
    </SignUpContext.Provider>
  )
}

