import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  agentId: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, propertyId, agentId }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate the share link
  const shareLink = `${window.location.origin}/properties/${propertyId}?agentId=${agentId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        description: 'Link copied to clipboard!',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: 'destructive',
        description: 'Failed to copy link. Please try again.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Share Property</DialogTitle>
          <DialogDescription>
            Share this property with potential clients or colleagues
          </DialogDescription>
        </DialogHeader>
        <div className='flex items-center space-x-2 mt-4'>
          <div className='grid flex-1 gap-2'>
            <Input readOnly value={shareLink} className='w-full bg-gray-50' />
          </div>
          <Button
            type='button'
            size='icon'
            className={`${
              copied ? 'bg-green-600 hover:bg-green-700' : 'bg-[#7C3AED] hover:bg-[#6D28D9]'
            } text-white`}
            onClick={handleCopy}
          >
            {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
          </Button>
        </div>
        <div className='mt-4'>
          <p className='text-sm text-muted-foreground'>
            Anyone with this link will be able to view this property listing
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
