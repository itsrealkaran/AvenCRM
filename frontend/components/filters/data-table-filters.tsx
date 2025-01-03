import React, { useState } from 'react';
import { format } from 'date-fns';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
import { cn } from '@/lib/utils';

interface FilterState {
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  source?: string;
  type?: string;
  minAmount?: string;
  maxAmount?: string;
  showTime?: boolean;
}

interface DataTableFiltersProps {
  onFilterChange: (filters: any) => void;
  statusOptions?: { label: string; value: string }[];
  typeOptions?: { label: string; value: string }[];
  showAmountFilter?: boolean;
  showSourceFilter?: boolean;
  showTypeFilter?: boolean;
  showDateFilter?: boolean;
  showTimeFilter?: boolean;
}

export function DataTableFilters({
  onFilterChange,
  statusOptions = [],
  typeOptions = [],
  showAmountFilter = false,
  showSourceFilter = false,
  showTypeFilter = false,
  showDateFilter = true,
  showTimeFilter = false,
}: DataTableFiltersProps) {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    startDate: undefined,
    endDate: undefined,
    status: undefined,
    source: undefined,
    type: undefined,
    minAmount: undefined,
    maxAmount: undefined,
  });

  const handleFilterChange = (key: string, value: any) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
    setOpen(false);
  };

  const resetFilters = () => {
    setLocalFilters({
      startDate: undefined,
      endDate: undefined,
      status: undefined,
      source: undefined,
      type: undefined,
      minAmount: undefined,
      maxAmount: undefined,
    });
    onFilterChange({});
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
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Add filters to narrow down your results</SheetDescription>
        </SheetHeader>
        <div className='grid gap-4 py-4'>
          {showDateFilter && (
            <div className='grid gap-2'>
              <Label>Date Range</Label>
              <div className='grid grid-cols-2 gap-2'>
                {showTimeFilter ? (
                  <>
                    <DateTimePicker
                      value={localFilters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      className='w-full'
                      placeholder='Start date & time'
                    />
                    <DateTimePicker
                      value={localFilters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      className='w-full'
                      placeholder='End date & time'
                    />
                  </>
                ) : (
                  <>
                    <DatePicker
                      value={localFilters.startDate}
                      onChange={(date) => handleFilterChange('startDate', date)}
                      placeholder='Start date'
                      className='w-full'
                    />
                    <DatePicker
                      value={localFilters.endDate}
                      onChange={(date) => handleFilterChange('endDate', date)}
                      placeholder='End date'
                      className='w-full'
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {statusOptions.length > 0 && (
            <div className='grid gap-2'>
              <Label>Status</Label>
              <Select
                value={localFilters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
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
          )}

          {showSourceFilter && (
            <div className='grid gap-2'>
              <Label>Source</Label>
              <Input
                value={localFilters.source || ''}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                placeholder='Enter source'
              />
            </div>
          )}

          {showTypeFilter && typeOptions.length > 0 && (
            <div className='grid gap-2'>
              <Label>Type</Label>
              <Select
                value={localFilters.type}
                onValueChange={(value) => handleFilterChange('type', value)}
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
          )}

          {showAmountFilter && (
            <div className='grid gap-2'>
              <Label>Amount Range</Label>
              <div className='grid grid-cols-2 gap-2'>
                <Input
                  type='number'
                  value={localFilters.minAmount || ''}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  placeholder='Min amount'
                />
                <Input
                  type='number'
                  value={localFilters.maxAmount || ''}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  placeholder='Max amount'
                />
              </div>
            </div>
          )}
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
