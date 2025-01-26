'use client';

import React, { useCallback, useState } from 'react';
import { propertiesApi } from '@/api/property.service';
import { PropertiesResponse, PropertyResponse, UpdateProperty } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { CreatePropertyDialog } from '@/components/properties/create-property-dialog';
import { EditPropertyDialog } from '@/components/properties/edit-property-dialog';
import { PropertyCard } from '@/components/properties/property-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

async function getProperties(): Promise<PropertiesResponse> {
  try {
    return await propertiesApi.getProperties();
  } catch (error) {
    throw new Error('Failed to fetch properties');
  }
}

const Page = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<UpdateProperty | null>(null);
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: getProperties,
  });

  const deleteProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      await propertiesApi.deleteProperty(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete property');
    },
  });

  const handleEdit = useCallback((property: UpdateProperty) => {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (propertyId: string) => {
      try {
        await deleteProperty.mutateAsync(propertyId);
      } catch (error) {
        console.error('Error deleting property:', error);
      }
    },
    [deleteProperty]
  );

  const PropertySkeleton = () => (
    <Card className='w-full max-w-sm animate-pulse'>
      <div className='h-48 w-full bg-gray-200'></div>
      <div className='p-4 space-y-4'>
        <div className='h-4 bg-gray-200 rounded w-3/4'></div>
        <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        <div className='grid grid-cols-3 gap-4'>
          <div className='h-4 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded'></div>
          <div className='h-4 bg-gray-200 rounded'></div>
        </div>
      </div>
    </Card>
  );

  return (
    <Card className='h-full p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Properties</h1>
          <p className='text-sm text-muted-foreground'>Manage your property listings</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className='mr-2 h-4 w-4' /> Add Property
        </Button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {isLoading
          ? Array.from({ length: 8 }).map((_, index) => <PropertySkeleton key={index} />)
          : properties?.data?.map((property: PropertyResponse) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
      </div>

      <CreatePropertyDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      <EditPropertyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        property={selectedProperty}
      />
    </Card>
  );
};

export default Page;
