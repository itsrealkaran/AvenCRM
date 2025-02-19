'use client';

import type React from 'react';
import { createContext, useContext, useState } from 'react';

interface SignUpContextType {
  userId: string;
  companyId: string;
  accountType: string;
  plan: string;
  billingFrequency: string;
  companyName: string;
  companyEmail: string;
  companyWebsite: string;
  companyLogo: string; // New field for company logo
  companyPhone: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companySize: string;
  currency: string;
  fullName: string;
  email: string;
  phone: string;
  price: number;
  password: string;
  preferredCurrency: string;
  countriesOfOperation: string[];
  gender: string; // Added gender field
  userCount: number;
  updateField: (field: string, value: any) => void;
}

const SignUpContext = createContext<SignUpContextType | undefined>(undefined);

export const useSignUp = () => {
  const context = useContext(SignUpContext);
  if (!context) {
    throw new Error('useSignUp must be used within a SignUpProvider');
  }
  return context;
};

export const SignUpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    userId: '',
    companyId: '',
    accountType: 'company',
    plan: 'trial',
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
    currency: 'USD',
    fullName: '',
    email: '',
    phone: '',
    price: 0,
    password: '',
    preferredCurrency: 'USD',
    countriesOfOperation: [], // Initialize as an empty array
    gender: '', // Initialize gender field
    userCount: 1,
  });

  const updateField = (field: string, value: any) => {
    setState((prev) => {
      const newState = { ...prev, [field]: value };
      console.log(`Updated ${field}:`, value); // Log the update
      return newState;
    });
  };

  return (
    <SignUpContext.Provider value={{ ...state, updateField }}>{children}</SignUpContext.Provider>
  );
};
