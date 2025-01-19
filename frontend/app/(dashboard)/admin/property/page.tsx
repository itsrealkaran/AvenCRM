'use client';

import React, { useEffect, useState } from 'react';
import { createPropertySchema } from '@/schema/property.schema';
import { Property, PropertyFilters, PropertyResponse } from '@/types/propertyTypes';
import axios from 'axios';

import { BaseEntityDialog } from '@/components/entity-dialog';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function PropertyPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<PropertyFilters>({
    page: 1,
    limit: 10,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();

  const defaultValues = {
    title: '',
    description: '',
    price: undefined,
    area: undefined,
    address: '',
    propertyType: 'RESIDENTIAL',
    status: 'ACTIVE',
    bedrooms: undefined,
    bathrooms: undefined,
    location: '',
    amenities: [],
    notes: [],
  };

  const handleCreateUpdate = async (values: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (selectedProperty) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/property/${selectedProperty.id}`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast({
          title: 'Success',
          description: 'Property updated successfully',
        });
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/property`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({
          title: 'Success',
          description: 'Property created successfully',
        });
      }
      setIsModalOpen(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property:', error);
      toast({
        title: 'Error',
        description: 'Failed to save property',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/property/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Property deleted successfully',
      });
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    }
  };

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams({
        ...filters,
        page: String(filters.page),
        limit: String(filters.limit),
      } as any);

      const response = await axios.get<PropertyResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/property?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProperties(response.data.properties);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold'>Properties</h1>
        <Button
          onClick={() => {
            setSelectedProperty(null);
            setIsModalOpen(true);
          }}
        >
          Add Property
        </Button>
      </div>

      {/* Filters */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <Input
          placeholder='Min Price'
          type='number'
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              minPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <Input
          placeholder='Max Price'
          type='number'
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              maxPrice: e.target.value ? Number(e.target.value) : undefined,
            }))
          }
        />
        <Select
          placeholder='Property Type'
          options={[
            { label: 'All', value: '' },
            { label: 'Residential', value: 'Residential' },
            { label: 'Commercial', value: 'Commercial' },
            { label: 'Industrial', value: 'Industrial' },
          ]}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              propertyType: value || undefined,
            }))
          }
        />
        <Select
          placeholder='Status'
          options={[
            { label: 'All', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Sold', value: 'SOLD' },
            { label: 'Inactive', value: 'INACTIVE' },
          ]}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value || undefined,
            }))
          }
        />
      </div>

      {/* Property Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='h-[300px] bg-gray-100 animate-pulse rounded-lg' />
            ))
          : properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={() => {
                  setSelectedProperty(property);
                  setIsModalOpen(true);
                }}
                onDelete={() => handleDelete(property.id)}
              />
            ))}
      </div>

      {/* Pagination */}
      <div className='flex justify-center space-x-2'>
        {Array.from({ length: totalPages }).map((_, i) => (
          <Button
            key={i}
            variant={filters.page === i + 1 ? 'default' : 'outline'}
            onClick={() => setFilters((prev) => ({ ...prev, page: i + 1 }))}
          >
            {i + 1}
          </Button>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <BaseEntityDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={selectedProperty ? 'Edit Property' : 'Add Property'}
        schema={createPropertySchema}
        defaultValues={selectedProperty || defaultValues}
        onSubmit={(values) => {
          handleCreateUpdate(values);
        }}
        isLoading={false}
      >
        {(form) => (
          <>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter property title' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='address'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder='Enter property address' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter property price'
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='area'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter property area'
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='propertyType'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select property type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL'].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select property status' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['ACTIVE', 'PENDING', 'SOLD', 'INACTIVE'].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bedrooms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter number of bedrooms'
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='bathrooms'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Enter number of bathrooms'
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem className='mt-4'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      placeholder='Enter property description'
                      className='w-full p-2 border rounded'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end space-x-4 mt-4'>
              <Button type='button' variant='outline' onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type='submit'>
                {selectedProperty ? 'Update Property' : 'Create Property'}
              </Button>
            </div>
          </>
        )}
      </BaseEntityDialog>
    </div>
  );
}
