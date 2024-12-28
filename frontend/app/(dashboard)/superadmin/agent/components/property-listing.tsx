'use client';

import { useState } from 'react';
import { Bath, Bed, DollarSign, Home, Plus, Search, Square } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const dummyProperties = [
  {
    id: 1,
    address: '123 Main St',
    price: 500000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 2000,
    type: 'Single Family',
    status: 'For Sale',
  },
  {
    id: 2,
    address: '456 Elm St',
    price: 400000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    type: 'Condo',
    status: 'For Sale',
  },
  {
    id: 3,
    address: '789 Oak St',
    price: 600000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2500,
    type: 'Single Family',
    status: 'Under Contract',
  },
];

export function PropertyListings() {
  const [properties, setProperties] = useState(dummyProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProperty, setNewProperty] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    type: '',
    status: '',
  });

  const filteredProperties = properties.filter(
    (property) =>
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProperty = () => {
    if (
      newProperty.address &&
      newProperty.price &&
      newProperty.bedrooms &&
      newProperty.bathrooms &&
      newProperty.sqft &&
      newProperty.type &&
      newProperty.status
    ) {
      setProperties([
        ...properties,
        {
          id: properties.length + 1,
          ...newProperty,
          price: parseInt(newProperty.price),
          bedrooms: parseInt(newProperty.bedrooms),
          bathrooms: parseInt(newProperty.bathrooms),
          sqft: parseInt(newProperty.sqft),
        },
      ]);
      setNewProperty({
        address: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        type: '',
        status: '',
      });
    }
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Property Listings</CardTitle>
          <CardDescription>Manage your real estate property listings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex justify-between items-center mb-4'>
            <div className='flex items-center space-x-2'>
              <Input
                placeholder='Search properties'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-[300px]'
              />
              <Button variant='outline'>
                <Search className='mr-2 h-4 w-4' />
                Search
              </Button>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new property listing.
                  </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='address' className='text-right'>
                      Address
                    </Label>
                    <Input
                      id='address'
                      value={newProperty.address}
                      onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='price' className='text-right'>
                      Price
                    </Label>
                    <Input
                      id='price'
                      type='number'
                      value={newProperty.price}
                      onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='bedrooms' className='text-right'>
                      Bedrooms
                    </Label>
                    <Input
                      id='bedrooms'
                      type='number'
                      value={newProperty.bedrooms}
                      onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='bathrooms' className='text-right'>
                      Bathrooms
                    </Label>
                    <Input
                      id='bathrooms'
                      type='number'
                      value={newProperty.bathrooms}
                      onChange={(e) =>
                        setNewProperty({ ...newProperty, bathrooms: e.target.value })
                      }
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='sqft' className='text-right'>
                      Square Feet
                    </Label>
                    <Input
                      id='sqft'
                      type='number'
                      value={newProperty.sqft}
                      onChange={(e) => setNewProperty({ ...newProperty, sqft: e.target.value })}
                      className='col-span-3'
                    />
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='type' className='text-right'>
                      Type
                    </Label>
                    <Select
                      onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
                    >
                      <SelectTrigger className='col-span-3'>
                        <SelectValue placeholder='Select type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Single Family'>Single Family</SelectItem>
                        <SelectItem value='Condo'>Condo</SelectItem>
                        <SelectItem value='Townhouse'>Townhouse</SelectItem>
                        <SelectItem value='Multi-Family'>Multi-Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label htmlFor='status' className='text-right'>
                      Status
                    </Label>
                    <Select
                      onValueChange={(value) => setNewProperty({ ...newProperty, status: value })}
                    >
                      <SelectTrigger className='col-span-3'>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='For Sale'>For Sale</SelectItem>
                        <SelectItem value='For Rent'>For Rent</SelectItem>
                        <SelectItem value='Under Contract'>Under Contract</SelectItem>
                        <SelectItem value='Sold'>Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProperty}>Add Property</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {filteredProperties.map((property) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle>{property.address}</CardTitle>
              <CardDescription>
                {property.type} - {property.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between items-center mb-2'>
                <div className='flex items-center'>
                  <DollarSign className='h-4 w-4 mr-1' />
                  <span className='font-semibold'>{property.price.toLocaleString()}</span>
                </div>
                <div className='flex items-center space-x-2'>
                  <div className='flex items-center'>
                    <Bed className='h-4 w-4 mr-1' />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className='flex items-center'>
                    <Bath className='h-4 w-4 mr-1' />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className='flex items-center'>
                    <Square className='h-4 w-4 mr-1' />
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant='outline' className='w-full'>
                <Home className='mr-2 h-4 w-4' />
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
