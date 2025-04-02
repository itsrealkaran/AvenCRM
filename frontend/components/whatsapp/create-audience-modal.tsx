import { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { WhatsAppAccount } from '@/types/whatsapp.types';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { AudienceGroup } from './audience-list';

interface CreateAudienceModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAudience: (audience: AudienceGroup) => void;
  editingAudience?: AudienceGroup | null;
}

export function CreateAudienceModal({
  open,
  onClose,
  onCreateAudience,
  editingAudience,
}: CreateAudienceModalProps) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<WhatsAppAccount>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      fetchAccounts();
    } else {
      // Only reset if not editing - prevents flashing when modal closes
      if (!editingAudience) {
        resetForm();
      }
    }
  }, [open]);

  // Set form values when editing audience changes
  useEffect(() => {
    if (editingAudience) {
      setName(editingAudience.name);
      setPhoneNumbers(editingAudience.phoneNumbers || []);
      setSelectedAccountId(editingAudience.id || '');
    } else if (open) {
      // Only reset if modal is open to prevent unnecessary state updates
      resetForm();
    }
  }, [editingAudience, open]);

  const resetForm = () => {
    setName('');
    setPhoneNumbers([]);
    setPhoneNumber('');
    setSelectedAccountId('');
    setErrors({});
  };

  const fetchAccounts = async () => {
    try {
      const accountsData: WhatsAppAccount = await whatsAppService.getAccounts();
      setAccounts(accountsData);

      // If there's only one account, select it automatically (only for new audiences)
      if (accountsData && !editingAudience) {
        setSelectedAccountId(accountsData.id);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp accounts:', error);
      toast.error('Failed to load WhatsApp accounts');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Audience name is required';
    if (phoneNumbers.length === 0) newErrors.phoneNumbers = 'At least one phone number is required';
    if (!selectedAccountId && !editingAudience)
      newErrors.account = 'Please select a WhatsApp account';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPhoneNumber = () => {
    if (!phoneNumber.trim()) return;

    // Validate phone number format (basic validation)
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      setErrors({ ...errors, phoneNumber: 'Invalid phone format. Use format: +1234567890' });
      return;
    }

    if (!phoneNumbers.includes(phoneNumber.trim())) {
      setPhoneNumbers([...phoneNumbers, phoneNumber.trim()]);
      setPhoneNumber('');
      // Clear phone number error if it exists
      if (errors.phoneNumber) {
        const { phoneNumber: _, ...restErrors } = errors;
        setErrors(restErrors);
      }
    } else {
      setErrors({ ...errors, phoneNumber: 'This phone number is already added' });
    }
  };

  const handleRemovePhoneNumber = (number: string) => {
    setPhoneNumbers(phoneNumbers.filter((n) => n !== number));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let audience;

      if (editingAudience) {
        audience = await whatsAppService.updateAudience(editingAudience.id, {
          name,
        });

        const existingRecipients = await whatsAppService.getAudienceRecipients(editingAudience.id);
        const existingPhoneNumbers = existingRecipients.map((r: any) => r.phoneNumber);

        const newPhoneNumbers = phoneNumbers.filter(
          (number) => !existingPhoneNumbers.includes(number)
        );

        if (newPhoneNumbers.length > 0) {
          const recipients = newPhoneNumbers.map((phoneNumber) => ({
            phoneNumber,
          }));

          await whatsAppService.addRecipients(editingAudience.id, recipients);
        }

        const removedRecipients = existingRecipients.filter(
          (r: any) => !phoneNumbers.includes(r.phoneNumber)
        );

        for (const recipient of removedRecipients) {
          await whatsAppService.removeRecipient(editingAudience.id, recipient.id);
        }

        const updatedAudience = await whatsAppService.getAudience(editingAudience.id);

        audience = {
          ...updatedAudience,
          phoneNumbers: phoneNumbers,
        };

        toast.success('Audience updated successfully');
      } else {
        audience = await whatsAppService.createAudience({
          name,
          accountId: selectedAccountId,
        });

        if (phoneNumbers.length > 0) {
          const recipients = phoneNumbers.map((phoneNumber) => ({
            phoneNumber,
          }));

          await whatsAppService.addRecipients(audience.id, recipients);
        }

        const createdAudience = await whatsAppService.getAudience(audience.id);

        audience = {
          ...createdAudience,
          phoneNumbers: phoneNumbers,
        };

        toast.success('Audience created successfully');
      }

      onCreateAudience(audience);
      onClose();
    } catch (error) {
      console.error('Error creating/updating audience:', error);
      toast.error(editingAudience ? 'Failed to update audience' : 'Failed to create audience');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <div>
            <DialogTitle className='flex items-center text-lg'>
              {editingAudience ? 'Edit Audience Group' : 'Create Audience Group'}
            </DialogTitle>
            <DialogDescription>
              {editingAudience
                ? 'Update your audience group details'
                : 'Create a new audience group for your WhatsApp campaigns'}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Audience Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter audience name'
              className='col-span-3'
            />
            {errors.name && <p className='text-sm text-red-500'>{errors.name}</p>}
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='phoneNumber'>Add Phone Number</Label>
            <div className='flex gap-2'>
              <Input
                id='phoneNumber'
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder='Enter phone number with country code (e.g., +1234567890)'
                className='flex-grow'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPhoneNumber();
                  }
                }}
              />
              <Button
                onClick={handleAddPhoneNumber}
                type='button'
                className='bg-[#5932EA] hover:bg-[#5932EA]/90'
              >
                <Plus className='h-4 w-4' />
              </Button>
            </div>
            {errors.phoneNumber && <p className='text-sm text-red-500'>{errors.phoneNumber}</p>}
          </div>
          <div>
            <Label className='mb-2 block'>Phone Numbers ({phoneNumbers.length})</Label>
            <ScrollArea className='h-[150px] w-full border rounded-md p-2'>
              {phoneNumbers.length > 0 ? (
                phoneNumbers.map((number) => (
                  <div
                    key={number}
                    className='flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded'
                  >
                    <Badge variant='secondary' className='font-mono'>
                      {number}
                    </Badge>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemovePhoneNumber(number)}
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                ))
              ) : (
                <div className='flex items-center justify-center h-full text-muted-foreground'>
                  No phone numbers added yet
                </div>
              )}
            </ScrollArea>
            {errors.phoneNumbers && (
              <p className='text-sm text-red-500 mt-1'>{errors.phoneNumbers}</p>
            )}
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className='bg-[#5932EA] hover:bg-[#5932EA]/90'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className='animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-current rounded-full'></span>
                {editingAudience ? 'Updating...' : 'Creating...'}
              </>
            ) : editingAudience ? (
              'Update Audience'
            ) : (
              'Create Audience'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
