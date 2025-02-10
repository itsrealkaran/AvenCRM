'use client';

import { useState } from 'react';
import { Lead } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConvertToDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

export function ConvertToDealDialog({ open, onOpenChange, lead }: ConvertToDealDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dealAmount, setDealAmount] = useState('');
  const [expectedCloseDate, setExpectedCloseDate] = useState('');
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads/convert`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          dealAmount: parseFloat(dealAmount),
          expectedCloseDate: expectedCloseDate
            ? new Date(expectedCloseDate).toISOString()
            : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to convert lead to deal');
      }

      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      await queryClient.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Lead converted to deal successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to convert lead to deal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Convert Lead to Deal</DialogTitle>
          <DialogDescription>
            Enter the deal details to convert this lead into a deal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='dealAmount' className='text-right'>
                Deal Amount
              </Label>
              <Input
                id='dealAmount'
                type='number'
                step='0.01'
                value={dealAmount}
                onChange={(e) => setDealAmount(e.target.value)}
                className='col-span-3'
                required
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='expectedCloseDate' className='text-right'>
                Expected Close Date
              </Label>
              <Input
                id='expectedCloseDate'
                type='date'
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit' disabled={loading}>
              {loading ? 'Converting...' : 'Convert to Deal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
