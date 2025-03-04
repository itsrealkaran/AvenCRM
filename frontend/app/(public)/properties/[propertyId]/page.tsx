'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import {
  Bath,
  Bed,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  Images,
  Mail,
  MapPin,
  Maximize,
  Navigation,
  Phone,
  Share2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import Logo from '@/components/logo';
import { Avatar } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { api } from '@/lib/api';

interface PropertyDetails {
  id: string;
  beds: number;
  baths: number;
  sqft: string;
  image: string;
  price: string;
  title: string;
  address: string;
  parking: string;
  isVerified: boolean;
  city: string;
  rooms: any[];
  views: string[];
  floors: {
    id: string;
    name: string;
    level: number;
    rooms: {
      id: string;
      name: string;
      type: string;
      width: string;
      length: string;
    }[];
  }[];
  images: string[];
  country: string;
  zipCode: string;
  bedrooms: string;
  isMetric: boolean;
  latitude: string;
  bathrooms: string;
  documents: string[];
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
  documentNames: string[];
  exteriorTypes: string[];
  googleMapsLink: string;
  generalFeatures: string[];
  exteriorFeatures: string[];
  interiorFeatures: string[];
  locationFeatures: string[];
  buildingDevelopmentFeatures: string[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  imageUrls: string[];
  agent: {
    id: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
  };
}

interface Note {
  note: string;
  time: string;
}

// Improved Image Modal Component
const ImageModal = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex,
}: {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}) => {
  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + images.length) % images.length);
  };

  // Move useEffect before any conditional returns
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isOpen, onClose]); // Added missing dependencies

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-hidden' onClick={onClose}>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300' />

      <div
        className='relative h-full w-full flex flex-col md:flex-row items-center justify-center p-4'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Main Content */}
        <div className='relative w-full h-full flex items-center justify-center'>
          {/* Close button */}
          <button
            onClick={onClose}
            className='absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white 
                     hover:bg-black/70 transition-colors duration-200'
          >
            <X className='w-6 h-6' />
          </button>

          {/* Navigation buttons */}
          <button
            onClick={handlePrevious}
            className='absolute left-4 z-50 p-3 rounded-full bg-black/50 text-white 
                     hover:bg-black/70 transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-white/20'
          >
            <ChevronLeft className='w-6 h-6' />
          </button>

          {/* Main Image */}
          <div className='relative w-full h-full flex items-center justify-center'>
            <img
              src={images[currentIndex]}
              alt={`Property view ${currentIndex + 1}`}
              className='max-h-[85vh] max-w-[85vw] object-contain 
                       transition-transform duration-300 ease-in-out'
            />
          </div>

          <button
            onClick={handleNext}
            className='absolute right-4 z-50 p-3 rounded-full bg-black/50 text-white 
                     hover:bg-black/70 transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-white/20'
          >
            <ChevronRight className='w-6 h-6' />
          </button>
        </div>

        {/* Bottom controls */}
        <div className='absolute bottom-0 inset-x-0 p-4'>
          <div className='flex flex-col items-center gap-4'>
            {/* Image counter */}
            <div className='px-4 py-2 rounded-full bg-black/50 text-white text-sm backdrop-blur-sm'>
              {currentIndex + 1} / {images.length}
            </div>

            {/* Thumbnail strip */}
            <div
              className='hidden md:flex gap-2 overflow-x-auto px-4 py-2 max-w-full 
                          bg-black/50 backdrop-blur-sm rounded-lg'
            >
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden 
                            transition-all duration-200 
                            ${currentIndex === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className='w-full h-full object-cover'
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureSection = ({ title, features }: { title: string; features: string[] }) => (
  <div className='space-y-2'>
    <h3 className='text-sm font-medium text-gray-500 border-b border-gray-800 pb-2'>{title}</h3>
    <div className='flex flex-wrap gap-2'>
      {features.map((feature, index) => (
        <span key={index} className='px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm'>
          {feature}
        </span>
      ))}
    </div>
  </div>
);

const FloorPlanSection = ({ floor, isMetric }: { floor: any; isMetric: boolean }) => (
  <div className='space-y-4'>
    <h3 className='font-medium text-gray-900'>{floor.name}</h3>
    <div className='divide-y divide-gray-200'>
      {floor.rooms.map((room: any, index: number) => (
        <div key={index} className='py-3 grid grid-cols-12 gap-4 text-sm'>
          <div className='col-span-4 text-gray-600'>{room.name}</div>
          <div className='col-span-8 text-gray-900'>
            {room.width} {isMetric ? 'm' : 'ft'} × {room.length} {isMetric ? 'm' : 'ft'}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PropertyDetails = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [isMetric, setIsMetric] = useState(false);
  const searchParams = useSearchParams();
  const agentId = searchParams.get('agentId');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: [] as Note[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      toast.loading('Sending inquiry...');
      const currentTime = new Date().toISOString(); // Format: "2025-02-06T22:19"
      const noteWithTime = {
        note: formData.notes[0]?.note || '',
        time: currentTime,
        author: 'Client',
      };
      console.log(noteWithTime);

      await api.post('/public/setLead', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        propertyId: property?.id,
        agentId,
        notes: [noteWithTime],
      });
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: [],
      });
      toast.success('Your inquiry has been sent successfully!');
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'note') {
      setFormData((prev) => ({
        ...prev,
        notes: [
          {
            note: value,
            time: new Date().toISOString().slice(0, 16),
          },
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const propertyId = window.location.pathname.split('/').pop();
        const response = await api.get(
          `/public/${propertyId}${agentId ? `?agentId=${agentId}` : ''}`
        );
        setProperty(response.data);
        setIsMetric(response.data.isMetric);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [agentId]);

  if (isLoading && !property)
    return (
      <div className='flex flex-col justify-center items-center h-screen bg-[#fafbff]'>
        <div className='relative w-32 h-32'>
          <div className='absolute inset-0 border-4 border-primary/30 rounded-full'></div>
          <div className='absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
          <div className='absolute text-[4rem] inset-2 flex items-center justify-center'>
            <Logo />
          </div>
        </div>
        <div className='mt-6 space-y-2 text-center'>
          <p className='text-lg font-medium text-gray-900'>Loading Property</p>
          <p className='text-sm text-gray-500'>Please wait while we fetch the details...</p>
        </div>
      </div>
    );

  return (
    <div className='min-h-screen bg-[#fafbff] p-4 sm:p-6 lg:p-8'>
      <div className='max-w-8xl mx-auto'>
        <h1 className='text-2xl font-medium text-center'>{property?.propertyName}</h1>
        <Card className='overflow-hidden'>
          <div className='relative'>
            {/* Desktop Layout */}
            <div className='hidden sm:grid grid-cols-4 gap-2'>
              {/* Main large image */}
              <div className='col-span-2 row-span-2 relative group overflow-hidden rounded-l-xl'>
                <img
                  src={property?.imageUrls[0]}
                  alt='Main property view'
                  className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                  onClick={() => {
                    setCurrentImageIndex(0);
                    setModalOpen(true);
                  }}
                />
                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200' />
              </div>

              {/* Right side grid */}
              <div className='col-span-2 grid grid-cols-2 grid-rows-2 gap-2'>
                {property?.imageUrls.slice(1, 5).map((image, index) => (
                  <div
                    key={index}
                    className={`relative group overflow-hidden ${
                      index === 0
                        ? ''
                        : index === 1
                          ? 'rounded-tr-xl'
                          : index === 3
                            ? 'rounded-br-xl'
                            : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Property view ${index + 2}`}
                      className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                      onClick={() => {
                        setCurrentImageIndex(index + 1);
                        setModalOpen(true);
                      }}
                    />
                    {index === 3 && property?.imageUrls.length > 5 && (
                      <div
                        className='absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-all duration-200'
                        onClick={() => {
                          setCurrentImageIndex(0);
                          setModalOpen(true);
                        }}
                      >
                        <div className='text-white text-center'>
                          <svg
                            className='w-8 h-8 mx-auto mb-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                          </svg>
                          <span className='text-lg font-medium'>
                            +{property?.imageUrls.length - 5} photos
                          </span>
                        </div>
                      </div>
                    )}
                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200' />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className='sm:hidden relative h-[400px] rounded-xl overflow-hidden'>
              <div className='relative h-full'>
                <img
                  src={property?.imageUrls[0]}
                  alt='Main property view'
                  className='w-full h-full object-cover'
                  onClick={() => {
                    setCurrentImageIndex(0);
                    setModalOpen(true);
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-b from-transparent to-black/20' />
              </div>

              {/* Mobile View All Photos Button */}
              <button
                onClick={() => {
                  setCurrentImageIndex(0);
                  setModalOpen(true);
                }}
                className='absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 
                         rounded-full shadow-lg flex items-center gap-2 
                         hover:bg-white transition-colors duration-200'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span className='font-medium'>View all {property?.imageUrls.length} photos</span>
              </button>

              {/* Mobile Image Counter */}
              <div className='absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium shadow-lg'>
                1 / {property?.imageUrls.length}
              </div>
            </div>

            {/* Desktop View All Photos Button */}
            <button
              onClick={() => {
                setCurrentImageIndex(0);
                setModalOpen(true);
              }}
              className='hidden sm:flex absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm 
                       px-4 py-2 rounded-full shadow-lg items-center gap-2 
                       hover:bg-white transition-colors duration-200'
            >
              <Images className='w-5 h-5' />
              <span className='font-medium'>Show all photos</span>
            </button>
          </div>
        </Card>

        {/* Property Details Card */}
        <Card className='p-4 sm:p-6'>
          <div className='flex justify-between items-start gap-4 mb-4'>
            <div className='space-y-4 w-full sm:w-auto'>
              <div className='space-y-1'>
                <h1 className='text-3xl sm:text-4xl font-bold text-[#4F46E5]'>
                  ${Number(property?.price).toLocaleString()}
                </h1>
                <h2 className='text-base sm:text-lg text-gray-700 font-medium'>
                  {property?.addressLine}
                </h2>
                <p className='text-sm sm:text-base text-gray-500'>
                  {property?.city}, {property?.country} {property?.zipCode}
                </p>
              </div>
            </div>

            <div className='flex gap-2 self-start'>
              <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                <Share2 className='w-6 h-6' />
              </button>
              <button className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
                <Heart className='w-6 h-6' />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-4 sm:gap-8 pt-4'>
            <div className='flex items-center gap-2'>
              <Bed className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400' />
              <div>
                <span className='text-lg sm:text-xl font-semibold'>{property?.bedrooms}</span>
                <span className='text-sm sm:text-base text-gray-500 ml-1'>bed</span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Bath className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400' />
              <div>
                <span className='text-lg sm:text-xl font-semibold'>{property?.bathrooms}</span>
                <span className='text-sm sm:text-base text-gray-500 ml-1'>bath</span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Car className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400' />
              <div>
                <span className='text-lg sm:text-xl font-semibold'>{property?.parking}</span>
                <span className='text-sm sm:text-base text-gray-500 ml-1'>parking</span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Maximize className='w-5 h-5 sm:w-6 sm:h-6 text-gray-400' />
              <div>
                <span className='text-lg sm:text-xl font-semibold'>{property?.sqft}</span>
                <span className='text-sm sm:text-base text-gray-500 ml-1'>sq ft</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Property Description Card */}
        <div className='flex flex-col gap-2 lg:flex-row'>
          <div className='flex-1 flex flex-col gap-2'>
            <Card className='p-4 sm:p-6'>
              <div className='space-y-4'>
                <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>
                  Property Description
                </h2>
                <div className='prose prose-gray max-w-none'>
                  <p className='text-gray-600 text-base sm:text-lg leading-relaxed whitespace-pre-line'>
                    {property?.description}
                  </p>
                </div>
              </div>
            </Card>

            {/* Property Summary Card */}
            <Card className='p-4 sm:p-6'>
              <div className='space-y-6'>
                <div className='space-y-4'>
                  <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>
                    Property Summary
                  </h2>

                  {/* Property Type Badges */}
                  <div className='grid grid-cols-3 gap-4'>
                    <div>
                      <span className='text-sm text-gray-500'>Property Type:</span>
                      <p className='font-medium text-gray-900'>
                        {property?.propertyType
                          && property?.propertyType
                              .split('_')
                              .join(' ')
                              .charAt(0)
                              .toUpperCase() +
                              property?.propertyType?.split('_').join(' ').slice(1)
                            }
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-500'>Zoning Type:</span>
                      <p className='font-medium text-gray-900'>
                        {property?.zoningType
                          && property?.zoningType
                              .split('_')
                              .join(' ')
                              .charAt(0)
                              .toUpperCase() +
                              property?.zoningType?.split('_').join(' ').slice(1)
                            }
                      </p>
                    </div>
                    <div>
                      <span className='text-sm text-gray-500'>Listing Type:</span>
                      <p className='font-medium text-gray-900'>
                        {property?.listingType
                          && property?.listingType
                              .split('_')
                              .join(' ')
                              .charAt(0)
                              .toUpperCase() +
                              property?.listingType?.split('_').join(' ').slice(1)
                            }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Features Grid */}
                {/* Utilities */}
                <FeatureSection title='Utilities' features={property?.utilities || []} />

                {/* Interior Features */}
                <FeatureSection
                  title='Interior Features'
                  features={property?.interiorFeatures || []}
                />

                {/* Exterior Features */}
                <FeatureSection
                  title='Exterior Features'
                  features={property?.exteriorFeatures || []}
                />

                {/* Exterior Types */}
                <FeatureSection title='Exterior Types' features={property?.exteriorTypes || []} />

                {/* Building Development Features */}
                <FeatureSection
                  title='Building Development Features'
                  features={property?.buildingDevelopmentFeatures || []}
                />

                {/* Location Features */}
                <FeatureSection
                  title='Location Features'
                  features={property?.locationFeatures || []}
                />

                {/* General Features */}
                <FeatureSection
                  title='General Features'
                  features={property?.generalFeatures || []}
                />

                {/* Views */}
                <FeatureSection title='Views' features={property?.views || []} />
              </div>
            </Card>

            {/* Floor Plan Card */}
            <Card className='p-4 sm:p-6'>
              <div className='space-y-6'>
                {/* Header */}
                <div className='flex justify-between items-center'>
                  <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>Floor Plan</h2>

                  {/* Metric/Imperial Toggle */}
                  <div className='flex items-center gap-4'>
                    <span
                      className={`text-sm ${!isMetric ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                    >
                      Imperial
                    </span>
                    <Switch checked={isMetric} onCheckedChange={setIsMetric} />
                    <span
                      className={`text-sm ${isMetric ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                    >
                      Metric
                    </span>
                  </div>
                </div>

                {/* Floor Plans */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                  {property?.floors.map((floor, index) => (
                    <FloorPlanSection
                      key={index}
                      isMetric={isMetric}
                      floor={{
                        ...floor,
                        rooms: floor.rooms.map((room) => ({
                          ...room,
                          width: isMetric
                            ? (parseFloat(room.width) * 0.3048).toFixed(2)
                            : room.width,
                          length: isMetric
                            ? (parseFloat(room.length) * 0.3048).toFixed(2)
                            : room.length,
                        }))
                      }} 
                    />
                  ))}
                </div>

                {/* Legend or Note */}
                <p className='text-sm text-gray-500 mt-4'>
                  * All dimensions are approximate and may vary. {isMetric ? 'Measurements shown in meters.' : 'Measurements shown in feet.'}
                </p>
              </div>
            </Card>

            {/* Location Card */}
            <Card className='p-4 sm:p-6'>
              <div className='space-y-6'>
                <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>Location</h2>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                  {/* Address Details */}
                  <div className='bg-gray-50 p-6 rounded-lg'>
                    <div className='space-y-4'>
                      <div className='flex items-start gap-4'>
                        <MapPin className='w-6 h-6 text-gray-400 mt-1 flex-shrink-0' />
                        <div className='space-y-2'>
                          <h3 className='font-medium text-gray-900'>Address</h3>
                          <p className='text-gray-600'>{property?.addressLine}</p>
                          <p className='text-gray-600'>
                            {property?.city}, {property?.zipCode}
                          </p>
                          <p className='text-gray-600'>{property?.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Maps */}
                  <div className='h-[400px] rounded-lg overflow-hidden bg-gray-100'>
                    {property?.latitude && property?.longitude ? (
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${property?.longitude}!3d${property?.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1234567890!5m2!1sen!2sus`}
                        width='100%'
                        height='100%'
                        style={{ border: 0 }}
                        allowFullScreen
                        loading='lazy'
                        referrerPolicy='no-referrer-when-downgrade'
                        className='rounded-lg'
                      />
                    ) : (
                      <div className='h-full w-full flex items-center justify-center'>
                        <p className='text-gray-500'>Map location not available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className='flex flex-col  gap-2'>
            {/* Agent Profile Card */}
            <Card className='p-4 sm:p-6'>
              <div className='space-y-6'>
                <h2 className='text-xl sm:text-2xl font-semibold text-gray-900'>Contact Agent</h2>

                <div className='grid grid-cols-1 gap-8'>
                  {/* Agent Details */}
                  <div className='space-y-4'>
                    <div className='flex items-start gap-4'>
                      <Avatar className='bg-red-50'>
                        <AvatarImage src={property?.agent?.avatar} />
                        <AvatarFallback className='flex items-center justify-center w-full'>
                          {property?.agent?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className='space-y-1'>
                        <h3 className='font-medium text-gray-900'>
                          {property?.agent?.name || 'Agent Name'}
                        </h3>
                        <p className='text-gray-600'>{'Real Estate Agent'}</p>
                        <div className='flex items-center gap-2 text-gray-600'>
                          <Phone className='w-4 h-4' />
                          <span>{property?.agent?.phone || '+1 234 567 8900'}</span>
                        </div>
                        <div className='flex items-center gap-2 text-gray-600'>
                          <Mail className='w-4 h-4' />
                          <span>{property?.agent?.email || 'agent@example.com'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Form */}
                  <form
                    onSubmit={handleSubmit}
                    className='space-y-6 bg-white rounded-lg p-6 shadow-sm'
                  >
                    <div className='grid gap-4'>
                      <div>
                        <label
                          htmlFor='name'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Full Name
                        </label>
                        <input
                          type='text'
                          id='name'
                          name='name'
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200'
                          placeholder='John Smith'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='email'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Email Address
                        </label>
                        <input
                          type='email'
                          id='email'
                          name='email'
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200'
                          placeholder='john@example.com'
                        />
                      </div>

                      <div>
                        <label
                          htmlFor='phone'
                          className='block text-sm font-medium text-gray-700 mb-1'
                        >
                          Phone Number
                        </label>
                        <input
                          type='tel'
                          id='phone'
                          name='phone'
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          className='w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200'
                          placeholder='(555) 123-4567'
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor='message'
                        className='block text-sm font-medium text-gray-700 mb-1'
                      >
                        Your Message
                      </label>
                      <textarea
                        id='message'
                        name='note'
                        required
                        rows={4}
                        value={formData.notes[0]?.note || ''}
                        onChange={handleChange}
                        className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors duration-200 resize-none'
                        placeholder="Hi, I'm interested in this property and would like to schedule a viewing..."
                      />
                    </div>

                    <button
                      type='submit'
                      disabled={
                        isLoading
                        // !formData.name ||
                        // !formData.email ||
                        // !formData.phone ||
                        // !formData.notes[0]?.note
                      }
                      className='w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <Mail className='w-5 h-5' />
                      {isLoading ? 'Sending...' : 'Send Inquiry'}
                    </button>

                    <p className='text-sm text-gray-500 text-center'>
                      By submitting this form, you agree to our{' '}
                      <a
                        href='https://avencrm.com/privacy-policy'
                        className='text-indigo-600 hover:text-indigo-700'
                      >
                        Privacy Policy
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Image Modal */}
        <ImageModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          images={property?.imageUrls || []}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
        />
      </div>
    </div>
  );
};

export default PropertyDetails;
