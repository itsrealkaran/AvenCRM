'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  Building,
  ChevronDown,
  Home,
  Mail,
  MapPin,
  MapPinned,
  Phone,
  Search,
  Send,
  User,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Property {
  id: number;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  featured: boolean;
  image: string;
  lat: number;
  lng: number;
}

interface LocationSearchTemplateProps {
  properties: Property[];
  title?: string;
  backgroundImage?: string;
  description?: string;
}

export default function LocationSearchTemplate({
  properties,
  title = 'Find Your Dream Home',
  backgroundImage = '/placeholder.svg?height=800&width=1600',
  description = 'Search for properties in your desired location and connect with our expert agents.',
}: LocationSearchTemplateProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for the search bar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock function to simulate search suggestions
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 2) {
      // Mock suggestions based on input
      const mockSuggestions = [
        `${value} in Los Angeles, CA`,
        `${value} in San Francisco, CA`,
        `${value} near Downtown`,
        `${value} with pool`,
      ];
      setSuggestions(mockSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowContactForm(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    alert('Thank you for your inquiry! An agent will contact you shortly.');
    setShowContactForm(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Fixed Search Bar (appears when scrolled) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md transform transition-all duration-300 ${isScrolled ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className='container mx-auto py-3 px-4'>
          <form onSubmit={handleSearchSubmit} className='relative max-w-2xl mx-auto'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600' />
              <Input
                className='pl-10 py-5 pr-24 text-base bg-white border-blue-200 focus:border-blue-400 rounded-lg shadow-sm'
                placeholder='Search by location, property type...'
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <Button
                type='submit'
                className='absolute right-1 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700'
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Hero Section with Background Image */}
      <section
        className='relative min-h-[85vh] bg-cover bg-center flex items-center justify-center'
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70'></div>

        <div className='relative z-10 container mx-auto px-4 text-center text-white'>
          <div className='max-w-4xl mx-auto'>
            <Badge className='mb-6 bg-blue-500/80 hover:bg-blue-600/80 text-white py-1.5 px-4 text-sm backdrop-blur-sm'>
              Premium Property Search
            </Badge>
            <h1 className='text-5xl md:text-6xl font-bold mb-6 leading-tight'>{title}</h1>
            <p className='text-xl md:text-2xl mb-10 max-w-3xl mx-auto font-light'>{description}</p>

            {/* Search Form */}
            <div className='max-w-3xl mx-auto backdrop-blur-sm bg-white/10 p-4 rounded-xl border border-white/20'>
              <form onSubmit={handleSearchSubmit} className='relative'>
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70' />
                  <Input
                    className='pl-12 py-7 text-lg bg-white/20 text-white border-white/30 rounded-lg shadow-xl placeholder:text-white/70'
                    placeholder='Search by location, property type, or features...'
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  <Button
                    type='submit'
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 py-6 px-8 text-base font-medium'
                  >
                    Find Properties
                  </Button>
                </div>

                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className='absolute top-full left-0 right-0 bg-white rounded-b-lg shadow-2xl mt-1 z-20 border border-blue-100'>
                    <ul className='py-2 text-left'>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className='px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center text-gray-700 border-b border-gray-100 last:border-0 transition-colors'
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <MapPin className='h-4 w-4 mr-3 text-blue-600 flex-shrink-0' />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </div>

            <div className='mt-10 flex flex-wrap justify-center gap-6'>
              <div className='flex items-center text-white/90 text-sm'>
                <Badge className='bg-blue-600/50 mr-2'>350+</Badge>
                Active Listings
              </div>
              <div className='flex items-center text-white/90 text-sm'>
                <Badge className='bg-blue-600/50 mr-2'>24/7</Badge>
                Customer Support
              </div>
              <div className='flex items-center text-white/90 text-sm'>
                <Badge className='bg-blue-600/50 mr-2'>100%</Badge>
                Satisfaction Guarantee
              </div>
            </div>
          </div>
        </div>

        <div className='absolute bottom-0 left-0 right-0 flex justify-center pb-8'>
          <Button
            variant='ghost'
            className='text-white rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm animate-bounce'
            onClick={() => {
              window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth',
              });
            }}
          >
            <ChevronDown className='h-6 w-6' />
          </Button>
        </div>
      </section>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm'>
          <Card className='w-full max-w-md relative border-0 shadow-2xl'>
            <Button
              variant='ghost'
              size='icon'
              className='absolute right-2 top-2 rounded-full bg-gray-100 hover:bg-gray-200 z-10'
              onClick={() => setShowContactForm(false)}
            >
              <X className='h-4 w-4' />
            </Button>
            <CardContent className='p-0 overflow-hidden'>
              <div className='bg-blue-600 p-6 text-white'>
                <h2 className='text-2xl font-bold'>Contact an Agent</h2>
                <p className='text-blue-100 mt-1'>
                  Tell us about your property search and we&apos;ll connect you with an expert
                  agent.
                </p>
              </div>

              <div className='p-6'>
                <form onSubmit={handleFormSubmit} className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name' className='text-sm font-medium'>
                      Full Name
                    </Label>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <Input
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleFormChange}
                        placeholder='John Doe'
                        className='pl-10 border-gray-200'
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='email' className='text-sm font-medium'>
                      Email
                    </Label>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder='john@example.com'
                        className='pl-10 border-gray-200'
                        required
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='phone' className='text-sm font-medium'>
                      Phone Number
                    </Label>
                    <div className='relative'>
                      <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                      <Input
                        id='phone'
                        name='phone'
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder='(123) 456-7890'
                        className='pl-10 border-gray-200'
                      />
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='message' className='text-sm font-medium'>
                      Your Search Criteria
                    </Label>
                    <Textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={handleFormChange}
                      placeholder="Tell us what you're looking for in a property..."
                      rows={4}
                      className='border-gray-200 resize-none'
                      required
                    />
                  </div>

                  <Button type='submit' className='w-full bg-blue-600 hover:bg-blue-700 py-6'>
                    <Send className='mr-2 h-4 w-4' />
                    Submit Request
                  </Button>

                  <p className='text-xs text-center text-gray-500'>
                    By submitting this form, you agree to our{' '}
                    <a href='#' className='text-blue-600 hover:underline'>
                      Privacy Policy
                    </a>{' '}
                    and{' '}
                    <a href='#' className='text-blue-600 hover:underline'>
                      Terms of Service
                    </a>
                    .
                  </p>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page Description Section */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='max-w-5xl mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
              <div className='bg-blue-50 p-8 rounded-xl text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Home className='h-8 w-8 text-blue-600' />
                </div>
                <h3 className='text-xl font-bold mb-3'>Find Your Perfect Home</h3>
                <p className='text-gray-600'>
                  Browse thousands of listings in your desired area with our powerful search tools.
                </p>
              </div>

              <div className='bg-blue-50 p-8 rounded-xl text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <Building className='h-8 w-8 text-blue-600' />
                </div>
                <h3 className='text-xl font-bold mb-3'>Expert Real Estate Agents</h3>
                <p className='text-gray-600'>
                  Our experienced agents will guide you through every step of the buying or selling
                  process.
                </p>
              </div>

              <div className='bg-blue-50 p-8 rounded-xl text-center'>
                <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <MapPinned className='h-8 w-8 text-blue-600' />
                </div>
                <h3 className='text-xl font-bold mb-3'>Local Market Insights</h3>
                <p className='text-gray-600'>
                  Get valuable information about neighborhoods, schools, and property values.
                </p>
              </div>
            </div>

            <div className='mt-16 text-center'>
              <h2 className='text-3xl font-bold mb-6'>How It Works</h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='relative'>
                  <div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10'>
                    <span className='text-xl font-bold text-blue-600'>1</span>
                  </div>
                  <div className='hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-0'></div>
                  <h3 className='text-lg font-semibold mb-2'>Search</h3>
                  <p className='text-gray-600 text-sm'>
                    Enter your location and property preferences in our search bar.
                  </p>
                </div>

                <div className='relative'>
                  <div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10'>
                    <span className='text-xl font-bold text-blue-600'>2</span>
                  </div>
                  <div className='hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-0'></div>
                  <h3 className='text-lg font-semibold mb-2'>Connect</h3>
                  <p className='text-gray-600 text-sm'>
                    Fill out the contact form to connect with a local real estate expert.
                  </p>
                </div>

                <div className='relative'>
                  <div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10'>
                    <span className='text-xl font-bold text-blue-600'>3</span>
                  </div>
                  <div className='hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-0'></div>
                  <h3 className='text-lg font-semibold mb-2'>Tour</h3>
                  <p className='text-gray-600 text-sm'>
                    Schedule viewings of properties that match your criteria.
                  </p>
                </div>

                <div className='relative'>
                  <div className='bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10'>
                    <span className='text-xl font-bold text-blue-600'>4</span>
                  </div>
                  <h3 className='text-lg font-semibold mb-2'>Move In</h3>
                  <p className='text-gray-600 text-sm'>
                    Close the deal and move into your dream home with our support.
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-16 bg-blue-600 text-white p-10 rounded-2xl'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8 items-center'>
                <div>
                  <h2 className='text-3xl font-bold mb-4'>Ready to Find Your Dream Home?</h2>
                  <p className='mb-6 text-blue-100'>
                    Our team of expert real estate agents is ready to help you find the perfect
                    property. Start your search today!
                  </p>
                  <Button
                    className='bg-white text-blue-600 hover:bg-blue-50'
                    onClick={() => setShowContactForm(true)}
                  >
                    Contact an Agent
                  </Button>
                </div>
                <div className='hidden md:block'>
                  <Image
                    src='/placeholder.svg?height=300&width=400'
                    alt='Happy homeowners'
                    width={400}
                    height={300}
                    className='rounded-lg shadow-lg'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
