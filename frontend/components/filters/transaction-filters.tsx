import React from 'react';
import { TransactionType } from '@/types';
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

interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilters) => void;
  typeOptions: { label: string; value: TransactionType }[];
}

export function TransactionFilters({ onFilterChange, typeOptions }: TransactionFiltersProps) {
  const [open, setOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<TransactionFilters>({});

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
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
    const emptyFilters: TransactionFilters = {};
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
          <SheetTitle>Transaction Filters</SheetTitle>
          <SheetDescription>Filter transactions by date, type, and amount</SheetDescription>
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
            <Label>Transaction Type</Label>
            <Select
              value={filters.type}
              onValueChange={(value) => handleFilterChange('type', value as TransactionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid gap-2'>
            <Label>Amount Range</Label>
            <div className='grid grid-cols-2 gap-2'>
              <Input
                type='number'
                value={filters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', Number(e.target.value))}
                placeholder='Min amount'
              />
              <Input
                type='number'
                value={filters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', Number(e.target.value))}
                placeholder='Max amount'
              />
            </div>
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
