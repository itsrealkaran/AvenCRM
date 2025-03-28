import Image from 'next/image';
import {
  Award,
  Building,
  Calendar,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RealtorPortfolio({ realtorData }: { realtorData: any }) {
  if (realtorData === null) {
    return <div></div>;
  }
  return (
    <div className='flex flex-col min-h-screen w-full overflow-x-hidden'>
      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative py-12 md:py-24 bg-gradient-to-br from-[#f3f0ff] via-white to-[#eeeaff]'>
          <div className='absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent'></div>
          <div className='absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-t from-primary/5 to-transparent'></div>
          <div className='container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center relative z-10'>
            <div className='space-y-6'>
              <div className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-primary text-sm font-medium'>
                <span className='relative flex h-2 w-2 mr-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-primary'></span>
                </span>
                Top Rated Agent 2023
              </div>
              <h1 className='text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent'>
                {realtorData.name}
              </h1>
              <p className='text-xl text-muted-foreground'>{realtorData.title}</p>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <MapPin className='h-4 w-4 text-primary' />
                <span>{realtorData.location}</span>
              </div>
              <p className='text-lg'>{realtorData.bio}</p>
              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <Button
                  size='lg'
                  className='bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/20'
                >
                  Contact Me
                </Button>
                <Button
                  variant='outline'
                  size='lg'
                  className='border-primary text-primary hover:bg-primary/5'
                >
                  View Credentials
                </Button>
              </div>
            </div>
            <div className='relative aspect-square max-w-md mx-auto'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl'></div>
              <Image
                src='/house.jpg'
                alt={realtorData.name}
                width={600}
                height={600}
                className='rounded-full object-cover border-8 border-white shadow-xl relative z-10'
                priority
              />
              <div className='absolute -bottom-4 -right-4 bg-white rounded-full p-3 shadow-lg z-20'>
                <div className='bg-primary rounded-full p-2'>
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
              <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-[#f9f8ff]'>
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <CheckCircle className='h-8 w-8 text-primary' />
                  </div>
                  <h3 className='text-3xl font-bold text-primary'>{realtorData.dealsCount}</h3>
                  <p className='text-sm text-muted-foreground'>Deals Closed</p>
                </CardContent>
              </Card>
              <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-[#f9f8ff]'>
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <Building className='h-8 w-8 text-primary' />
                  </div>
                  <h3 className='text-3xl font-bold text-primary'>{realtorData.propertyValue}</h3>
                  <p className='text-sm text-muted-foreground'>Property Value</p>
                </CardContent>
              </Card>
              <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-[#f9f8ff]'>
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <Calendar className='h-8 w-8 text-primary' />
                  </div>
                  <h3 className='text-3xl font-bold text-primary'>{realtorData.yearsExperience}</h3>
                  <p className='text-sm text-muted-foreground'>Years Experience</p>
                </CardContent>
              </Card>
              <Card className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-[#f9f8ff]'>
                <CardContent className='p-6 flex flex-col items-center text-center'>
                  <div className='bg-accent p-3 rounded-full mb-4'>
                    <Users className='h-8 w-8 text-primary' />
                  </div>
                  <h3 className='text-3xl font-bold text-primary'>
                    {realtorData.clientSatisfaction}
                  </h3>
                  <p className='text-sm text-muted-foreground'>Client Satisfaction</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id='about' className='py-12 md:py-24 bg-[#f9f8ff]'>
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center mb-12'>
              <div className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-primary text-sm font-medium mb-4'>
                About Me
              </div>
              <h2 className='text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent'>
                My Real Estate Journey
              </h2>
              <p className='text-lg text-muted-foreground'>
                With over {realtorData.yearsExperience} of experience in the {realtorData.location}{' '}
                real estate market, I specialize in luxury properties and helping clients make
                informed decisions.
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-8 items-center'>
              <div className='space-y-4 bg-white p-6 rounded-xl shadow-lg'>
                <h3 className='text-xl font-semibold text-primary'>My Approach</h3>
                <p>{realtorData.approach}</p>
                <h3 className='text-xl font-semibold text-primary'>Expertise</h3>
                <ul className='space-y-2'>
                  {realtorData.expertise.filter(Boolean).map((expertise: string, index: number) => (
                    <li key={index} className='flex items-center gap-2'>
                      <CheckCircle className='h-5 w-5 text-primary' />
                      <span>{expertise}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className='space-y-4 bg-white p-6 rounded-xl shadow-lg'>
                <h3 className='text-xl font-semibold text-primary'>Certifications</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {realtorData.certifications
                    .filter(Boolean)
                    .map((certification: string, index: number) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors'
                      >
                        <Award className='h-5 w-5 text-primary' />
                        <span>{certification}</span>
                      </div>
                    ))}
                </div>
                <h3 className='text-xl font-semibold text-primary'>Education</h3>
                <p>{realtorData.education}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id='testimonials' className='py-12 md:py-24 bg-white relative overflow-hidden'>
          <div className='absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f3f0ff]/50 to-transparent'></div>
          <div className='absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-to-t from-[#f3f0ff]/50 to-transparent'></div>
          <div className='container mx-auto px-4 relative z-10'>
            <div className='text-center mb-12'>
              <div className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-primary text-sm font-medium mb-4'>
                Testimonials
              </div>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent'>
                What My Clients Say
              </h2>
            </div>
            <div className='grid md:grid-cols-3 gap-6'>
              {realtorData.testimonials
                .filter((t: any) => t.text && t.client)
                .map((testimonial: any, i: number) => (
                  <Card
                    key={i}
                    className='overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-5px]'
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-center gap-1 mb-4 text-primary'>
                        <Star className='h-5 w-5 fill-primary' />
                        <Star className='h-5 w-5 fill-primary' />
                        <Star className='h-5 w-5 fill-primary' />
                        <Star className='h-5 w-5 fill-primary' />
                        <Star className='h-5 w-5 fill-primary' />
                      </div>
                      <p className='mb-4 italic'>"{testimonial.text}"</p>
                      <div className='flex items-center gap-3'>
                        <Avatar className='border-2 border-primary'>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${i}`} />
                          <AvatarFallback className='bg-primary/10 text-primary'>
                            {testimonial.client
                              .split(' ')
                              .map((n: string) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className='font-medium'>{testimonial.client}</p>
                          <p className='text-sm text-muted-foreground'>{testimonial.location}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id='contact'
          className='py-12 md:py-24 bg-gradient-to-br from-[#f3f0ff] via-white to-[#eeeaff]'
        >
          <div className='container mx-auto px-4'>
            <div className='max-w-3xl mx-auto text-center mb-12'>
              <div className='inline-flex items-center px-3 py-1 rounded-full bg-accent text-primary text-sm font-medium mb-4'>
                Contact
              </div>
              <h2 className='text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent'>
                Get in Touch
              </h2>
              <p className='text-lg text-muted-foreground'>
                Ready to find your dream home or sell your property? Let's connect!
              </p>
            </div>
            <div className='grid md:grid-cols-2 gap-8 items-center'>
              <div className='space-y-6'>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all'>
                  <div className='bg-primary p-3 rounded-full'>
                    <Phone className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Call me</p>
                    <p className='font-medium'>{realtorData.phone}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all'>
                  <div className='bg-primary p-3 rounded-full'>
                    <Mail className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Email me</p>
                    <p className='font-medium'>{realtorData.email}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all'>
                  <div className='bg-primary p-3 rounded-full'>
                    <MapPin className='h-6 w-6 text-white' />
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Office location</p>
                    <p className='font-medium'>{realtorData.officeLocation}</p>
                  </div>
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
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                          placeholder='Enter your first name'
                        />
                      </div>
                      <div className='space-y-2'>
                        <label htmlFor='last-name' className='text-sm font-medium'>
                          Last name
                        </label>
                        <input
                          id='last-name'
                          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
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
                        className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='Enter your email'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label htmlFor='message' className='text-sm font-medium'>
                        Message
                      </label>
                      <textarea
                        id='message'
                        className='flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                        placeholder='Enter your message'
                      />
                    </div>
                  </div>
                  <Button className='w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/20'>
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='bg-[#f9f8ff] py-6 border-t border-primary/10'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex items-center gap-2'>
              <Building className='h-5 w-5 text-primary' />
              <span className='font-semibold'>{realtorData.name} Realty</span>
            </div>
            <div className='flex flex-col items-center text-center'>
              <div className='text-xs text-primary/60 mt-1 font-medium'>
                © {new Date().getFullYear()} {realtorData.name} Realty. Powered by AvenCRM
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <a href='#' className='text-muted-foreground hover:text-primary transition-colors'>
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
              <a href='#' className='text-muted-foreground hover:text-primary transition-colors'>
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
              <a href='#' className='text-muted-foreground hover:text-primary transition-colors'>
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
