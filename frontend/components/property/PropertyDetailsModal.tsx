import React, { useEffect, useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Bath, Bed, Building2, Car, Globe, Home, Loader2, MapPin, Maximize2 } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  type: string;
  width: string;
  length: string;
}

interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
}

interface PropertyDetails {
  id: string;
  slug: string;
  cardDetails: {
    id: string;
    beds: number;
    sqft: number;
    baths: number;
    image: string;
    price: number;
    title: string;
    address: string;
    parking: number;
    isVerified: boolean;
  };
  features: {
    city: string;
    sqft: string;
    price: string;
    rooms: any[];
    views: any[];
    floors: Floor[];
    images: string[];
    country: string;
    parking: string;
    zipCode: string;
    bedrooms: string;
    isMetric: boolean;
    latitude: string;
    bathrooms: string;
    documents: any[];
    documentNames: string[];
    longitude: string;
    utilities: string[];
    imageNames: string[];
    streetName: string;
    zoningType: string;
    addressLine: string;
    description: string;
    listingType: string;
    propertyName: string;
    propertyType: string;
    exteriorTypes: string[];
    googleMapsLink: string;
    generalFeatures: string[];
    exteriorFeatures: string[];
    interiorFeatures: string[];
    locationFeatures: string[];
    buildingDevelopmentFeatures: string[];
  };
  isVerified: boolean;
  verifiedDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  companyId: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}

interface PropertyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    cardDetails: {
      title: string;
      address: string;
      price: number;
      image?: string;
      beds: number;
      baths: number;
      sqft: number;
      parking?: number;
    };
    agent: {
      name: string;
      image?: string;
    };
    id: string;
  };
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  isOpen,
  onClose,
  property,
}) => {
  const { formatPrice } = useCurrency();
  const { cardDetails, agent, id } = property;
  const [loading, setLoading] = useState(true);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!isOpen) return;

      try {
        setLoading(true);
        const response = await api.get(`/property/${id}`);
        console.log(response.data, 'response.data');
        setPropertyDetails(response.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch property details. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetails();
  }, [id, isOpen]);

  const renderFeatureList = (features: string[]) => {
    if (!features || features.length === 0) return null;
    return (
      <div className='flex flex-wrap gap-2'>
        {features.map((feature, index) => (
          <Badge key={index} variant='secondary' className='text-xs'>
            {feature}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        {loading ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='w-8 h-8 animate-spin text-[#4F46E5]' />
          </div>
        ) : propertyDetails ? (
          <>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold'>
                {propertyDetails.features.propertyName}
              </DialogTitle>
              <div className='flex items-center gap-2 mt-2'>
                <MapPin className='w-4 h-4 text-gray-500' />
                <span className='text-gray-700'>
                  {propertyDetails.features.addressLine}, {propertyDetails.features.city},{' '}
                  {propertyDetails.features.country} {propertyDetails.features.zipCode}
                </span>
              </div>
            </DialogHeader>

            <Tabs defaultValue='details' className='w-full'>
              <TabsList className='grid w-full grid-cols-5'>
                <TabsTrigger value='details'>Details</TabsTrigger>
                <TabsTrigger value='features'>Features</TabsTrigger>
                <TabsTrigger value='utilities'>Utilities</TabsTrigger>
                <TabsTrigger value='floors'>Floors & Rooms</TabsTrigger>
                <TabsTrigger value='documents'>Documents</TabsTrigger>
              </TabsList>

              <TabsContent value='details' className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div className='aspect-[4/3] overflow-hidden rounded-lg'>
                      <img
                        src={propertyDetails.features.images[0] || '/placeholder.svg'}
                        alt={propertyDetails.features.propertyName}
                        className='w-full h-full object-cover'
                      />
                    </div>

                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='font-medium mb-2'>Description</h4>
                      <p className='text-sm text-gray-600'>
                        {propertyDetails.features.description}
                      </p>
                    </div>
                  </div>

                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-3xl font-bold text-[#4F46E5]'>
                        {formatPrice(propertyDetails.cardDetails.price)}
                      </h3>
                      <div className='flex gap-2 mt-2'>
                        <Badge variant='outline'>{propertyDetails.features.propertyType}</Badge>
                        <Badge variant='outline'>{propertyDetails.features.listingType}</Badge>
                        <Badge variant='outline'>{propertyDetails.features.zoningType}</Badge>
                      </div>
                    </div>

                    <div className='grid grid-cols-2 gap-4'>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          <Bed className='w-5 h-5 text-gray-500' />
                          <div>
                            <p className='text-sm font-medium'>
                              {propertyDetails.cardDetails.beds}
                            </p>
                            <p className='text-xs text-gray-500'>Bedrooms</p>
                          </div>
                        </div>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          <Bath className='w-5 h-5 text-gray-500' />
                          <div>
                            <p className='text-sm font-medium'>
                              {propertyDetails.cardDetails.baths}
                            </p>
                            <p className='text-xs text-gray-500'>Bathrooms</p>
                          </div>
                        </div>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          <Car className='w-5 h-5 text-gray-500' />
                          <div>
                            <p className='text-sm font-medium'>
                              {propertyDetails.cardDetails.parking}
                            </p>
                            <p className='text-xs text-gray-500'>Parking</p>
                          </div>
                        </div>
                      </div>

                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex items-center gap-2'>
                          <Maximize2 className='w-5 h-5 text-gray-500' />
                          <div>
                            <p className='text-sm font-medium'>
                              {propertyDetails.cardDetails.sqft}{' '}
                              {propertyDetails.features.isMetric ? 'm²' : 'ft²'}
                            </p>
                            <p className='text-xs text-gray-500'>Area</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {propertyDetails.features.googleMapsLink && (
                      <a
                        href={propertyDetails.features.googleMapsLink}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 text-[#4F46E5] hover:underline'
                      >
                        <Globe className='w-4 h-4' />
                        View on Google Maps
                      </a>
                    )}

                    <div className='border-t pt-4'>
                      <h4 className='font-medium mb-3'>Listed By</h4>
                      <div className='flex items-center gap-3'>
                        <Avatar className='w-10 h-10'>
                          <AvatarFallback>{propertyDetails.createdBy.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>{propertyDetails.createdBy.name}</p>
                          <p className='text-sm text-gray-500'>{propertyDetails.createdBy.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='features' className='space-y-6'>
                {propertyDetails.features.generalFeatures?.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>General Features</h4>
                    {renderFeatureList(propertyDetails.features.generalFeatures)}
                  </div>
                )}

                {propertyDetails.features.exteriorFeatures?.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Exterior Features</h4>
                    {renderFeatureList(propertyDetails.features.exteriorFeatures)}
                  </div>
                )}

                {propertyDetails.features.interiorFeatures?.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Interior Features</h4>
                    {renderFeatureList(propertyDetails.features.interiorFeatures)}
                  </div>
                )}

                {propertyDetails.features.locationFeatures?.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Location Features</h4>
                    {renderFeatureList(propertyDetails.features.locationFeatures)}
                  </div>
                )}

                {propertyDetails.features.buildingDevelopmentFeatures?.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Building & Development Features</h4>
                    {renderFeatureList(propertyDetails.features.buildingDevelopmentFeatures)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='utilities' className='space-y-6'>
                {propertyDetails.features.utilities?.length > 0 && (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Available Utilities</h4>
                    {renderFeatureList(propertyDetails.features.utilities)}
                  </div>
                )}
              </TabsContent>

              <TabsContent value='floors' className='space-y-6'>
                {propertyDetails.features.floors?.length > 0 ? (
                  propertyDetails.features.floors.map((floor) => (
                    <div key={floor.id} className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='font-medium mb-3'>{floor.name}</h4>
                      {floor.rooms?.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                          {floor.rooms.map((room) => (
                            <div key={room.id} className='bg-white p-3 rounded border'>
                              <div className='flex items-center gap-2'>
                                <Home className='w-4 h-4 text-gray-500' />
                                <span className='font-medium'>{room.name}</span>
                              </div>
                              <div className='mt-2 text-sm text-gray-600'>
                                <p>Type: {room.type}</p>
                                <p>
                                  Size: {room.width} × {room.length}
                                  {propertyDetails.features.isMetric ? ' m' : ' ft'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className='text-sm text-gray-500'>No rooms added</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className='text-center text-gray-500'>No floor plans available</p>
                )}
              </TabsContent>
              <TabsContent value='documents' className='space-y-6'>
                {propertyDetails.features.documents?.length > 0 ? (
                  <div className='space-y-2'>
                    <h4 className='font-medium'>Documents</h4>
                    {propertyDetails.features.documentNames &&
                      propertyDetails.features.documentNames.map((document, index) => (
                        <div key={document}>
                          <a
                            href={propertyDetails.features.documents[index]}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-500 hover:underline'
                          >
                            {document}
                          </a>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className='text-center text-gray-500'>No documents available</p>
                )}
              </TabsContent>
            </Tabs>

            {!propertyDetails.isVerified && (
              <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <p className='text-sm text-yellow-800 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-yellow-400 rounded-full'></span>
                  This property is pending verification
                </p>
              </div>
            )}
          </>
        ) : (
          <div className='p-4 text-center text-gray-500'>Failed to load property details</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PropertyDetailsModal;
