'use client';

import { useState } from 'react';
import { Building, Building2, Mail, MapPin, Phone } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactFormTemplate({
  data,
}: {
  data: {
    bgImage: string;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    accentColor: string;
    agentName: string;
    officeAddress: string;
    phone: string;
    email: string;
    social: {
      facebook: string;
      instagram: string;
      linkedin: string;
      twitter: string;
    };
  };
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log(formData);
  };

  return (
    <div className='w-full h-full flex flex-col bg-gradient-to-b from-white to-gray-50'>
      {/* Hero Section */}
      <div
        className='relative w-full'
        style={{
          backgroundImage: `url(${data.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
        }}
      >
        <div className='absolute inset-0 bg-black/50' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <div className='text-center text-white'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>{data.title}</h1>
            <p className='text-lg md:text-xl'>{data.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className='w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Contact Information */}
          <div className='space-y-8'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>Contact Information</h2>
              <p className='text-gray-600 mb-8'>{data.description}</p>
            </div>

            <div className='space-y-6'>
              <Card className='p-6'>
                <div className='space-y-6'>
                  <div className='flex items-center space-x-4 border-b pb-4'>
                    <Avatar className='h-16 w-16 border'>
                      <AvatarImage src='/realtor-profile.jpg' alt='Jane Smith' />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className='text-xl font-bold'>{data.agentName}</h3>
                      <p style={{ color: data.accentColor }}>Real Estate Agent</p>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center space-x-4'>
                      <Building2 className='h-5 w-5' style={{ color: data.accentColor }} />
                      <div>
                        <h4 className='font-medium text-gray-700'>Office Address</h4>
                        <p className='text-gray-600'>{data.officeAddress}</p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                      <Phone className='h-5 w-5' style={{ color: data.accentColor }} />
                      <div>
                        <h4 className='font-medium text-gray-700'>Phone</h4>
                        <p className='text-gray-600'>{data.phone}</p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                      <Mail className='h-5 w-5' style={{ color: data.accentColor }} />
                      <div>
                        <h4 className='font-medium text-gray-700'>Email</h4>
                        <p className='text-gray-600'>{data.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <Card className='p-8'>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                  <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                    Full Name
                  </label>
                  <Input
                    id='name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='John Doe'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                    Email
                  </label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='john@example.com'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                    Phone Number
                  </label>
                  <Input
                    id='phone'
                    type='tel'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder='(555) 123-4567'
                    required
                  />
                </div>

                <div>
                  <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-2'>
                    Message
                  </label>
                  <Textarea
                    id='message'
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder='Tell us about your real estate needs...'
                    className='h-32'
                    required
                  />
                </div>

                <Button
                  type='submit'
                  className='w-full'
                  style={{ backgroundColor: data.accentColor }}
                >
                  {data.buttonText}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className='w-full mt-auto bg-[#f9f8ff] py-6 border-t'
        style={{ borderColor: `${data.accentColor}10` }}
      >
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Building className='h-5 w-5' style={{ color: data.accentColor }} />
              <span className={`font-semibold`} style={{ color: data.accentColor }}>
                {data.agentName}
              </span>
            </div>
            <div className='flex flex-col items-center text-center'>
              <div className='text-xs mt-1 font-medium' style={{ color: `${data.accentColor}aa` }}>
                © {new Date().getFullYear()} {data.agentName}. Powered by AvenCRM
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <a
                href={data.social.facebook}
                style={{
                  color: `${data.accentColor}aa`,
                  transition: 'color 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = data.accentColor)}
                onMouseOut={(e) => (e.currentTarget.style.color = `${data.accentColor}aa`)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
                </svg>
              </a>
              <a
                href={data.social.instagram}
                style={{
                  color: `${data.accentColor}aa`,
                  transition: 'color 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = data.accentColor)}
                onMouseOut={(e) => (e.currentTarget.style.color = `${data.accentColor}aa`)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
                  <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                  <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
                </svg>
              </a>
              <a
                href={data.social.twitter}
                style={{
                  color: `${data.accentColor}aa`,
                  transition: 'color 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = data.accentColor)}
                onMouseOut={(e) => (e.currentTarget.style.color = `${data.accentColor}aa`)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1a10.66 10.66 0 0 1-9-4.53s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20-4.5 20-13.5V6a8.11 8.11 0 0 0 2-.5z' />
                </svg>
              </a>
              <a
                href={data.social.linkedin}
                style={{
                  color: `${data.accentColor}aa`,
                  transition: 'color 0.2s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = data.accentColor)}
                onMouseOut={(e) => (e.currentTarget.style.color = `${data.accentColor}aa`)}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='h-5 w-5'
                >
                  <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
                  <rect width='4' height='12' x='2' y='9' />
                  <circle cx='4' cy='4' r='2' />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
