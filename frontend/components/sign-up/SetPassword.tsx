'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUp } from '@/contexts/SignUpContext';
import { motion } from 'framer-motion';
import { AlertCircle, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const passwordRequirements = [
  { id: 'length', text: 'At least 8 characters' },
  { id: 'uppercase', text: 'At least one uppercase letter' },
  { id: 'lowercase', text: 'At least one lowercase letter' },
  { id: 'number', text: 'At least one number' },
  { id: 'special', text: 'At least one special character' },
];

export default function SetPassword({ onNext, onBack }: StepProps) {
  const { password, updateField, ...formData } = useSignUp();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [requirements, setRequirements] = useState<{ [key: string]: boolean }>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPasswordStrength = (pwd: string) => {
    const newRequirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^a-zA-Z0-9]/.test(pwd),
    };
    setRequirements(newRequirements);
    return Object.values(newRequirements).filter(Boolean).length;
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('password', e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const isNextDisabled = password.length < 8 || !passwordMatch || passwordStrength < 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const personalData = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender?.toUpperCase(),
        password,
      };

      const companyData = {
        name: formData.companyName,
        email: formData.companyEmail,
        website: formData.companyWebsite || null,
        logo: formData.companyLogo || null,
        phone: formData.companyPhone,
        address: formData.companyAddress,
        city: formData.companyCity,
        country: formData.companyCountry,
        size: formData.companySize,
        userCount: formData.userCount,
        preferredCurrency: formData.preferredCurrency,
        countriesOfOperation: formData.countriesOfOperation,
      };

      const subscriptionData = {
        accountType: formData.accountType,
        plan: formData.plan,
        billingFrequency: formData.billingFrequency,
        userCount: formData.userCount,
        currency: formData.currency,
      };

      const { data } = await api.post('/auth/sign-up', { personalData, companyData });
      
      updateField('userId', data.userId);
      updateField('companyId', data.companyId);

      onNext(); // Move to the Success step
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold'>Set Password</h2>
        <p className='text-sm text-gray-500'>Create a strong password to secure your account.</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            type='password'
            placeholder='Enter your password'
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='confirm-password'>Confirm Password</Label>
          <Input
            id='confirm-password'
            type='password'
            placeholder='Confirm your password'
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
          />
        </div>
        {!passwordMatch && confirmPassword.length > 0 && (
          <p className='text-sm text-destructive flex items-center'>
            <AlertCircle className='w-4 h-4 mr-1' />
            Passwords do not match
          </p>
        )}

        <div className='space-y-2'>
          <Label>Password Requirements</Label>
          <ul className='space-y-1'>
            {passwordRequirements.map((req) => (
              <li key={req.id} className='flex items-center text-sm'>
                {requirements[req.id] ? (
                  <Check className='w-4 h-4 mr-2 text-green-500' />
                ) : (
                  <X className='w-4 h-4 mr-2 text-red-500' />
                )}
                {req.text}
              </li>
            ))}
          </ul>
        </div>
        {error && <p className='text-sm text-destructive'>{error}</p>}

        <div className='flex gap-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onBack}
            className='w-full border-2 border-[#5932EA] text-[#5932EA] font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#5932EA] hover:text-white'
          >
            Back
          </Button>
          <Button
            type='submit'
            className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={isLoading || isNextDisabled}
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
