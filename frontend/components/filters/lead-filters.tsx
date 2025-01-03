import React from 'react';
import { LeadStatus } from '@/types';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface LeadFilters {
  startDate?: Date;
  endDate?: Date;
  status?: LeadStatus;
  source?: string;
  type?: string;
}

interface LeadFiltersProps {
  onFilterChange: (filters: LeadFilters) => void;
  statusOptions: { label: string; value: LeadStatus }[];
}

export function LeadFilters({ onFilterChange, statusOptions }: LeadFiltersProps) {
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<LeadFilters>({});

  const handleFilterChange = (key: keyof LeadFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setOpen(false);
  };

  const resetFilters = () => {
    const emptyFilters: LeadFilters = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <PlusCircle className='mr-2 h-4 w-4' />
          Add filters
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Lead Filters</SheetTitle>
          <SheetDescription>Filter leads by date, status, source, and type</SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Date Range</Label>
            <div className='grid grid-cols-2 gap-2'>
              <DatePicker
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                placeholder='Start date'
              />
              <DatePicker
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                placeholder='End date'
              />
            </div>
          </div>

          <div className='grid gap-2'>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value as LeadStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label>Source</Label>
            <Input
              value={filters.source || ''}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              placeholder='Enter source'
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant='outline' onClick={resetFilters}>
            Reset
          </Button>
          <Button onClick={applyFilters}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
