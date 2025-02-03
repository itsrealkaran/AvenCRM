import { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Steps } from './steps';

interface WhatsAppConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export function WhatsAppConnectModal({ open, onClose, onConnect }: WhatsAppConnectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      title: 'Connect WhatsApp Business Account',
      description: 'Link your WhatsApp Business account to enable campaign management',
      action: (
        <Button
          onClick={() => setCurrentStep(2)}
          className='w-full bg-[#5932EA] hover:bg-[#5932EA]/90'
        >
          <FaWhatsapp className='w-4 h-4 mr-2' />
          Connect WhatsApp
        </Button>
      ),
    },
    {
      title: 'Verify Phone Number',
      description: 'Verify the phone number associated with your WhatsApp Business account',
      action: (
        <Button onClick={() => setCurrentStep(3)} className='w-full'>
          Continue
        </Button>
      ),
    },
    {
      title: 'Set Up Message Templates',
      description: 'Create and configure message templates for your campaigns',
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
          <DialogTitle>Connect to WhatsApp Business</DialogTitle>
        </DialogHeader>
        <Steps steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
      </DialogContent>
    </Dialog>
  );
}
