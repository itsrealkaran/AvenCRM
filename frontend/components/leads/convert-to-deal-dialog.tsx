'use client';

import { useState } from 'react';
import { leadsApi } from '@/api/leads.service';
import { LeadResponse as Lead } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface ConvertToDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

export function ConvertToDealDialog({ open, onOpenChange, lead }: ConvertToDealDialogProps) {
  const [loading, setLoading] = useState(false);
  const [dealAmount, setDealAmount] = useState('');
  const [date, setDate] = useState<Date>();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    try {
      setLoading(true);
      await leadsApi.convertToDeal({
        leadId: lead.id,
        dealAmount: parseFloat(dealAmount),
        expectedCloseDate: date ? date.toISOString() : undefined,
      });

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
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-semibold'>Convert Lead to Deal</DialogTitle>
          <DialogDescription className='text-base'>
            Enter the deal details to convert this lead into a deal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card className='mt-4'>
            <CardContent className='p-6'>
              <div className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='dealAmount'>Deal Amount</Label>
                  <div className='relative'>
                    <DollarSign className='absolute left-3 top-2.5 h-5 w-5 text-gray-500' />
                    <Input
                      id='dealAmount'
                      type='number'
                      step='0.01'
                      value={dealAmount}
                      onChange={(e) => setDealAmount(e.target.value)}
                      className='pl-10'
                      placeholder='Enter deal amount'
                      required
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label>Expected Close Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {date ? format(date, 'PPP') : 'Select a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar mode='single' selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter className='mt-6'>
            <Button
              variant='outline'
              type='button'
              onClick={() => onOpenChange(false)}
              className='mr-2'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? (
                <>
                  <span className='animate-spin mr-2'>⏳</span>
                  Converting...
                </>
              ) : (
                'Convert to Deal'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
