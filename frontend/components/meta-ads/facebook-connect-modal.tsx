import { useState } from 'react';
import { Facebook } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Steps } from './steps';

interface FacebookConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export function FacebookConnectModal({ open, onClose, onConnect }: FacebookConnectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: 'Connect Facebook Account',
      description: 'Link your Facebook account to enable ad management',
      action: (
        <Button
          onClick={() => setCurrentStep(2)}
          className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90'
        >
          <Facebook className='w-4 h-4 mr-2' />
          Connect Facebook
        </Button>
      ),
    },
    {
      title: 'Select Ad Account',
      description: 'Choose the ad account you want to manage',
      action: (
        <Button onClick={() => setCurrentStep(3)} className='w-full'>
          Continue
        </Button>
      ),
    },
    {
      title: 'Configure Pixel',
      description: 'Set up Facebook Pixel for tracking',
      action: (
        <Button
          onClick={() => {
            onConnect();
            onClose();
          }}
          className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90'
        >
          Complete Setup
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Connect to Facebook</DialogTitle>
        </DialogHeader>
        <Steps steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
      </DialogContent>
    </Dialog>
  );
}
