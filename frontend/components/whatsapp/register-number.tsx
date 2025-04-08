import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterNumberModalProps {
  open: boolean;
  onClose: () => void;
  onRegister: (pin: string) => Promise<void>;
  onCreatePin: (pin: string) => Promise<void>;
}

export function RegisterNumberModal({
  open,
  onClose,
  onRegister,
  onCreatePin,
}: RegisterNumberModalProps) {
  const [pin, setPin] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!pin || pin.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN');
      return;
    }
    setIsLoading(true);
    try {
      if (isCreatingPin) {
        onCreatePin(pin).then(() => {
          onClose();
        });
      } else {
        onRegister(pin).then(() => {
          onClose();
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Register WhatsApp Number</DialogTitle>
          <DialogDescription>
            {isCreatingPin ? 'Create a new PIN' : 'Enter your PIN to register'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='pin'>
              {isCreatingPin ? 'Create 6-digit PIN' : 'Enter 6-digit PIN'}
            </Label>
            <Input
              id='pin'
              type='password'
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder={isCreatingPin ? 'Create a new PIN' : 'Enter your PIN'}
            />
          </div>

          <Button className='w-full' onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processing...' : isCreatingPin ? 'Create PIN' : 'Verify PIN'}
          </Button>
          {!isCreatingPin && (
            <p className='text-center text-sm text-muted-foreground'>
              Don&apos;t have a PIN?{' '}
              <button
                className='text-primary hover:underline'
                onClick={() => setIsCreatingPin(true)}
              >
                Create one
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
