'use client';

import React, { useEffect, useState } from 'react';
import { Company, Plan } from '@/types/company';
import { User } from '@/types/user';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { companyAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface CompanyFormProps {
  company?: Company | null;
  admins: User[];
  plans: Plan[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CompanyForm({ company, admins, plans, onClose, onSuccess }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    adminId: '',
    planId: '',
    planEnd: '',
    address: '',
    phone: '',
    website: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        email: company.email,
        adminId: company.adminId,
        planId: company.planId,
        planEnd: new Date(company.planEnd).toISOString().split('T')[0],
        address: company.address || '',
        phone: company.phone || '',
        website: company.website || '',
      });
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (company) {
        await companyAPI.update(company.id, formData);
        toast({
          title: 'Success',
          description: 'Company updated successfully',
        });
      } else {
        await companyAPI.create(formData);
        toast({
          title: 'Success',
          description: 'Company created successfully',
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save company',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Company Name</Label>
          <Input
            id='name'
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='admin'>Admin</Label>
          <Select
            value={formData.adminId}
            onValueChange={(value) => setFormData({ ...formData, adminId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select admin' />
            </SelectTrigger>
            <SelectContent>
              {admins.map((admin) => (
                <SelectItem key={admin.id} value={admin.id}>
                  {admin.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='plan'>Plan</Label>
          <Select
            value={formData.planId}
            onValueChange={(value) => setFormData({ ...formData, planId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select plan' />
            </SelectTrigger>
            <SelectContent>
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='space-y-2'>
          <Label htmlFor='planEnd'>Plan End Date</Label>
          <Input
            id='planEnd'
            type='date'
            value={formData.planEnd}
            onChange={(e) => setFormData({ ...formData, planEnd: e.target.value })}
            required
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='phone'>Phone</Label>
          <Input
            id='phone'
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='website'>Website</Label>
          <Input
            id='website'
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
        <div className='space-y-2 col-span-2'>
          <Label htmlFor='address'>Address</Label>
          <Input
            id='address'
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>
      <div className='flex justify-end space-x-2'>
        <Button type='button' variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button type='submit'>{company ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
}
