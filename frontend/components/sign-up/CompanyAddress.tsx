'use client';

import { useState } from 'react';
import { useSignUp } from '@/contexts/SignUpContext';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function CompanyAddress({ onNext, onBack }: StepProps) {
  const { companyAddress, companyCity, companyCountry, companyLogo, updateField } = useSignUp();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateField('companyLogo', base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold text-gray-900'>Company Address</h2>
        <p className='text-sm text-gray-500'>Please provide your company address details.</p>
      </div>

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='company-logo'>Company Logo</Label>
          <div className='flex items-center space-x-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => document.getElementById('company-logo')?.click()}
              className='w-full'
            >
              <Upload className='w-4 h-4 mr-2' />
              Upload Logo
            </Button>
            <Input
              id='company-logo'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleLogoUpload}
            />
            {logoPreview && (
              <div className='w-16 h-16 rounded-full overflow-hidden'>
                <img
                  src={logoPreview || '/placeholder.svg'}
                  alt='Company Logo'
                  className='w-full h-full object-cover'
                />
              </div>
            )}
          </div>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='company-address'>Address</Label>
          <Input
            id='company-address'
            placeholder='Enter company address'
            value={companyAddress}
            onChange={(e) => updateField('companyAddress', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='company-city'>City</Label>
          <Input
            id='company-city'
            placeholder='Enter city'
            value={companyCity}
            onChange={(e) => updateField('companyCity', e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='company-country'>Country</Label>
          <Input
            id='company-country'
            placeholder='Enter country'
            value={companyCountry}
            onChange={(e) => updateField('companyCountry', e.target.value)}
          />
        </div>
      </div>

      <div className='flex gap-4'>
        <Button
          variant='outline'
          onClick={onBack}
          className='w-full border-2 border-[#5932EA] text-[#5932EA] font-semibold py-3 rounded-lg transition-all duration-300 ease-in-out hover:bg-[#5932EA] hover:text-white'
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105'
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
