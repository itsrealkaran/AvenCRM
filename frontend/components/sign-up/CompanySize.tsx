'use client';

import { useSignUp } from '@/contexts/SignUpContext';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const companySizes = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export default function CompanySize({ onNext, onBack }: StepProps) {
  const { companySize, updateField } = useSignUp();

  const handleCompanySizeChange = (value: string) => {
    updateField('companySize', value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
    >
      <div className='space-y-2'>
        <h2 className='text-2xl font-semibold text-gray-900'>Company Size</h2>
        <p className='text-sm text-gray-500'>How many employees are in your company?</p>
      </div>

      <RadioGroup
        value={companySize}
        onValueChange={handleCompanySizeChange}
        className='grid gap-4 sm:grid-cols-2'
      >
        {companySizes.map((size) => (
          <div key={size.value} className='relative'>
            <RadioGroupItem value={size.value} id={size.value} className='peer sr-only' />
            <Label
              htmlFor={size.value}
              className='flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-[#5932EA]'
            >
              <span className='text-sm font-medium'>{size.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>

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
          className='w-full bg-gradient-to-r from-[#5932EA] to-[#9B32EA] hover:from-[#4A2BC2] hover:to-[#7B2BC2] text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
          disabled={!companySize}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
}
