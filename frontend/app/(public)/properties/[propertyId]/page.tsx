'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Bath, Bed, Car, CheckCircle2, Mail, MapPin, Maximize2, Phone } from 'lucide-react';

import { FloatingContactForm } from '@/components/property/FloatingContactForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { api } from '@/lib/api';

interface PropertyDetails {
  id: string;
  propertyType: string;
  zoningType: string;
  listingType: string;
  propertyName: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  sqft: string;
  description: string;
  addressLine: string;
  streetName: string;
  city: string;
  zipCode: string;
  country: string;
  longitude: string;
  latitude: string;
  images: string[];
  utilities: string[];
  interiorFeatures: string[];
  exteriorFeatures: string[];
  exteriorTypes: string[];
  buildingDevelopmentFeatures: string[];
  locationFeatures: string[];
  generalFeatures: string[];
  views: string[];
  googleMapsLink: string;
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
  };
}

const Page = () => {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();

  const agentId = searchParams.get('agentId');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const propertyId = window.location.pathname.split('/').pop();
        const agentId = searchParams.get('agentId');
        const response = await api.get(
          `/public/${propertyId}${agentId ? `?agentId=${agentId}` : ''}`
        );
        setProperty(response.data);
        // Reset active image when property changes
        setActiveImage(0);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [searchParams]);

  if (loading) {
    return (
      <div className='container mx-auto p-6 animate-pulse'>
        <div className='h-96 bg-gray-200 rounded-lg mb-6' />
        <div className='space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/3' />
          <div className='h-4 bg-gray-200 rounded w-1/2' />
          <div className='h-4 bg-gray-200 rounded w-2/3' />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className='container mx-auto p-6 text-center'>
        <h1 className='text-2xl font-bold text-gray-900'>Property not found</h1>
        <p className='text-gray-600 mt-2'>
          The property you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const FeatureList = ({ title, items }: { title: string; items: string[] }) => (
    <div className='mt-6'>
      <h3 className='text-lg font-semibold mb-3'>{title}</h3>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
        {items?.map((item, index) => (
          <div key={index} className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 text-green-500' />
            <span className='text-sm'>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='container mx-auto p-6'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-8'>
          {/* Main Image Gallery */}
          <div className='relative h-[500px] rounded-lg overflow-hidden'>
            <Image
              src={property?.images?.[activeImage] || '/placeholder.jpg'}
              alt={property?.propertyName || 'Property Image'}
              fill
              className='object-cover'
            />
          </div>
          {property?.images && property.images.length > 1 && (
            <div className='flex gap-2 mt-4 overflow-x-auto pb-2'>
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden ${
                    activeImage === index ? 'ring-2 ring-[#7C3AED]' : ''
                  }`}
                >
                  <Image src={image} alt={`View ${index + 1}`} fill className='object-cover' />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-gray-600 whitespace-pre-line'>{property?.description}</p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {property?.utilities?.length > 0 && (
                  <FeatureList title='Utilities' items={property.utilities} />
                )}
                {property?.interiorFeatures?.length > 0 && (
                  <FeatureList title='Interior Features' items={property.interiorFeatures} />
                )}
                {property?.exteriorFeatures?.length > 0 && (
                  <FeatureList title='Exterior Features' items={property.exteriorFeatures} />
                )}
                {property?.locationFeatures?.length > 0 && (
                  <FeatureList title='Location Features' items={property.locationFeatures} />
                )}
                {property?.views?.length > 0 && (
                  <FeatureList title='Views' items={property.views} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          {property?.googleMapsLink && (
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='aspect-video rounded-lg overflow-hidden'>
                  <iframe
                    src={property.googleMapsLink}
                    width='100%'
                    height='100%'
                    style={{ border: 0 }}
                    allowFullScreen
                    loading='lazy'
                    referrerPolicy='no-referrer-when-downgrade'
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='lg:col-span-1'>
          <div className='sticky top-6 space-y-6'>
            {/* Quick Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-bold text-[#7C3AED]'>
                  {property?.price ? formatPrice(parseFloat(property.price)) : formatPrice(0)}
                </CardTitle>
                <div className='flex items-center gap-2 text-gray-600'>
                  <MapPin className='h-4 w-4' />
                  <span className='text-sm'>
                    {property?.addressLine}, {property?.city}, {property?.zipCode}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-center gap-2'>
                    <Bed className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Bedrooms</p>
                      <p className='font-semibold'>{property?.bedrooms}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Bath className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Bathrooms</p>
                      <p className='font-semibold'>{property?.bathrooms}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Maximize2 className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Square Feet</p>
                      <p className='font-semibold'>{property?.sqft}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Car className='h-5 w-5 text-gray-500' />
                    <div>
                      <p className='text-sm text-gray-600'>Parking</p>
                      <p className='font-semibold'>{property?.parking}</p>
                    </div>
                  </div>
                </div>

                <Separator className='my-6' />

                <div className='space-y-4'>
                  <Badge variant='secondary'>{property?.propertyType}</Badge>
                  <Badge variant='secondary'>{property?.listingType}</Badge>
                  <Badge variant='secondary'>{property?.zoningType}</Badge>
                </div>

                <div className='mt-6'>
                  {property?.agent && (
                    <>
                      <h3 className='text-lg font-semibold mb-4'>Listed By</h3>
                      <div className='flex items-center gap-4'>
                        {property.agent.avatar && (
                          <Image
                            src={property.agent.avatar}
                            alt={property.agent.name}
                            width={48}
                            height={48}
                            className='rounded-full'
                          />
                        )}
                        <div>
                          <p className='font-semibold'>{property.agent.name}</p>
                          <div className='flex flex-col gap-1 text-sm text-gray-600'>
                            <div className='flex items-center gap-1'>
                              <Phone className='h-4 w-4' />
                              <span>{property.agent.phone}</span>
                            </div>
                            <div className='flex items-center gap-1'>
                              <Mail className='h-4 w-4' />
                              <span>{property.agent.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating Contact Form */}
        <FloatingContactForm propertyId={property?.id || ''} agentId={agentId || ''} />
      </div>
    </div>
  );
};

export default Page;
