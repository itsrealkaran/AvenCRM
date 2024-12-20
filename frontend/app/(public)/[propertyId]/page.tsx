'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { PropertyData } from '@/types/propertyTypes';
import axios from 'axios';

const PropertyDetails = () => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/getProperty/${params.propertyId}`
        );
        setProperty(res.data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperty();
  }, [params.propertyId]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-violet-600'></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <h1 className='text-2xl'>Property not found</h1>
      </div>
    );
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className='mb-8 bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300'>
      <h2 className='text-2xl font-bold text-gray-900 mb-6'>{title}</h2>
      {children}
    </div>
  );

  const SubSection = ({ title, value }: { title: string; value: string | number }) => (
    <div className='mb-4'>
      <h3 className='text-lg font-medium text-gray-700'>{title}</h3>
      <p className='text-xl mt-1'>{value}</p>
    </div>
  );

  const FeatureGrid = ({ items }: { items: { title: string; value: string | number }[] }) => (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {items.map((item, index) => (
        <div key={index} className='mb-4'>
          <h3 className='text-lg font-semibold text-gray-700'>{item.title}</h3>
          <p className='text-xl mt-1'>{item.value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className='max-w-7xl mx-auto px-4 my-6 rounded-lg sm:px-6 lg:px-8 py-12 bg-[#F6F9FE]'>
      {/* Header */}
      <div className='mb-10 space-y-3'>
        <div className='flex items-center space-x-4'>
          <h1 className='text-4xl font-bold text-gray-900'>{property.address}</h1>
          <span className='px-4 py-1.5 bg-violet-100 whitespace-nowrap text-violet-700 rounded-full text-sm font-semibold'>
            For Sale
          </span>
        </div>
        <p className='text-xl text-gray-600'>{property.title}</p>
        <div className='text-3xl font-bold text-violet-600'>${property.price.toLocaleString()}</div>
      </div>

      {/* Images */}
      <div className='mb-12 grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='relative h-[600px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'>
          <Image
            src={property.images[0]?.imageUrl}
            alt='Main property image'
            fill
            className='object-cover'
          />
        </div>
        <div className='grid grid-cols-2 gap-4'>
          {property.images.slice(1, 5).map((image: any, index: number) => (
            <div
              key={index}
              className='relative h-[290px] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300'
            >
              <Image
                src={image.imageUrl}
                alt={`Property image ${index + 2}`}
                fill
                className='object-cover'
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className='mb-12 grid grid-cols-2 md:grid-cols-4 gap-6'>
        <div className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300'>
          <div className='text-gray-500 text-sm mb-1'>Bedrooms</div>
          <div className='text-2xl font-bold text-gray-900'>{property.bedrooms}</div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300'>
          <div className='text-gray-500 text-sm mb-1'>Bathrooms</div>
          <div className='text-2xl font-bold text-gray-900'>
            {property.bathrooms.totalBathrooms}
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300'>
          <div className='text-gray-500 text-sm mb-1'>Partial Baths</div>
          <div className='text-2xl font-bold text-gray-900'>
            {property.bathrooms.partailBathrooms}
          </div>
        </div>
        <div className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300'>
          <div className='text-gray-500 text-sm mb-1'>Square Feet</div>
          <div className='text-2xl font-bold text-gray-900'>{property.sqft}</div>
        </div>
      </div>

      {/* Interior Features */}
      <div className='space-y-8'>
        <Section title='Interior Features'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {Object.entries(property.interiorFeatures).map(([key, value], index) => (
              <div
                key={index}
                className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300'
              >
                <h3 className='text-gray-500 text-sm mb-1'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className='text-lg font-semibold text-gray-900'>{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Building Features */}
        <Section title='Building Features'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {Object.entries(property.buildingFeatures).map(([key, value], index) => (
              <div key={index} className='bg-gray-50 rounded-xl p-6'>
                <h3 className='text-gray-500 text-sm mb-1'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className='text-lg font-semibold text-gray-900'>{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Utilities */}
        <Section title='Utilities & Features'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {Object.entries(property.lotFeatures).map(([key, value], index) => (
              <div key={index} className='bg-gray-50 rounded-xl p-6'>
                <h3 className='text-gray-500 text-sm mb-1'>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className='text-lg font-semibold text-gray-900'>{value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Heating & Cooling */}
        <Section title='Heating & Cooling'>
          <FeatureGrid
            items={[
              { title: 'Cooling', value: property.heatingNcooling.cooling },
              { title: 'Fireplace', value: property.heatingNcooling.fireplace },
              { title: 'Heating Type', value: property.heatingNcooling.heatingType },
            ]}
          />
        </Section>

        {/* Property Summary */}
        <Section title='Property Summary'>
          <FeatureGrid
            items={[
              { title: 'Property Type', value: property.propertySummary.propertyType },
              { title: 'Building Type', value: property.propertySummary.buildingType },
              { title: 'Square Footage', value: `${property.propertySummary.squareFootage} sq ft` },
              { title: 'Community', value: property.propertySummary.communityName },
              { title: 'Year Built', value: property.propertySummary.buildIn },
              {
                title: 'Annual Property Tax',
                value: `$${property.propertySummary.annualPropretyTax.toLocaleString()}`,
              },
            ]}
          />
        </Section>

        {/* Rooms */}
        <Section title='Rooms'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {property.rooms.map((room, index) => (
              <div key={index} className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-semibold mb-2'>{room.roomType}</h3>
                <p>Level: {room.level}</p>
                <p>
                  Dimensions: {room.width}&apos; × {room.length}&apos; × {room.height}&apos;
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Description */}
        <Section title='Description'>
          <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
            {property.description}
          </p>
        </Section>
      </div>
    </div>
  );
};

export default PropertyDetails;
