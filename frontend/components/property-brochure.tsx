'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { PropertyData } from '@/types/property';
import { AvatarFallback } from '@radix-ui/react-avatar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Bath,
  Bed,
  Building2,
  Download,
  Mail,
  MapPin,
  Phone,
  SquareIcon as SquareFoot,
} from 'lucide-react';

import Logo from '@/components/logo';
import { Button } from '@/components/ui/button';

import { Avatar, AvatarImage } from './ui/avatar';

interface PropertyBrochureProps {
  property: PropertyData;
  createdBy: {
    name: string;
    phone: string;
    email: string;
  };
}

export default function PropertyBrochure({ property, createdBy }: PropertyBrochureProps) {
  const brochureRef = useRef<HTMLDivElement>(null);
  const { formatPrice } = useCurrency();

  const handleDownloadPDF = async () => {
    if (!brochureRef.current) return;

    // Calculate dimensions for 9:16 aspect ratio
    const aspectRatio = 9 / 16;
    const targetHeight = 1920;
    const targetWidth = targetHeight * aspectRatio; // This will be 1080

    // Temporarily adjust content for capture
    brochureRef.current.style.width = `${targetWidth}px`;
    brochureRef.current.style.height = `${targetHeight}px`;

    const canvas = await html2canvas(brochureRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Reset the styles after capture
    brochureRef.current.style.width = '';
    brochureRef.current.style.height = '';

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Create PDF in portrait orientation
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 373.33], // A4 width and adjusted height for 9:16 ratio
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate dimensions to maintain 9:16 ratio
    const margin = 10;
    const usableWidth = pageWidth - (margin * 2);
    const usableHeight = (usableWidth / 9) * 16; // Maintain 9:16 ratio

    // Center horizontally and vertically
    const x = margin;
    const y = (pageHeight - usableHeight) / 2;

    pdf.addImage(
      imgData,
      'JPEG',
      x,
      y,
      usableWidth,
      usableHeight,
      undefined,
      'MEDIUM'
    );

    const filename = property.title
      ? `${property.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.pdf`
      : 'property-brochure.pdf';
    
    pdf.save(filename);
  };

  const handleDownloadImage = async () => {
    if (!brochureRef.current) return;

    // Calculate dimensions for 9:16 aspect ratio
    const aspectRatio = 9 / 16;
    const targetHeight = 1920; // Use height as base dimension
    const targetWidth = targetHeight * aspectRatio; // This will be 1080

    const canvas = await html2canvas(brochureRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
    });

    // Create a new canvas with 9:16 ratio
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = targetWidth;
    outputCanvas.height = targetHeight;
    const ctx = outputCanvas.getContext('2d');

    if (ctx) {
      // Fill background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Calculate scaling to fit content while maintaining aspect ratio
      const scale = Math.min(
        targetWidth / canvas.width,
        targetHeight / canvas.height
      );

      // Calculate position to center the content
      const x = (targetWidth - canvas.width * scale) / 2;
      const y = (targetHeight - canvas.height * scale) / 2;

      // Draw the content centered in the 9:16 canvas
      ctx.drawImage(
        canvas,
        x,
        y,
        canvas.width * scale,
        canvas.height * scale
      );
    }

    const link = document.createElement('a');
    link.download = property.title
      ? `${property.title.replace(/\s+/g, '-').toLowerCase()}.jpg`
      : 'property.jpg';
    link.href = outputCanvas.toDataURL('image/jpeg', 0.9);
    link.click();
  };

  const allFeatures = [
    ...property.interiorFeatures.map((f) => ({ type: 'Interior', name: f })),
    ...property.exteriorFeatures.map((f) => ({ type: 'Exterior', name: f })),
    ...property.locationFeatures.map((f) => ({ type: 'Location', name: f })),
    ...property.generalFeatures.map((f) => ({ type: 'General', name: f })),
  ];

  return (
    <div className='flex flex-col items-center'>
      <div className='flex gap-2 mb-4 print:hidden'>
        <Button onClick={handleDownloadPDF} variant='outline' size='sm'>
          <Download className='h-4 w-4 mr-2' />
          Download PDF
        </Button>
        <Button onClick={handleDownloadImage} variant='outline' size='sm'>
          <Download className='h-4 w-4 mr-2' />
          Download JPG
        </Button>
      </div>

      {/* Letter size container (8.5" x 11") */}
      <div
        ref={brochureRef}
        className='w-full max-w-[215.9mm] bg-white shadow-lg mx-auto overflow-hidden'
        style={{
          pageBreakAfter: 'always',
          printColorAdjust: 'exact',
        }}
      >
        {/* Hero Section */}
        <div className='relative'>
          <div className='w-full h-[120mm] relative'>
            <Image
              src={property.images[0] || '/placeholder.svg?height=600&width=1200'}
              alt={property.title}
              fill
              className='object-cover'
              priority
            />
            <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60'></div>
          </div>

          {/* Property Info Overlay */}
          <div className='absolute bottom-0 left-0 right-0 text-white p-6'>
            <div className='max-w-4xl mx-auto'>
              <div className='flex items-center mb-1'>
                <MapPin className='h-4 w-4 mr-1' />
                <p className='text-gray-200 text-sm'>{property.address}</p>
              </div>
              <h1 className='text-4xl font-bold mb-2'>{property.title}</h1>
              <div className='flex justify-between items-end'>
                <div className='flex gap-4'>
                  <div className='flex items-center'>
                    <Bed className='h-5 w-5 mr-1' />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                  <div className='flex items-center'>
                    <Bath className='h-5 w-5 mr-1' />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                  <div className='flex items-center'>
                    <SquareFoot className='h-5 w-5 mr-1' />
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
                <p className='text-3xl font-bold'>{formatPrice(Number(property.price))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className='px-8 py-6'>
          <div className='grid grid-cols-3 gap-8'>
            {/* Left Column */}
            <div className='col-span-1'>
              {/* Gallery */}
              <div className='grid grid-cols-2 gap-2 mb-6'>
                {property.images.map((image, index) => (
                  <div key={index} className='relative aspect-square w-full'>
                    <Image
                      src={image}
                      alt={`Property image ${index + 1}`}
                      fill
                      className='object-cover rounded'
                    />
                  </div>
                ))}
              </div>

              {/* Broker Information */}
              <div className='bg-gray-50 rounded-xl flex flex-col gap-4 items-center py-4 px-2 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200'>
                <div className='flex items-center gap-6'>
                  <div className='relative h-8 w-8 flex-shrink-0'>
                    <Avatar className='bg-red-50'>
                      <AvatarFallback className='flex items-center justify-center w-full text-gray-500'>
                        {createdBy?.name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <h2 className='font-semibold text-sm text-gray-800'>{createdBy.name}</h2>
                    <p className='text-primary/80 font-medium text-[0.6rem]'>
                      Licensed Real Estate Broker
                    </p>
                  </div>
                </div>
                <div>
                  <div>
                    <div className='flex items-center gap-3 text-gray-600 text-xs mt-2'>
                      <Phone className='h-4 w-4 text-primary/70' />
                      <p className=''>{createdBy.phone}</p>
                    </div>
                  </div>

                  <div className='mt-3 space-y-3'>
                    <div className='flex items-center gap-3 text-gray-600 text-xs'>
                      <Mail className='h-4 w-4 text-primary/70' />
                      <p>{createdBy.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='col-span-2'>
              {/* Property Description */}
              <div className='mb-6'>
                <h2 className='text-xl font-bold mb-3 text-gray-800'>Property Overview</h2>
                <p className='text-gray-700 leading-relaxed'>{property.description}</p>
              </div>

              {/* Property Highlights */}
              <div className='mb-6'>
                <h2 className='text-xl font-bold mb-3 text-gray-800'>Property Highlights</h2>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='bg-blue-50 p-3 rounded-lg border border-blue-100'>
                    <h3 className='font-semibold text-blue-800 mb-1'>Location</h3>
                    <p className='text-sm text-gray-700'>
                      {property.city}, {property.country}
                    </p>
                  </div>
                  <div className='bg-green-50 p-3 rounded-lg border border-green-100'>
                    <h3 className='font-semibold text-green-800 mb-1'>Property Type</h3>
                    <p className='text-sm text-gray-700'>
                      {property.propertyType.charAt(0).toUpperCase() +
                        property.propertyType.slice(1)}
                    </p>
                  </div>
                  <div className='bg-amber-50 p-3 rounded-lg border border-amber-100'>
                    <h3 className='font-semibold text-amber-800 mb-1'>Year Built</h3>
                    <p className='text-sm text-gray-700'>2023</p>
                  </div>
                  <div className='bg-purple-50 p-3 rounded-lg border border-purple-100'>
                    <h3 className='font-semibold text-purple-800 mb-1'>Parking</h3>
                    <p className='text-sm text-gray-700'>{property.parking} Spaces</p>
                  </div>
                </div>
              </div>

              {/* Room Specifications */}
              <div className='mb-6'>
                <h2 className='text-xl font-bold mb-3 text-gray-800'>Room Dimensions</h2>
                <div className='grid grid-cols-2 gap-x-8 gap-y-2'>
                  {property.floors
                    .flatMap((floor) =>
                      floor.rooms.map((room) => ({
                        name: room.name || `Room (${floor.name})`,
                        dimensions: `${room.width}x${room.length}`,
                      }))
                    )
                    .slice(0, 8)
                    .map((spec, index) => (
                      <div
                        key={index}
                        className='flex items-center justify-between border-b border-gray-100 py-1'
                      >
                        <span className='text-gray-700 text-sm font-medium'>
                          {spec.name || 'Room'}
                        </span>
                        <span className='text-gray-600 text-sm'>{spec.dimensions}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h2 className='text-xl font-bold mb-3 text-gray-800'>Features</h2>
                <div className='grid grid-cols-2 gap-x-8 mb-3 gap-y-1'>
                  {allFeatures.slice(0, 10).map((feature, index) => (
                    <div key={`feature-${index}`} className='flex items-center'>
                      <div className='h-2 w-2 rounded-full bg-primary mr-2'></div>
                      <span className='text-gray-700 text-sm'>{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Footer with Agency Info */}
          <div className='border-t border-gray-200 p-4 flex justify-between items-center bg-white'>
            <div className='flex items-center'>
              <div className='relative text-[2rem] mr-4'>
                <Logo />
              </div>
              <div className='text-xs text-gray-600'>
                <p className='font-medium'>Prudential Real Estate</p>
                <p>932 Broadview Avenue, {property.city}</p>
                <p>{property.zipCode}</p>
              </div>
            </div>
            <div className='text-xs text-gray-500 max-w-[200px]'>
              <p>Information presented should be verified through independent inspection</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
