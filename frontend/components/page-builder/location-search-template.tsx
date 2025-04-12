'use client';

import { useState } from 'react';
import { Building, Building2, Mail, Phone, Search } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function LocationSearchTemplate({
  data,
}: {
  data: {
    title: string;
    subtitle: string;
    description: string;
    bgImage: string;
    buttonText: string;
    accentColor: string;
    agentName: string;
    agentTitle: string;
    agentImage: string;
    contactInfo: {
      address: string;
      phone: string;
      email: string;
    };
    social: {
      facebook: string;
      instagram: string;
      linkedin: string;
      twitter: string;
    };
  };
}) {
  const [showForm, setShowForm] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setShowForm(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    setShowForm(false);
  };

  if (!data) return null;

  return (
    <div className='w-full h-full flex flex-col bg-gradient-to-b from-white to-gray-50 relative'>
      {/* Hero Section with Search */}
      <div
        className='relative w-full'
        style={{
          backgroundImage: `url(${data.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
        }}
      >
        <div className='absolute inset-0 bg-black/60' />
        <div className='absolute inset-0 flex flex-col items-center justify-center px-4'>
          <div className='text-center text-white max-w-3xl mx-auto mb-12'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>{data.title}</h1>
            <p className='text-lg md:text-xl mb-8'>{data.subtitle}</p>
          </div>

          <form onSubmit={handleSearch} className='relative max-w-xl w-full'>
            <Input
              type='text'
              placeholder='Enter your address...'
              className='pl-5 pr-14 py-7 text-lg rounded-lg border-2 border-white/20 bg-white/10 text-white placeholder:text-white/70'
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Button
              type='submit'
              size='icon'
              className='absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full'
              style={{ backgroundColor: data.accentColor }}
            >
              <Search className='h-5 w-5' />
              <span className='sr-only'>Search</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom half with paragraph */}
      <div className='flex-1 bg-white'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            <div className='md:col-span-2'>
              <p className='text-lg text-gray-700 leading-relaxed mb-12'>{data.description}</p>
            </div>
            <Card className='p-6 shadow-md h-full'>
              <div className='space-y-6'>
                <div className='flex items-center space-x-4 border-b pb-4'>
                  <Avatar className='h-16 w-16 border'>
                    <AvatarImage src={data.agentImage} alt={data.agentName} />
                    <AvatarFallback>
                      {data.agentName
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='text-xl font-bold'>{data.agentName}</h3>
                    <p style={{ color: data.accentColor }}>Real Estate Agent</p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='flex items-start space-x-4'>
                    <Building2
                      className='h-5 w-5 mt-1 flex-shrink-0'
                      style={{ color: data.accentColor }}
                    />
                    <div>
                      <h4 className='font-medium text-gray-700'>Office Address</h4>
                      <p className='text-gray-600'>{data.contactInfo.address}</p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <Phone
                      className='h-5 w-5 mt-1 flex-shrink-0'
                      style={{ color: data.accentColor }}
                    />
                    <div>
                      <h4 className='font-medium text-gray-700'>Phone</h4>
                      <p className='text-gray-600'>{data.contactInfo.phone}</p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <Mail
                      className='h-5 w-5 mt-1 flex-shrink-0'
                      style={{ color: data.accentColor }}
                    />
                    <div>
                      <h4 className='font-medium text-gray-700'>Email</h4>
                      <p className='text-gray-600'>{data.contactInfo.email}</p>
                    </div>
                  </div>
                </div>
              </div>
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
              {data.social?.facebook && (
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
              )}
              {data.social?.instagram && (
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
              )}
              {data.social?.twitter && (
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
              )}
              {data.social?.linkedin && (
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
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Modal Form */}
      {showForm && (
        <div className='absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
          <Card className='max-w-md w-full'>
            <CardContent className='p-6'>
              <h2 className='text-2xl font-bold mb-6'>{data.title}</h2>

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    placeholder='Your name'
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='your.email@example.com'
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='phone'>Phone Number</Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='(123) 456-7890'
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='message'>Message</Label>
                  <Textarea
                    id='message'
                    placeholder="I'm interested in properties in this area..."
                    className='min-h-[100px]'
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        message:
                          'Property Valuation Enquiry:' + searchValue + 'Message:' + e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className='flex justify-end space-x-2 pt-4'>
                  <Button variant='outline' onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type='submit' style={{ backgroundColor: data.accentColor }}>
                    {data.buttonText}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
