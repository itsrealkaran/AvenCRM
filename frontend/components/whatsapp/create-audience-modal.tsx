import { useEffect, useState } from 'react';
import { whatsAppService } from '@/api/whatsapp.service';
import { WhatsAppAccount } from '@/types/whatsapp.types';
import { useQueryClient } from '@tanstack/react-query';
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

interface Recipient {
  name: string;
  phoneNumber: string;
}

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
  const [recipientName, setRecipientName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState<Recipient[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<WhatsAppAccount>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const queryClient = useQueryClient();

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
      setName(editingAudience.name || '');
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
    setRecipientName('');
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
    const phoneRegex = /^\+[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrors({
        phoneNumber: 'Please enter a valid phone number with country code (e.g., +1234567890)',
      });
      return;
    }

    if (phoneNumbers.some((recipient) => recipient.phoneNumber === phoneNumber)) {
      setErrors({ phoneNumber: 'This phone number is already added' });
      return;
    }

    setPhoneNumbers([...phoneNumbers, { name: recipientName, phoneNumber }]);
    setPhoneNumber('');
    setRecipientName('');
    if (errors.phoneNumber) {
      setErrors({});
    }
  };

  const handleRemovePhoneNumber = (number: string) => {
    setPhoneNumbers(phoneNumbers.filter((n) => n.phoneNumber !== number));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      let audience;

      // Clean phone numbers by removing '+' prefix
      const cleanPhoneNumbersWithName = phoneNumbers.map((number) => ({
        name: number.name,
        phoneNumber: number.phoneNumber.replace('+', ''),
      }));

      if (editingAudience) {
        audience = await whatsAppService.updateAudience(editingAudience.id, {
          name,
        });

        const existingRecipients = await whatsAppService.getAudienceRecipients(editingAudience.id);
        const existingPhoneNumbers = existingRecipients.map((r: any) => r.phoneNumber);

        // Only add new phone numbers that don't exist
        const newPhoneNumbers = cleanPhoneNumbersWithName.filter(
          (number) => !existingPhoneNumbers.includes(number.phoneNumber)
        );

        if (newPhoneNumbers.length > 0) {
          const recipients = newPhoneNumbers.map((phoneNumber) => ({
            name: phoneNumber.name,
            phoneNumber: phoneNumber.phoneNumber,
          }));

          await whatsAppService.addRecipients(editingAudience.id, recipients);
        }

        // Remove phone numbers that are no longer in the list
        const removedRecipients = existingRecipients.filter(
          (r: any) => !cleanPhoneNumbersWithName.some((n) => n.phoneNumber === r.phoneNumber)
        );

        for (const recipient of removedRecipients) {
          await whatsAppService.removeRecipient(editingAudience.id, recipient.id);
        }

        const updatedAudience = await whatsAppService.getAudience(editingAudience.id);

        audience = {
          ...updatedAudience,
          phoneNumbers: cleanPhoneNumbersWithName,
        };

        toast.success('Audience updated successfully');
      } else {
        audience = await whatsAppService.createAudience({
          name,
          accountId: selectedAccountId,
        });

        if (cleanPhoneNumbersWithName.length > 0) {
          const recipients = cleanPhoneNumbersWithName.map((phoneNumber) => ({
            name: phoneNumber.name,
            phoneNumber: phoneNumber.phoneNumber,
          }));

          await whatsAppService.addRecipients(audience.id, recipients);
        }

        const createdAudience = await whatsAppService.getAudience(audience.id);

        audience = {
          ...createdAudience,
          phoneNumbers: cleanPhoneNumbersWithName,
        };

        toast.success('Audience created successfully');
      }

      queryClient.invalidateQueries({ queryKey: ['whatsapp-audiences'] });
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
            <Label>Add Recipient</Label>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='recipientName'>Recipient Name</Label>
                <Input
                  id='recipientName'
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder='Enter recipient name'
                />
                {errors.recipientName && (
                  <p className='text-sm text-red-500'>{errors.recipientName}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phoneNumber'>Phone Number</Label>
                <Input
                  id='phoneNumber'
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder='Enter phone number with country code (e.g., +1234567890)'
                />
                {errors.phoneNumber && <p className='text-sm text-red-500'>{errors.phoneNumber}</p>}
              </div>
            </div>
            <div className='flex justify-end mt-2'>
              <Button
                onClick={handleAddPhoneNumber}
                type='button'
                className='bg-[#5932EA] hover:bg-[#5932EA]/90'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add Recipient
              </Button>
            </div>
          </div>
          <div>
            <Label className='mb-2 block'>Phone Numbers ({phoneNumbers.length})</Label>
            <ScrollArea className='h-[150px] w-full border rounded-md p-2'>
              {phoneNumbers.length > 0 ? (
                phoneNumbers.map((number) => (
                  <div
                    key={number.phoneNumber}
                    className='flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded'
                  >
                    <Badge variant='secondary' className='font-mono'>
                      {number.name} {number.phoneNumber}
                    </Badge>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleRemovePhoneNumber(number.phoneNumber)}
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
