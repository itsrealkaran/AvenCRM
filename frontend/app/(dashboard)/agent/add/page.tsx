'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PropertyData } from '@/types/propertyTypes';
import axios from 'axios';
import { Maximize2, Plus, Printer, Share2 } from 'lucide-react';

const Page = () => {
  const [formData, setFormData] = useState<PropertyData>({
    id: 0,
    address: '',
    price: 0,
    bedrooms: 0,
    sqft: 0,
    description: '',
    title: '',
    imageUrl: '',
    propertySummary: {
      propertyType: '',
      buildingType: '',
      squareFootage: 0,
      communityName: '',
      subdivision: '',
      storeys: 0,
      landSize: 0,
      buildIn: '',
      annualPropretyTax: 0,
      parkingType: '',
    },
    bathrooms: {
      totalBathrooms: '',
      partailBathrooms: 0,
    },
    interiorFeatures: {
      appliaanceIncluded: '',
      flooring: '',
      basementType: '',
    },
    buildingFeatures: {
      features: '',
      foundationType: '',
      style: '',
      architectureStyle: '',
      constructionMaterial: '',
    },
    heatingNcooling: {
      cooling: '',
      fireplace: '',
      heatingType: '',
    },
    exteriorFeatures: {
      exteriorFinishing: '',
      roofType: '',
    },
    parking: {
      squareFootage: '',
      totalFinishedArea: 0,
    },
    measurements: {
      sqft: 0,
      totalfinishSqft: 0,
    },
    rooms: [],
    lotFeatures: {
      fencing: '',
      frontage: '',
      landDepth: '',
    },
    agentId: '',
    images: [], // Add images array to store uploaded images
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    section?: string,
    subsection?: string
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      'price',
      'bedrooms',
      'sqft',
      'storeys',
      'landSize',
      'partailBathrooms',
      'totalfinishSqft',
      'annualPropretyTax',
      'totalFinishedArea',
    ];

    const processedValue = numericFields.includes(name) ? Number(value) : value;

    if (section && subsection) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          //@ts-ignore
          ...prev[section],
          [subsection]: processedValue,
        },
      }));
    } else if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          //@ts-ignore
          ...prev[section],
          [name]: processedValue,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('image/jpeg') && !file.type.includes('image/png')) {
      alert('Please upload only JPEG or PNG files');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/property/upload-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Update the form data with the new image URL
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, response.data.imageUrl],
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    const token = localStorage.getItem('accessToken');
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/property`,
      {
        formData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='p-6 rounded-lg shadow-sm space-y-8 h-[91vh] overflow-y-auto'
    >
      {/* Header */}
      <div className='flex justify-between items-center'>
        <h2 className='text-xl font-semibold'>Property Details</h2>
        <div className='flex gap-2'>
          <button type='button' className='p-2 hover:bg-gray-100 rounded-lg'>
            <Printer size={20} />
          </button>
          <button type='button' className='p-2 hover:bg-gray-100 rounded-lg'>
            <Share2 size={20} />
          </button>
          <button type='button' className='p-2 hover:bg-gray-100 rounded-lg'>
            <Maximize2 size={20} />
          </button>
        </div>
      </div>

      {/* Adding images */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-sm'>
        <label className='h-32 border-[1px] border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors'>
          Upload Images
          <input
            type='file'
            accept='image/jpeg,image/png'
            onChange={handleFileUpload}
            className='hidden'
          />
          <Plus className='text-gray-400' />
        </label>
        {formData.images.map((image, index) => (
          <div key={index} className='h-32 border-[1px] border-gray-300 rounded-lg overflow-hidden'>
            <Image
              src={image}
              alt={`Property image ${index + 1}`}
              className='w-full h-full object-cover'
              width={100}
              height={100}
            />
          </div>
        ))}
      </div>

      {/* Basic Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-white p-6 rounded-lg shadow-sm'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Title</label>
          <input
            type='text'
            name='title'
            value={formData.title}
            onChange={handleInputChange}
            className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
          <input
            type='text'
            name='address'
            value={formData.address}
            onChange={handleInputChange}
            className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Price</label>
          <input
            type='number'
            name='price'
            value={formData.price}
            onChange={handleInputChange}
            className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Bedrooms</label>
          <input
            type='number'
            name='bedrooms'
            value={formData.bedrooms}
            onChange={handleInputChange}
            className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Square Feet</label>
          <input
            type='number'
            name='sqft'
            value={formData.sqft}
            onChange={handleInputChange}
            className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>Description</label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
          />
        </div>
      </div>

      {/* Property Summary */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Property Summary</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Annual Property Tax
            </label>
            <input
              type='number'
              name='annualPropretyTax'
              value={formData.propertySummary.annualPropretyTax}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Property Type</label>
            <input
              type='text'
              name='propertyType'
              value={formData.propertySummary.propertyType}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Building Type</label>
            <input
              type='text'
              name='buildingType'
              value={formData.propertySummary.buildingType}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Square Footage</label>
            <input
              type='number'
              name='squareFootage'
              value={formData.propertySummary.squareFootage}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Community Name</label>
            <input
              type='text'
              name='communityName'
              value={formData.propertySummary.communityName}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Subdivision</label>
            <input
              type='text'
              name='subdivision'
              value={formData.propertySummary.subdivision}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Storeys</label>
            <input
              type='number'
              name='storeys'
              value={formData.propertySummary.storeys}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Land Size</label>
            <input
              type='number'
              name='landSize'
              value={formData.propertySummary.landSize}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Build In</label>
            <input
              type='text'
              name='buildIn'
              value={formData.propertySummary.buildIn}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Parking Type</label>
            <input
              type='text'
              name='parkingType'
              value={formData.propertySummary.parkingType}
              onChange={(e) => handleInputChange(e, 'propertySummary')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Interior Features */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Interior Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Appliances Included
            </label>
            <input
              type='text'
              name='appliaanceIncluded'
              value={formData.interiorFeatures.appliaanceIncluded}
              onChange={(e) => handleInputChange(e, 'interiorFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Flooring</label>
            <input
              type='text'
              name='flooring'
              value={formData.interiorFeatures.flooring}
              onChange={(e) => handleInputChange(e, 'interiorFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Basement Type</label>
            <input
              type='text'
              name='basementType'
              value={formData.interiorFeatures.basementType}
              onChange={(e) => handleInputChange(e, 'interiorFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Building Features */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Building Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Features</label>
            <input
              type='text'
              name='features'
              value={formData.buildingFeatures.features}
              onChange={(e) => handleInputChange(e, 'buildingFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Foundation Type</label>
            <input
              type='text'
              name='foundationType'
              value={formData.buildingFeatures.foundationType}
              onChange={(e) => handleInputChange(e, 'buildingFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Style</label>
            <input
              type='text'
              name='style'
              value={formData.buildingFeatures.style}
              onChange={(e) => handleInputChange(e, 'buildingFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Architecture Style
            </label>
            <input
              type='text'
              name='architectureStyle'
              value={formData.buildingFeatures.architectureStyle}
              onChange={(e) => handleInputChange(e, 'buildingFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Construction Material
            </label>
            <input
              type='text'
              name='constructionMaterial'
              value={formData.buildingFeatures.constructionMaterial}
              onChange={(e) => handleInputChange(e, 'buildingFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Heating & Cooling */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Heating & Cooling</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Cooling</label>
            <input
              type='text'
              name='cooling'
              value={formData.heatingNcooling.cooling}
              onChange={(e) => handleInputChange(e, 'heatingNcooling')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Fireplace</label>
            <input
              type='text'
              name='fireplace'
              value={formData.heatingNcooling.fireplace}
              onChange={(e) => handleInputChange(e, 'heatingNcooling')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Heating Type</label>
            <input
              type='text'
              name='heatingType'
              value={formData.heatingNcooling.heatingType}
              onChange={(e) => handleInputChange(e, 'heatingNcooling')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Exterior Features */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Exterior Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Exterior Finishing
            </label>
            <input
              type='text'
              name='exteriorFinishing'
              value={formData.exteriorFeatures.exteriorFinishing}
              onChange={(e) => handleInputChange(e, 'exteriorFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Roof Type</label>
            <input
              type='text'
              name='roofType'
              value={formData.exteriorFeatures.roofType}
              onChange={(e) => handleInputChange(e, 'exteriorFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Parking */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Parking</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Square Footage</label>
            <input
              type='text'
              name='squareFootage'
              value={formData.parking.squareFootage}
              onChange={(e) => handleInputChange(e, 'parking')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Total Finished Area
            </label>
            <input
              type='number'
              name='totalFinishedArea'
              value={formData.parking.totalFinishedArea}
              onChange={(e) => handleInputChange(e, 'parking')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Lot Features */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Lot Features</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Fencing</label>
            <input
              type='text'
              name='fencing'
              value={formData.lotFeatures.fencing}
              onChange={(e) => handleInputChange(e, 'lotFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Frontage</label>
            <input
              type='text'
              name='frontage'
              value={formData.lotFeatures.frontage}
              onChange={(e) => handleInputChange(e, 'lotFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Land Depth</label>
            <input
              type='text'
              name='landDepth'
              value={formData.lotFeatures.landDepth}
              onChange={(e) => handleInputChange(e, 'lotFeatures')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Bathrooms */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Bathrooms</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Total Bathrooms</label>
            <input
              type='text'
              name='totalBathrooms'
              value={formData.bathrooms.totalBathrooms}
              onChange={(e) => handleInputChange(e, 'bathrooms')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Partial Bathrooms
            </label>
            <input
              type='number'
              name='partailBathrooms'
              value={formData.bathrooms.partailBathrooms}
              onChange={(e) => handleInputChange(e, 'bathrooms')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-lg font-medium'>Measurements</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>Square Feet</label>
            <input
              type='number'
              name='sqft'
              value={formData.measurements.sqft}
              onChange={(e) => handleInputChange(e, 'measurements')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Total Finished Square Feet
            </label>
            <input
              type='number'
              name='totalfinishSqft'
              value={formData.measurements.totalfinishSqft}
              onChange={(e) => handleInputChange(e, 'measurements')}
              className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>
      </div>

      {/* Rooms */}
      <div className='space-y-4 bg-white p-6 rounded-lg shadow-sm'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium'>Rooms</h3>
          <button
            type='button'
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                rooms: [
                  ...prev.rooms,
                  {
                    level: '',
                    roomType: '',
                    width: 0,
                    length: 0,
                    height: 0,
                  },
                ],
              }));
            }}
            className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
          >
            Add Room
          </button>
        </div>
        <div className='space-y-4'>
          {formData.rooms.map((room, index) => (
            <div key={index} className='grid grid-cols-1 gap-6 p-4 border rounded-lg'>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Level</label>
                  <input
                    type='text'
                    value={room.level}
                    onChange={(e) => {
                      const newRooms = [...formData.rooms];
                      newRooms[index] = {
                        ...newRooms[index],
                        level: e.target.value,
                      };
                      setFormData((prev) => ({ ...prev, rooms: newRooms }));
                    }}
                    className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Room Type</label>
                  <input
                    type='text'
                    placeholder='e.g., Master Bedroom'
                    value={room.roomType}
                    onChange={(e) => {
                      const newRooms = [...formData.rooms];
                      newRooms[index] = {
                        ...newRooms[index],
                        roomType: e.target.value,
                      };
                      setFormData((prev) => ({ ...prev, rooms: newRooms }));
                    }}
                    className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Length (ft)
                  </label>
                  <input
                    type='number'
                    placeholder='12'
                    value={room.length || ''}
                    onChange={(e) => {
                      const newRooms = [...formData.rooms];
                      newRooms[index] = {
                        ...newRooms[index],
                        length: Number(e.target.value),
                      };
                      setFormData((prev) => ({ ...prev, rooms: newRooms }));
                    }}
                    className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Width (ft)</label>
                  <input
                    type='number'
                    placeholder='14'
                    value={room.width || ''}
                    onChange={(e) => {
                      const newRooms = [...formData.rooms];
                      newRooms[index] = {
                        ...newRooms[index],
                        width: Number(e.target.value),
                      };
                      setFormData((prev) => ({ ...prev, rooms: newRooms }));
                    }}
                    className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Height (ft)
                  </label>
                  <input
                    type='number'
                    placeholder='8'
                    value={room.height || ''}
                    onChange={(e) => {
                      const newRooms = [...formData.rooms];
                      newRooms[index] = {
                        ...newRooms[index],
                        height: Number(e.target.value),
                      };
                      setFormData((prev) => ({ ...prev, rooms: newRooms }));
                    }}
                    className='bg-gray-100 w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='button'
                  onClick={() => {
                    const newRooms = formData.rooms.filter((_, i) => i !== index);
                    setFormData((prev) => ({ ...prev, rooms: newRooms }));
                  }}
                  className='px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'
                >
                  Remove Room
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className='flex justify-end pt-6 bg-white p-6 rounded-lg shadow-sm'>
        <button
          type='submit'
          className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
        >
          Save Property
        </button>
      </div>
    </form>
  );
};

export default Page;
