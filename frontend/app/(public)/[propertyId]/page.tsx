'use client';

import React, { useEffect, useState } from 'react';
import { PropertyData } from '@/types/propertyTypes';
import axios from 'axios';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const PropertyDetails = () => {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getProperty/${params.propertyId}`);
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
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-violet-600"></div>
    </div>;
  }

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl">Property not found</h1>
    </div>;
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8 bg-white rounded-lg p-6">
      <h2 className="text-2xl font-semibold border-b border-gray-300 pb-2 mb-4">{title}</h2>
      {children}
    </div>
  );

  const SubSection = ({ title, value }: { title: string; value: string | number }) => (
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="text-xl mt-1">{value}</p>
    </div>
  );

  const FeatureGrid = ({ items }: { items: { title: string; value: string | number }[] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <div key={index} className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">{item.title}</h3>
          <p className="text-xl mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-screen px-20 py-8 bg-[#F6F9FE]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{property.address}</h1>
        <p className="text-xl text-gray-600 mb-4">{property.title}</p>
        <div className="text-2xl font-bold text-violet-600">${property.price.toLocaleString()}</div>
      </div>

      {/* Images */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {property.images.map((image, index) => (
          <div key={index} className="relative h-64 rounded-lg overflow-hidden">
            <Image src={image} alt={`Property image ${index + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <FeatureGrid items={[
          { title: 'Bedrooms', value: property.bedrooms },
          { title: 'Total Bathrooms', value: property.bathrooms.totalBathrooms },
          { title: 'Partial Bathrooms', value: property.bathrooms.partailBathrooms }
        ]} />
      </Section>

      {/* Interior Features */}
      <Section title="Interior Features">
        <FeatureGrid items={[
          { title: 'Appliances Included', value: property.interiorFeatures.appliaanceIncluded },
          { title: 'Flooring', value: property.interiorFeatures.flooring },
          { title: 'Basement Type', value: property.interiorFeatures.basementType }
        ]} />
      </Section>

      {/* Building Features */}
      <Section title="Building Features">
        <FeatureGrid items={[
          { title: 'Features', value: property.buildingFeatures.features },
          { title: 'Foundation Type', value: property.buildingFeatures.foundationType },
          { title: 'Style', value: property.buildingFeatures.style },
          { title: 'Construction Material', value: property.buildingFeatures.constructionMaterial }
        ]} />
      </Section>

      {/* Heating & Cooling */}
      <Section title="Heating & Cooling">
        <FeatureGrid items={[
          { title: 'Cooling', value: property.heatingNcooling.cooling },
          { title: 'Fireplace', value: property.heatingNcooling.fireplace },
          { title: 'Heating Type', value: property.heatingNcooling.heatingType }
        ]} />
      </Section>

      {/* Property Summary */}
      <Section title="Property Summary">
        <FeatureGrid items={[
          { title: 'Property Type', value: property.propertySummary.propertyType },
          { title: 'Building Type', value: property.propertySummary.buildingType },
          { title: 'Square Footage', value: `${property.propertySummary.squareFootage} sq ft` },
          { title: 'Community', value: property.propertySummary.communityName },
          { title: 'Year Built', value: property.propertySummary.buildIn },
          { title: 'Annual Property Tax', value: `$${property.propertySummary.annualPropretyTax.toLocaleString()}` }
        ]} />
      </Section>

      {/* Rooms */}
      <Section title="Rooms">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {property.rooms.map((room, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{room.roomType}</h3>
              <p>Level: {room.level}</p>
              <p>Dimensions: {room.width}' × {room.length}' × {room.height}'</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Description */}
      <Section title="Description">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
      </Section>
    </div>
  );
};

export default PropertyDetails;