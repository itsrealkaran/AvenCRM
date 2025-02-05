'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { PropertyFormProvider } from '@/contexts/PropertyFormContext';
import { Plus, RefreshCcw } from 'lucide-react';

import PropertyCard from '@/components/property/PropertyCard';
import PropertyFormModal from '@/components/property/PropertyFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  isVerified: boolean;
  image?: string;
  beds: number;
  baths: number;
  sqft: number;
  agent: {
    name: string;
    image?: string;
  };
}

const Page: React.FC = () => {
  const [myProperties, setMyProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPropertyFormModalOpen, setIsPropertyFormModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsRefreshing(true);
      const [myPropsRes, allPropsRes] = await Promise.all([
        fetch('/api/properties?agentId=123'),
        fetch('/api/properties'),
      ]);
      const myProps = await myPropsRes.json();
      const allProps = await allPropsRes.json();
      setMyProperties(myProps);
      setAllProperties(allProps);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSubmitProperty = (property: any) => {
    console.log('Property submitted in AgentView:', property);
    if (propertyToEdit) {
      // Update existing property
      setMyProperties(
        myProperties.map((p) => (p.id === propertyToEdit.id ? { ...p, ...property } : p))
      );
      setAllProperties(
        allProperties.map((p) => (p.id === propertyToEdit.id ? { ...p, ...property } : p))
      );
      toast({
        title: 'Property Updated',
        description: 'The property has been successfully updated.',
      });
    } else {
      // Add new property
      const newProperty = { id: String(Date.now()), ...property };
      setMyProperties([...myProperties, newProperty]);
      setAllProperties([...allProperties, newProperty]);
      toast({
        title: 'Property Added',
        description: 'The new property has been successfully added.',
      });
    }
    setPropertyToEdit(null);
    setIsPropertyFormModalOpen(false);
  };

  const handleDeleteProperty = (propertyId: string) => {
    // In a real application, you would send a delete request to your API
    // Here we're just updating the local state
    setMyProperties(myProperties.filter((prop) => prop.id !== propertyId));
    setAllProperties(allProperties.filter((prop) => prop.id !== propertyId));
    toast({
      title: 'Property Deleted',
      description: 'The property has been successfully deleted.',
    });
  };

  const handleEditProperty = (property: Property) => {
    setPropertyToEdit(property);
    setIsPropertyFormModalOpen(true);
  };

  const PropertySkeleton = () => (
    <Card className='w-[260px] flex-shrink-0'>
      <CardContent className='p-0'>
        <Skeleton className='h-[180px] w-full' />
        <div className='p-3 space-y-3'>
          <Skeleton className='h-3 w-3/4' />
          <Skeleton className='h-3 w-1/2' />
          <Skeleton className='h-3 w-full' />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className='space-y-8 p-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Property Management</h1>
          <p className='text-muted-foreground'>Manage and track your property listings</p>
        </div>
        <div className='flex gap-3'>
          <Button variant='outline' size='sm' onClick={fetchProperties} disabled={isRefreshing}>
            <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size='sm'
            className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
            onClick={() => {
              setPropertyToEdit(null);
              setIsPropertyFormModalOpen(true);
            }}
          >
            <Plus className='w-4 h-4 mr-2' />
            Add Property
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
          <CardDescription>Properties that need verification will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto pb-4'>
            <div className='flex flex-nowrap gap-3' style={{ minWidth: 'max-content' }}>
              {isLoading
                ? Array(3)
                    .fill(0)
                    .map((_, i) => <PropertySkeleton key={i} />)
                : myProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      {...prop}
                      onDelete={() => handleDeleteProperty(prop.id)}
                      onEdit={() => handleEditProperty(prop)}
                    />
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
          <CardDescription>Browse all available properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto pb-4'>
            <div className='flex flex-wrap gap-3' style={{ minWidth: 'max-content' }}>
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => <PropertySkeleton key={i} />)
                : allProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      {...prop}
                      onDelete={() => handleDeleteProperty(prop.id)}
                      onEdit={() => handleEditProperty(prop)}
                    />
                  ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <PropertyFormProvider>
        <PropertyFormModal
          isOpen={isPropertyFormModalOpen}
          onClose={() => setIsPropertyFormModalOpen(false)}
          onSubmit={handleSubmitProperty}
          propertyToEdit={propertyToEdit}
        />
      </PropertyFormProvider>
    </div>
  );
};

export default Page;
