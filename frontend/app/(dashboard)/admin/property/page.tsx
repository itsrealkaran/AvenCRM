'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { PropertyFormProvider } from '@/contexts/PropertyFormContext';
import { RefreshCcw } from 'lucide-react';

import PermitNumberModal from '@/components/property/permit-number-modal';
import PropertyCard from '@/components/property/PropertyCard';
import PropertyFormModal from '@/components/property/PropertyFormModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
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

interface PermitNumberInfo {
  id: string;
  propertyName: string;
  isModalOpen: boolean;
}

const Page: React.FC = () => {
  const [unverifiedProperties, setUnverifiedProperties] = useState<Property[]>([]);
  const [verifiedProperties, setVerifiedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const [isPropertyFormModalOpen, setIsPropertyFormModalOpen] = useState(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [permitNumberInfo, setPermitNumberInfo] = useState<PermitNumberInfo>({
    id: '',
    propertyName: '',
    isModalOpen: false,
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setIsRefreshing(true);
      const response = await api.get('/property/all');
      const { verifiedProperties, unverifiedProperties } = response.data;

      setUnverifiedProperties(unverifiedProperties);
      setVerifiedProperties(verifiedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleVerifyOrUnverify = async (id: string, isVerified: boolean) => {
    try {
      await api.patch(`/property/${id}/status`, { isVerified });
      fetchProperties();

      toast({
        title: 'Property Verified',
        description: 'The property has been successfully verified.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify property. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    // In a real application, you would send a delete request to your API
    // Here we're just updating the local state
    setUnverifiedProperties(unverifiedProperties.filter((prop) => prop.id !== propertyId));
    setVerifiedProperties(verifiedProperties.filter((prop) => prop.id !== propertyId));
    toast({
      title: 'Property Deleted',
      description: 'The property has been successfully deleted.',
    });
  };

  const handleEditProperty = async (id: any) => {
    try {
      toast({
        title: 'Fetching property...',
        description: 'Please wait while we fetch the property.',
      });
      const response = await api.get(`/property/${id}`);
      console.log(response.data, 'response.data');
      setPropertyToEdit({
        ...response.data.cardDetails,
        ...response.data.features,
        id: response.data.id,
      });
      setIsPropertyFormModalOpen(true);
      console.log(response.data, 'response.data');
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch the property.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.get('/property/agent');
      const agentId = response.data.agentId;
      return agentId;
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Something went wrong. Please try again later.',
      });
      return null;
    }
  };

  const handleSubmitProperty = (property: any) => {
    console.log('Property submitted in AdminView:', property);
    if (propertyToEdit) {
      // Update existing property
      setUnverifiedProperties(
        unverifiedProperties.map((p) => (p.id === propertyToEdit.id ? { ...p, ...property } : p))
      );
      setVerifiedProperties(
        verifiedProperties.map((p) => (p.id === propertyToEdit.id ? { ...p, ...property } : p))
      );
      toast({
        title: 'Property Updated',
        description: 'The property has been successfully updated.',
      });
    }
    setPropertyToEdit(null);
    setIsPropertyFormModalOpen(false);
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
    <Card className='p-6 space-y-6 min-h-full'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Property Management</h1>

          <p className='text-muted-foreground'>Review and verify property listings</p>
        </div>
        <Button variant='outline' size='sm' onClick={fetchProperties} disabled={isRefreshing}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Verification</CardTitle>
          <CardDescription>Properties that need your review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto pb-4'>
            <div className='flex flex-wrap gap-3' style={{ minWidth: 'max-content' }}>
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => <PropertySkeleton key={i} />)
              ) : unverifiedProperties.length === 0 ? (
                <p className='text-center text-muted-foreground py-8 w-full'>
                  No properties pending verification
                </p>
              ) : (
                unverifiedProperties.map((prop: any) => (
                  <PropertyCard
                    key={prop.id}
                    id={prop.id}
                    cardDetails={prop.cardDetails}
                    agent={prop.createdBy}
                    isVerified={prop.isVerified}
                    onVerifyOrUnverify={() =>
                      setPermitNumberInfo({
                        id: prop.id,
                        propertyName: prop.cardDetails.title,
                        isModalOpen: true,
                      })
                    }
                    onDelete={() => handleDeleteProperty(prop.id)}
                    onEdit={() => handleEditProperty(prop.id)}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verified Properties</CardTitle>
          <CardDescription>All verified property listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto pb-4'>
            <div className='flex flex-wrap gap-3' style={{ minWidth: 'max-content' }}>
              {isLoading
                ? Array(6)
                    .fill(0)
                    .map((_, i) => <PropertySkeleton key={i} />)
                : verifiedProperties.map((prop: any) => (
                    <PropertyCard
                      key={prop.id}
                      id={prop.id}
                      cardDetails={prop.cardDetails}
                      agent={prop.createdBy}
                      isVerified={prop.isVerified}
                      onVerifyOrUnverify={() => handleVerifyOrUnverify(prop.id, false)}
                      onDelete={() => handleDeleteProperty(prop.id)}
                      onShare={handleShare}
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
      <PermitNumberModal
        isOpen={permitNumberInfo.isModalOpen}
        onClose={() => setPermitNumberInfo({ id: '', propertyName: '', isModalOpen: false })}
        id={permitNumberInfo.id}
        propertyName={permitNumberInfo.propertyName}
      />
    </Card>
  );
};

export default Page;
