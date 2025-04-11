import { useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { WhatsAppPhoneNumberData } from '@/types/whatsapp.types';
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
  accessToken: string;
  phoneNumberId: string;
  wabaId: string;
  phoneNumbers: WhatsAppPhoneNumberData[];
}

export function RegisterNumberModal({
  open,
  onClose,
  accessToken,
  phoneNumberId,
  wabaId,
  phoneNumbers,
}: RegisterNumberModalProps) {
  const [pin, setPin] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterAccount = async (pin: string) => {
    console.log(accessToken, 'access token');
    try {
      // @ts-ignore
      FB.api(
        `/${phoneNumberId}/register?access_token=${accessToken}`,
        'POST',
        { pin, messaging_product: 'whatsapp' },
        (response: any) => {
          console.log('Response:', response);
          if (response && !response.error) {
            const id = phoneNumbers.find(
              (phoneNumber) => phoneNumber.phoneNumberId === phoneNumberId
            )?.id;
            if (id) {
              whatsAppService.updateRegisteredNumberStatus(id);
              toast.success('Account registered successfully');

              // @ts-ignore
              FB.api(
                `/${wabaId}/subscribed_apps?access_token=${accessToken}`,
                'POST',
                (response: any) => {
                  console.log('Response:', response);
                  if (response && !response.error) {
                    toast.success('Account subscribed successfully');
                    window.location.reload();
                  } else {
                    toast.error(response.error.error_user_msg || response.error.message);
                  }
                }
              );
            } else {
              toast.error('Phone number not found');
            }
          } else {
            toast.error(response.error.error_user_msg || response.error.message);
          }
        }
      );
    } catch (error: any) {
      console.error('Error registering account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to register account';
      toast.error(errorMessage);
    }
  };

  const handleCreatePin = async (pin: string) => {
    try {
      console.log('Creating pin for account:', phoneNumberId, pin);
      // @ts-ignore
      FB.api(`/${phoneNumberId}?access_token=${accessToken}`, 'POST', { pin }, (response: any) => {
        console.log('Response:', response);
        if (response && !response.error) {
          toast.success('Pin created successfully');

          // @ts-ignore
          FB.api(
            `/${phoneNumberId}/register?access_token=${accessToken}`,
            'POST',
            { pin, messaging_product: 'whatsapp' },
            (response: any) => {
              console.log('Response:', response);
              if (response && !response.error) {
                const id = phoneNumbers.find(
                  (phoneNumber) => phoneNumber.phoneNumberId === phoneNumberId
                )?.id;
                if (id) {
                  whatsAppService.updateRegisteredNumberStatus(id);
                  toast.success('Account registered successfully');

                  // @ts-ignore
                  FB.api(
                    `/${phoneNumberId}/subscribed_apps?access_token=${accessToken}`,
                    'POST',
                    (response: any) => {
                      console.log('Response:', response);
                      if (response && !response.error) {
                        toast.success('Account subscribed successfully');
                        window.location.reload();
                      } else {
                        toast.error(response.error.error_user_msg || response.error.message);
                      }
                    }
                  );
                } else {
                  toast.error('Phone number not found');
                }
              } else {
                toast.error(response.error.error_user_msg || response.error.message);
              }
            }
          );
        } else {
          toast.error(response.error.error_user_msg || response.error.message);
        }
      });
    } catch (error) {
      console.error('Error creating pin:', error);
    }
  };

  const handleSubmit = async () => {
    if (!pin || pin.length !== 6) {
      toast.error('Please enter a valid 6-digit PIN');
      return;
    }
    setIsLoading(true);
    try {
      if (isCreatingPin) {
        handleCreatePin(pin).then(() => {
          onClose();
        });
      } else {
        handleRegisterAccount(pin).then(() => {
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
