'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Type definitions
interface PageContent {
  title: string;
  description: string;
  backgroundImage: string;
  submissionText: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  note: string;
  location: string;
}

// Mock data - in a real app, this would come from an API or CMS
const pageContent: PageContent = {
  title: 'Find Local Real Estate Agents',
  description:
    'Enter your location to connect with experienced real estate agents in your area who can help you buy, sell, or rent property with confidence.',
  backgroundImage:
    'https://images.pexels.com/photos/531880/pexels-photo-531880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  submissionText: 'Thank you! A local agent will contact you shortly to discuss your needs.',
};

declare global {
  interface Window {
    google: any;
  }
}

export default function Home() {
  const [address, setAddress] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    note: '',
    location: '',
  });

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = initAutocomplete;
        document.body.appendChild(script);
      } else {
        initAutocomplete();
      }
    };

    const initAutocomplete = () => {
      const input = document.getElementById('location-input') as HTMLInputElement;
      if (input && window.google && window.google.maps && window.google.maps.places) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          types: ['address'],
          fields: ['formatted_address'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setAddress(place.formatted_address);
            setFormData((prev) => ({ ...prev, location: place.formatted_address }));
            setFormOpen(true);
          }
        });
      }
    };

    loadGoogleMapsScript();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  return (
    <main className='min-h-screen flex flex-col'>
      <div
        className='relative flex flex-col items-center justify-center px-4 py-20 md:py-32 text-center'
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${pageContent.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
        }}
      >
        <div className='max-w-3xl mx-auto text-white z-10'>
          <h1 className='text-3xl md:text-5xl font-bold mb-6'>{pageContent.title}</h1>
          <div className='bg-white/10 backdrop-blur-sm p-6 rounded-lg mb-8'>
            <Input
              id='location-input'
              placeholder='Enter your address'
              className='h-14 px-4 text-black'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
      </div>
      <p className='text-lg md:text-xl mb-8'>{pageContent.description}</p>
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Contact Form</DialogTitle>
          </DialogHeader>
          {!submitted ? (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <Label htmlFor='name'>Name</Label>
              <Input
                id='name'
                name='name'
                required
                value={formData.name}
                onChange={handleInputChange}
              />
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <Label htmlFor='phone'>Phone</Label>
              <Input
                id='phone'
                name='phone'
                type='tel'
                required
                value={formData.phone}
                onChange={handleInputChange}
              />
              <Label htmlFor='note'>Note</Label>
              <Textarea
                id='note'
                name='note'
                rows={3}
                value={formData.note}
                onChange={handleInputChange}
              />
              <Label htmlFor='location'>Selected Location</Label>
              <Input id='location' name='location' value={formData.location} readOnly disabled />
              <Button type='submit'>Submit</Button>
            </form>
          ) : (
            <Alert className='border-green-500 bg-green-50'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              <AlertTitle className='text-green-800'>Success!</AlertTitle>
              <AlertDescription className='text-green-700'>
                {pageContent.submissionText}
              </AlertDescription>
            </Alert>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
