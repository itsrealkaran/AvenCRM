'use client';

import { useEffect, useState } from 'react';
import type { PropertyData } from '@/types/property';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

import PropertyBrochure from '@/components/property-brochure';
import PropertyCard from '@/components/property-card';
import { Card, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import BrochurePlaceholder from '@/components/placeholders/brochure';

// Create a custom hook for property fetching
const useProperty = (id: string | null) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/property/${id}`);
      return response.data;
    },
    enabled: !!id, // Only fetch when id is available
  });
};

export default function Home() {
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { company } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.get('/property');
      return response.data;
    },
  });

  const { data: selectedProperty, isLoading: selectedPropertyLoading } = useProperty(selectedPropertyId);

  useEffect(() => {
    if (data) {
      const myProperty = data.myProperty.filter((property: PropertyData) => property.isVerified);
      setProperties([...myProperty, ...data.allProperty]);
    }
    setLoading(false);
  }, [data]);

  // Move plan check here, after all hooks are initialized
  if (company?.planName !== "PREMIUM" && company?.planName !== "ENTERPRISE") {
    return <BrochurePlaceholder />;
  }

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id);
  };

  if (loading && !selectedProperty) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <Card className='h-full w-full p-6'>
      <div className='flex justify-between items-center mb-4'>
        <div>
          <h1 className='text-2xl font-bold'>Brochure Builder</h1>
          <p className='text-sm text-muted-foreground'>Create and manage your property brochures</p>
        </div>
      </div>
      <div className='flex h-[90%]'>
        {/* Left side: Scrollable property list */}
        <div className='w-1/4 min-w-[250px]'>
          <div className='h-full overflow-y-auto p-4'>
            <div className='space-y-4'>
              {properties.map((property) => (
                <PropertyCard
                  key={property.id} //@ts-ignore
                  property={property.cardDetails}
                  id={property.id}
                  onClick={handleSelectProperty}
                  isSelected={selectedProperty?.id === property.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right side: Property brochure */}
        <div className='flex-1'>
          <div className='h-full overflow-y-auto px-4'>
            {selectedProperty ? (
              <PropertyBrochure
                property={selectedProperty.features}
                createdBy={selectedProperty.createdBy}
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <p className='text-gray-500'>Select a property to view its brochure</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
