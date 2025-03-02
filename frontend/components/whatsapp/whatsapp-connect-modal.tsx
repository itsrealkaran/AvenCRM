'use client';

import { useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Steps } from './steps';

interface WhatsAppConnectModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export function WhatsAppConnectModal({ open, onClose, onConnect }: WhatsAppConnectModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [accountData, setAccountData] = useState({
    phoneNumberId: '',
    wabaid: '',
    accessToken: '',
    phoneNumber: '',
    displayName: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!accountData.displayName || !accountData.phoneNumber) {
        toast.error('Please fill in all required fields');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleConnect = async () => {
    // Validate inputs for step 2
    if (!accountData.phoneNumberId || !accountData.wabaid || !accountData.accessToken) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      // Create WhatsApp account
      const account = await whatsAppService.createAccount(accountData);

      // Verify the account
      await whatsAppService.verifyAccount(account.id);

      toast.success('WhatsApp account connected successfully!');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error connecting WhatsApp account:', error);
      toast.error('Failed to connect WhatsApp account. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onConnect();
    onClose();
  };

  const steps = [
    {
      title: 'Account Info',
      description: 'Enter your WhatsApp Business account information',
      content: (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='displayName'>Account Name</Label>
            <Input
              id='displayName'
              name='displayName'
              placeholder='My WhatsApp Business'
              value={accountData.displayName}
              onChange={handleInputChange}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='phoneNumber'>Phone Number</Label>
            <Input
              id='phoneNumber'
              name='phoneNumber'
              placeholder='+1234567890'
              value={accountData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'API Credentials',
      description: 'Enter your WhatsApp Business API credentials',
      content: (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='phoneNumberId'>Phone Number ID</Label>
            <Input
              id='phoneNumberId'
              name='phoneNumberId'
              placeholder='123456789012345'
              value={accountData.phoneNumberId}
              onChange={handleInputChange}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='wabaid'>WhatsApp Business Account ID</Label>
            <Input
              id='wabaid'
              name='wabaid'
              placeholder='123456789012345'
              value={accountData.wabaid}
              onChange={handleInputChange}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='accessToken'>Access Token</Label>
            <Input
              id='accessToken'
              name='accessToken'
              type='password'
              placeholder='Your WhatsApp API access token'
              value={accountData.accessToken}
              onChange={handleInputChange}
            />
          </div>
        </div>
      ),
    },
    {
      title: 'Connected',
      description: 'Your WhatsApp Business account has been connected successfully',
      content: (
        <div className='text-center'>
          <div className='flex justify-center mb-4'>
            <div className='bg-green-100 p-4 rounded-full'>
              <FaWhatsapp className='w-12 h-12 text-[#25D366]' />
            </div>
          </div>
          <h3 className='text-lg font-semibold mb-2'>WhatsApp Connected!</h3>
          <p className='text-muted-foreground'>
            Your WhatsApp Business account has been connected successfully. You can now create
            campaigns and send messages.
          </p>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[550px]'>
        <DialogHeader>
          <DialogTitle>Connect to WhatsApp Business</DialogTitle>
        </DialogHeader>
        <Steps
          steps={steps}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          showNavigation={true}
          onNext={currentStep === 2 ? handleConnect : handleNext}
          onBack={handleBack}
          onComplete={handleComplete}
          isLastStep={currentStep === 3}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
