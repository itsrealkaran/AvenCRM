'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSignUp } from '@/contexts/SignUpContext'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from "@/lib/utils"

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
]

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan", "India", "United Arab Emirates",
  "China", "Brazil", "Mexico", "Spain", "Italy", "Netherlands", "Switzerland", "Sweden", "Singapore", "South Korea"
]

interface StepProps {
  onNext: () => void
  onBack: () => void
}

export default function Preferences({ onNext, onBack }: StepProps) {
  const { preferredCurrency, countriesOfOperation, updateField } = useSignUp()
  const [countryInput, setCountryInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>(countriesOfOperation || [])
  const suggestionRef = useRef<HTMLUListElement>(null)

  const updateCountriesOfOperation = useCallback((countries: string[]) => {
    updateField('countriesOfOperation', countries)
  }, [updateField])

  useEffect(() => {
    if (JSON.stringify(selectedCountries) !== JSON.stringify(countriesOfOperation)) {
      updateCountriesOfOperation(selectedCountries)
    }
  }, [selectedCountries, countriesOfOperation, updateCountriesOfOperation])

  const handleCurrencyChange = (value: string) => {
    updateField('preferredCurrency', value)
  }

  const handleCountryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setCountryInput(input)
    if (input.length > 0) {
      const filtered = countries.filter(country => 
        country.toLowerCase().includes(input.toLowerCase()) &&
        !selectedCountries.includes(country)
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }

  const addCountry = useCallback((country: string) => {
    if (countries.includes(country) && !selectedCountries.includes(country)) {
      setSelectedCountries(prev => [...prev, country])
      setCountryInput('')
      setSuggestions([])
    }
  }, [selectedCountries])

  const removeCountry = useCallback((country: string) => {
    setSelectedCountries(prev => prev.filter(c => c !== country))
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault()
      addCountry(suggestions[0])
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setSuggestions([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Preferences</h2>
        <p className="text-sm text-gray-500">Set your preferred currency and countries of operation.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="preferred-currency">Preferred Currency</Label>
          <Select onValueChange={handleCurrencyChange} value={preferredCurrency}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  <span className="font-medium">{currency.symbol}</span>
                  <span className="ml-2">{currency.name}</span>
                  <span className="ml-auto text-gray-500">({currency.code})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country-input">Countries of Operation</Label>
          <div className="relative">
            <Input
              id="country-input"
              placeholder="Type to search countries..."
              value={countryInput}
              onChange={handleCountryInputChange}
              onKeyDown={handleKeyDown}
            />
            {suggestions.length > 0 && (
              <ul 
                ref={suggestionRef}
                className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg"
              >
                {suggestions.map((country) => (
                  <li
                    key={country}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addCountry(country)}
                  >
                    {country}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {selectedCountries.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Countries</Label>
            <div className="flex flex-wrap gap-2">
              {selectedCountries.map((country) => (
                <motion.div
                  key={country}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center"
                >
                  {country}
                  <button
                    onClick={() => removeCountry(country)}
                    className="ml-2 text-primary hover:text-primary/80 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove {country}</span>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button variant="outline" onClick={onBack} className="w-full">Back</Button>
        <Button onClick={onNext} className="w-full">Continue</Button>
      </div>
    </motion.div>
  )
}

