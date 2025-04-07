import Image from 'next/image';
import {
  Award,
  Building,
  Building2,
  Calendar,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function RealtorPortfolio({ data }: { data: any }) {
  return (
    <div className='flex flex-col min-h-screen w-full overflow-x-hidden'>
      <main className='flex-1'>
        <section
          className='relative py-12 md:py-24 bg-gradient-to-br from-white via-white to-white'
          style={{ backgroundImage: `linear-gradient(to bottom right, white, white, ${data.accentColor}10)` }}
        >
          <div
            className='absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-transparent to-transparent'
            style={{ backgroundImage: `linear-gradient(to left, ${data.accentColor}05, transparent)` }}
          ></div>
          <div
            className='absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-t from-transparent to-transparent'
            style={{ backgroundImage: `linear-gradient(to top, ${data.accentColor}05, transparent)` }}
          ></div>
          <div className='container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center relative z-10'>
            <div className='space-y-6'>
              <div
                className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-sm font-medium'
                style={{ color: data.accentColor }}
              >
                <span className='relative flex h-2 w-2 mr-2'>
                  <span
                    className='animate-ping absolute inline-flex h-full w-full rounded-full opacity-75'
                    style={{ backgroundColor: data.accentColor }}
                  ></span>
                  <span
                    className='relative inline-flex rounded-full h-2 w-2'
                    style={{ backgroundColor: data.accentColor }}
                  ></span>
                </span>
                Top Rated Agent 2023
              </div>
              <h1
                className='text-4xl md:text-6xl font-bold tracking-tight'
                style={{ color: data.accentColor }}
              >
                {data.name}
              </h1>
              <p className='text-xl text-muted-foreground'>{data.title}</p>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MapPin className='h-4 w-4' style={{ color: data.accentColor }} />
                <span>{data.location}</span>
              </div>
              <p className='text-lg'>{data.bio}</p>
              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <Button
                  size='lg'
                  className='text-white shadow-lg transition-all hover:shadow-xl'
                  style={{ 
                    backgroundColor: data.accentColor,
                    boxShadow: `0 10px 15px -3px ${data.accentColor}25`,
                    '--hover-bg': `${data.accentColor}90`,
                    '--hover-shadow': `0 20px 25px -5px ${data.accentColor}20`
                  } as React.CSSProperties}
                >
                  Contact Me
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='hover:bg-transparent'
                  style={{ 
                    borderColor: data.accentColor, 
                    color: data.accentColor,
                    '--hover-bg': `${data.accentColor}05`
                  } as React.CSSProperties}
                >
                  View Credentials
                </Button>
              </div>
            </div>
            <div className='relative aspect-square max-w-md mx-auto'>
              <div
                className='absolute inset-0 rounded-full blur-3xl'
                style={{ backgroundImage: `linear-gradient(to bottom right, ${data.accentColor}20, ${data.accentColor}05)` }}
              ></div>
              <Image
                src={data.image}
                alt={data.name}
                width={600}
                height={600}
                className='rounded-full object-cover border-8 border-white shadow-xl relative z-10'
                priority
              />
              <div className='absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg z-20'>
                <div className='rounded-full p-2' style={{ backgroundColor: data.accentColor }}>
                  <Star className='h-6 w-6 text-white fill-white' />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className='py-12 bg-white'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8'>
              <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-white'
                style={{ backgroundImage: `linear-gradient(to bottom right, white, ${data.accentColor}05)` }}>
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <CheckCircle className='h-8 w-8' style={{ color: data.accentColor }} />
                  </div>
                  <h3 className='text-3xl font-bold' style={{ color: data.accentColor }}>
                    {data.dealsCount}
                  </h3>
                  <p className='text-sm text-muted-foreground'>Deals Closed</p>
                </CardContent>
              </Card>
              <Card
                className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-white'
                style={{ backgroundImage: `linear-gradient(to bottom right, white, ${data.accentColor}05)` }}
              >
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <Building className='h-8 w-8' style={{ color: data.accentColor }} />
                  </div>
                  <h3 className='text-3xl font-bold' style={{ color: data.accentColor }}>
                    {data.propertyValue}
                  </h3>
                  <p className='text-sm text-muted-foreground'>Property Value</p>
                </CardContent>
              </Card>
              <Card
                className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-white'
                style={{ backgroundImage: `linear-gradient(to bottom right, white, ${data.accentColor}05)` }}
              >
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <Calendar className='h-8 w-8' style={{ color: data.accentColor }} />
                  </div>
                  <h3 className='text-3xl font-bold' style={{ color: data.accentColor }}>
                    {data.yearsExperience}
                  </h3>
                  <p className='text-sm text-muted-foreground'>Years Experience</p>
                </CardContent>
              </Card>
              <Card
                className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-white'
                style={{ backgroundImage: `linear-gradient(to bottom right, white, ${data.accentColor}05)` }}
              >
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <Users className='h-8 w-8' style={{ color: data.accentColor }} />
                  </div>
                  <h3 className='text-3xl font-bold' style={{ color: data.accentColor }}>
                    {data.clientSatisfaction}
                  </h3>
                  <p className='text-sm text-muted-foreground'>Client Satisfaction</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section
          id='about'
          className='py-12 md:py-24 bg-gradient-to-br from-white via-white to-white'
          style={{ backgroundImage: `linear-gradient(to bottom right, white, white, ${data.accentColor}10)` }}
        >
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center mb-12'>
              <div
                className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-sm font-medium mb-4'
                style={{ color: data.accentColor }}
              >
                About Me
              </div>
              <h2
                className='text-3xl font-bold mb-4'
                style={{ color: data.accentColor }}
              >
                My Real Estate Journey
              </h2>
              <p className='text-lg text-muted-foreground'>
                With over {data.yearsExperience} of experience in the {data.location}{' '}
                real estate market, I specialize in luxury properties and helping clients make
                informed decisions.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-8 items-center'>
              <div className='space-y-4 bg-white p-6 rounded-xl shadow-lg'>
                <h3 className='text-xl font-semibold' style={{ color: data.accentColor }}>
                  My Approach
                </h3>
                <p>{data.approach}</p>
                <h3 className='text-xl font-semibold' style={{ color: data.accentColor }}>
                  Expertise
                </h3>
                <ul className='space-y-2'>
                  {data.expertise.filter(Boolean).map((expertise: string, index: number) => (
                    <li key={index} className='flex items-center gap-2'>
                      <CheckCircle className='h-5 w-5' style={{ color: data.accentColor }} />
                      <span>{expertise}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='space-y-4 bg-white p-6 rounded-xl shadow-lg'>
                <h3 className='text-xl font-semibold' style={{ color: data.accentColor }}>
                  Certifications
                </h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {data.certifications
                    .filter(Boolean)
                    .map((certification: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors'
                      >
                        <Award className='h-5 w-5' style={{ color: data.accentColor }} />
                        <span>{certification}</span>
                      </div>
                    ))}
                </div>
                <h3 className='text-xl font-semibold' style={{ color: data.accentColor }}>
                  Education
                </h3>
                <p>{data.education}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id='contact'
          className='py-12 md:py-24 bg-gradient-to-br from-white via-white to-white'
          style={{ backgroundImage: `linear-gradient(to bottom right, white, white, ${data.accentColor}10)` }}
        >
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center mb-12'>
              <div
                className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-sm font-medium mb-4'
                style={{ color: data.accentColor }}
              >
                Contact
              </div>
              <h2
                className='text-3xl font-bold mb-4'
                style={{ color: data.accentColor }}
              >
                Get in Touch
              </h2>
              <p className='text-lg text-muted-foreground'>
                Ready to find your dream home or sell your property? Let&apos;s connect!
              </p>
            </div>
              <div className='grid md:grid-cols-2 gap-8 items-center'>
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
                          <AvatarImage src={data.image} alt='data.name' />
                          <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className='text-xl font-bold'>{data.name}</h3>
                          <p style={{ color: data.accentColor }}>Real Estate Agent</p>
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <div className='flex items-center space-x-4'>
                          <Building2 className='h-5 w-5' style={{ color: data.accentColor }} />
                          <div>
                            <h4 className='font-medium text-gray-700'>Office Address</h4>
                            <p className='text-gray-600'>
                              {data.officeAddress}
                            </p>
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
              <Card className='border-none shadow-xl overflow-hidden'>
                <CardContent className='p-6 space-y-4'>
                  <div className='grid gap-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <label htmlFor='first-name' className='text-sm font-medium'>
                          First name
                        </label>
                        <input
                          id='first-name'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50'
                          style={{ 
                            '--focus-ring-color': data.accentColor 
                          } as React.CSSProperties}
                          placeholder='Enter your first name'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label htmlFor='last-name' className='text-sm font-medium'>
                          Last name
                        </label>
                        <input
                          id='last-name'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50'
                          style={{ 
                            '--focus-ring-color': data.accentColor 
                          } as React.CSSProperties}
                          placeholder='Enter your last name'
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='email' className='text-sm font-medium'>
                        Email
                      </label>
                      <input
                        id='email'
                        type='email'
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50'
                        style={{ 
                          '--focus-ring-color': data.accentColor 
                        } as React.CSSProperties}
                        placeholder='Enter your email'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='message' className='text-sm font-medium'>
                        Message
                      </label>
                      <textarea
                        id='message'
                        className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50'
                        style={{ 
                          '--focus-ring-color': data.accentColor 
                        } as React.CSSProperties}
                        placeholder='Enter your message'
                      />
                    </div>
                  </div>
                  <Button
                    className='w-full text-white shadow-lg transition-all hover:shadow-xl'
                    style={{ 
                      backgroundColor: data.accentColor,
                      boxShadow: `0 10px 15px -3px ${data.accentColor}25`,
                      '--hover-bg': `${data.accentColor}90`,
                      '--hover-shadow': `0 20px 25px -5px ${data.accentColor}20`
                    } as React.CSSProperties}
                  >
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className='w-full mt-auto bg-[#f9f8ff] py-6 border-t'
        style={{ borderColor: `${data.accentColor}10` }}
      >
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Building className='h-5 w-5' style={{ color: data.accentColor }} />
              <span className={`font-semibold`} style={{ color: data.accentColor }}>{data.name}</span>
            </div>
            <div className='flex flex-col items-center text-center'>
              <div className='text-xs mt-1 font-medium' style={{ color: `${data.accentColor}aa` }}>
                © {new Date().getFullYear()} {data.name}. Powered by AvenCRM
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
