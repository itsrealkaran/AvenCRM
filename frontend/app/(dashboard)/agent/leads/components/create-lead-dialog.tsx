'use client';

import { useState } from 'react';
import axios from 'axios';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeadDialog({ open, onOpenChange }: CreateLeadDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    leadAmount: '',
    source: 'MANUAL',
    status: 'NEW',
    propertyType: '',
    location: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, onOpenChange: (open: boolean) => void) => {
    e.preventDefault();
    // Handle form submission logic here
    const data = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      leadAmount: formData.leadAmount,
      source: formData.source,
      status: formData.status,
      propertyType: formData.propertyType,
      location: formData.location,
      expectedDate: new Date(),
      notes: '',
    };
    console.log(data);

    try {
      debugger;

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leads`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log(responseData);
    } catch (error) {
      console.log(error);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => handleSubmit(e, onOpenChange)}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='name' className='text-right'>
                Name
              </Label>
              <Input
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='email' className='text-right'>
                Email
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='phone' className='text-right'>
                Phone
              </Label>
              <Input
                id='phone'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='location' className='text-right'>
                Location
              </Label>
              <Input
                id='location'
                name='location'
                value={formData.location}
                onChange={handleInputChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='leadAmount' className='text-right'>
                Lead Amount
              </Label>
              <Input
                id='leadAmount'
                name='leadAmount'
                type='number'
                value={formData.leadAmount}
                onChange={handleInputChange}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='source' className='text-right'>
                Source
              </Label>
              <Select onValueChange={handleSelectChange('source')} defaultValue={formData.source}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select source' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MANUAL'>Manual</SelectItem>
                  <SelectItem value='WEBSITE'>Website</SelectItem>
                  <SelectItem value='REFERRAL'>Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='status' className='text-right'>
                Status
              </Label>
              <Select onValueChange={handleSelectChange('status')} defaultValue={formData.status}>
                <SelectTrigger className='col-span-3'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='NEW'>New</SelectItem>
                  <SelectItem value='CONTACTED'>Contacted</SelectItem>
                  <SelectItem value='QUALIFIED'>Qualified</SelectItem>
                  <SelectItem value='LOST'>Lost</SelectItem>
                  <SelectItem value='WON'>Won</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>Create Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
