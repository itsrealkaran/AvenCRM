'use client';

import type React from 'react';
import { useState } from 'react';
import Image from 'next/image';
import {
  Building,
  CheckCircle,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  User,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  email: string;
  hours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  social: {
    facebook: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  };
}

interface ContactFormTemplateProps {
  contactInfo: ContactInfo;
  title?: string;
  description?: string;
  backgroundImage?: string;
}

export default function ContactFormTemplate({
  contactInfo,
  title = 'Get in Touch With Our Team',
  description = 'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
  backgroundImage = '/placeholder.svg?height=800&width=1600',
}: ContactFormTemplateProps) {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
    company: '',
    preferredContact: 'email',
    agreeToTerms: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const totalSteps = 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormState((prev) => ({ ...prev, subject: value }));
  };

  const handlePreferredContactChange = (value: string) => {
    setFormState((prev) => ({ ...prev, preferredContact: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormState((prev) => ({ ...prev, agreeToTerms: checked }));
  };

  const nextStep = () => {
    if (formStep < totalSteps) {
      setFormStep(formStep + 1);
    }
  };

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormState({
          name: '',
          email: '',
          phone: '',
          subject: 'General Inquiry',
          message: '',
          company: '',
          preferredContact: 'email',
          agreeToTerms: false,
        });
        setFormStep(1);
      }, 5000);
    }, 1500);
  };

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section with Background Image */}
      <section
        className='relative py-20 bg-cover bg-center'
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className='absolute inset-0 bg-gradient-to-r from-amber-900/80 to-amber-800/60'></div>

        <div className='relative z-10 container mx-auto px-4 text-center text-white'>
          <Badge className='bg-white/20 text-white mb-4'>Contact Us</Badge>
          <h1 className='text-4xl md:text-5xl font-bold mb-4'>{title}</h1>
          <p className='text-xl text-amber-100 max-w-2xl mx-auto'>{description}</p>

          <div className='flex flex-wrap justify-center gap-8 mt-10'>
            <div className='flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-lg'>
              <div className='bg-amber-500 p-3 rounded-full mr-3'>
                <Phone className='h-6 w-6 text-white' />
              </div>
              <div className='text-left'>
                <p className='text-amber-200 text-sm'>Call us at</p>
                <p className='font-medium'>{contactInfo.phone}</p>
              </div>
            </div>

            <div className='flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-lg'>
              <div className='bg-amber-500 p-3 rounded-full mr-3'>
                <Mail className='h-6 w-6 text-white' />
              </div>
              <div className='text-left'>
                <p className='text-amber-200 text-sm'>Email us at</p>
                <p className='font-medium'>{contactInfo.email}</p>
              </div>
            </div>

            <div className='flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-lg'>
              <div className='bg-amber-500 p-3 rounded-full mr-3'>
                <Clock className='h-6 w-6 text-white' />
              </div>
              <div className='text-left'>
                <p className='text-amber-200 text-sm'>Business hours</p>
                <p className='font-medium'>Mon-Fri: 9AM-6PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className='container mx-auto p-4 py-16'>
        <div className='max-w-6xl mx-auto'>
          <div className='grid md:grid-cols-5 gap-8 items-start'>
            {/* Contact Form */}
            <div className='md:col-span-3'>
              <Card className='border-0 shadow-xl overflow-hidden'>
                {isSubmitted ? (
                  <div className='flex flex-col items-center justify-center py-16 px-4 text-center bg-gradient-to-br from-amber-50 to-white'>
                    <div className='bg-green-100 p-4 rounded-full mb-6'>
                      <CheckCircle className='h-12 w-12 text-green-600' />
                    </div>
                    <h3 className='text-2xl font-bold mb-2'>Message Sent Successfully!</h3>
                    <p className='text-gray-600 max-w-md mb-8'>
                      Thank you for contacting us. One of our representatives will get back to you
                      shortly.
                    </p>
                    <div className='flex items-center justify-center gap-2 text-sm text-gray-500'>
                      <Clock className='h-4 w-4' />
                      <span>Average response time: 2-3 business hours</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardHeader className='bg-gradient-to-r from-amber-600 to-amber-500 text-white'>
                      <div className='flex items-center justify-between'>
                        <div>
                          <CardTitle className='text-2xl'>Send Us a Message</CardTitle>
                          <CardDescription className='text-amber-100'>
                            Fill out the form below and we&apos;ll get back to you as soon as
                            possible.
                          </CardDescription>
                        </div>
                        <div className='flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm'>
                          <span className='font-medium'>Step {formStep}</span>
                          <span className='text-amber-200'>of {totalSteps}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='p-6'>
                      <form onSubmit={handleSubmit} className='space-y-6'>
                        {formStep === 1 && (
                          <div className='space-y-6'>
                            <div className='space-y-2'>
                              <Label htmlFor='name'>Full Name</Label>
                              <div className='relative'>
                                <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                                <Input
                                  id='name'
                                  name='name'
                                  value={formState.name}
                                  onChange={handleChange}
                                  placeholder='John Doe'
                                  className='pl-10 border-gray-200'
                                  required
                                />
                              </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                              <div className='space-y-2'>
                                <Label htmlFor='email'>Email</Label>
                                <div className='relative'>
                                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                                  <Input
                                    id='email'
                                    name='email'
                                    type='email'
                                    value={formState.email}
                                    onChange={handleChange}
                                    placeholder='john@example.com'
                                    className='pl-10 border-gray-200'
                                    required
                                  />
                                </div>
                              </div>
                              <div className='space-y-2'>
                                <Label htmlFor='phone'>Phone Number</Label>
                                <div className='relative'>
                                  <Phone className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                                  <Input
                                    id='phone'
                                    name='phone'
                                    value={formState.phone}
                                    onChange={handleChange}
                                    placeholder='(123) 456-7890'
                                    className='pl-10 border-gray-200'
                                  />
                                </div>
                              </div>
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='company'>Company/Organization (Optional)</Label>
                              <div className='relative'>
                                <Building className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                                <Input
                                  id='company'
                                  name='company'
                                  value={formState.company}
                                  onChange={handleChange}
                                  placeholder='Your company name'
                                  className='pl-10 border-gray-200'
                                />
                              </div>
                            </div>

                            <div className='space-y-2'>
                              <Label>Preferred Contact Method</Label>
                              <RadioGroup
                                value={formState.preferredContact}
                                onValueChange={handlePreferredContactChange}
                                className='flex flex-col space-y-1'
                              >
                                <div className='flex items-center space-x-2'>
                                  <RadioGroupItem value='email' id='contact-email' />
                                  <Label htmlFor='contact-email'>Email</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                  <RadioGroupItem value='phone' id='contact-phone' />
                                  <Label htmlFor='contact-phone'>Phone</Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                  <RadioGroupItem value='either' id='contact-either' />
                                  <Label htmlFor='contact-either'>Either</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <Button
                              type='button'
                              onClick={nextStep}
                              className='w-full bg-amber-600 hover:bg-amber-700 py-6'
                            >
                              Continue to Message Details
                            </Button>
                          </div>
                        )}

                        {formStep === 2 && (
                          <div className='space-y-6'>
                            <div className='space-y-2'>
                              <Label>What can we help you with?</Label>
                              <RadioGroup
                                value={formState.subject}
                                onValueChange={handleRadioChange}
                                className='grid grid-cols-1 md:grid-cols-2 gap-2'
                              >
                                <div className='flex items-center space-x-2 border border-gray-200 p-3 rounded-lg hover:bg-amber-50 transition-colors'>
                                  <RadioGroupItem value='General Inquiry' id='general' />
                                  <Label htmlFor='general'>General Inquiry</Label>
                                </div>
                                <div className='flex items-center space-x-2 border border-gray-200 p-3 rounded-lg hover:bg-amber-50 transition-colors'>
                                  <RadioGroupItem value='Property Buying' id='buying' />
                                  <Label htmlFor='buying'>Property Buying</Label>
                                </div>
                                <div className='flex items-center space-x-2 border border-gray-200 p-3 rounded-lg hover:bg-amber-50 transition-colors'>
                                  <RadioGroupItem value='Property Selling' id='selling' />
                                  <Label htmlFor='selling'>Property Selling</Label>
                                </div>
                                <div className='flex items-center space-x-2 border border-gray-200 p-3 rounded-lg hover:bg-amber-50 transition-colors'>
                                  <RadioGroupItem value='Property Management' id='management' />
                                  <Label htmlFor='management'>Property Management</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='message'>Message</Label>
                              <div className='relative'>
                                <MessageSquare className='absolute left-3 top-3 text-gray-400' />
                                <Textarea
                                  id='message'
                                  name='message'
                                  value={formState.message}
                                  onChange={handleChange}
                                  placeholder='How can we help you?'
                                  rows={5}
                                  className='pl-10 border-gray-200 resize-none'
                                  required
                                />
                              </div>
                            </div>

                            <div className='flex items-start space-x-2 pt-2'>
                              <Checkbox
                                id='terms'
                                checked={formState.agreeToTerms}
                                onCheckedChange={handleCheckboxChange}
                                required
                              />
                              <label htmlFor='terms' className='text-sm text-gray-600'>
                                I agree to the{' '}
                                <a href='#' className='text-amber-600 hover:underline'>
                                  Terms of Service
                                </a>{' '}
                                and acknowledge that my information will be used in accordance with
                                the{' '}
                                <a href='#' className='text-amber-600 hover:underline'>
                                  Privacy Policy
                                </a>
                                .
                              </label>
                            </div>

                            <div className='flex gap-3'>
                              <Button
                                type='button'
                                variant='outline'
                                onClick={prevStep}
                                className='flex-1'
                              >
                                Back
                              </Button>
                              <Button
                                type='submit'
                                className='flex-1 bg-amber-600 hover:bg-amber-700'
                                disabled={isSubmitting || !formState.agreeToTerms}
                              >
                                {isSubmitting ? (
                                  <>
                                    <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                                    Sending...
                                  </>
                                ) : (
                                  <>
                                    <Send className='mr-2 h-4 w-4' />
                                    Send Message
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </form>
                    </CardContent>
                  </>
                )}
              </Card>
            </div>

            {/* Contact Information */}
            <div className='md:col-span-2 space-y-6'>
              <Card className='border-0 shadow-lg overflow-hidden'>
                <div className='h-48 bg-amber-600 relative'>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <Image
                      src='/placeholder.svg?height=300&width=600'
                      alt='Office Location'
                      width={600}
                      height={300}
                      className='w-full h-full object-cover opacity-50'
                    />
                    <div className='absolute inset-0 bg-gradient-to-r from-amber-600/80 to-amber-700/80'></div>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <h3 className='text-2xl font-bold text-white'>Our Office</h3>
                    </div>
                  </div>
                </div>
                <CardContent className='p-6'>
                  <div className='space-y-4'>
                    <div className='flex items-start gap-3'>
                      <MapPin className='h-5 w-5 text-amber-600 mt-0.5' />
                      <div>
                        <h4 className='font-medium'>Address</h4>
                        <p className='text-muted-foreground'>{contactInfo.address.street}</p>
                        <p className='text-muted-foreground'>
                          {contactInfo.address.city}, {contactInfo.address.state}{' '}
                          {contactInfo.address.zip}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Phone className='h-5 w-5 text-amber-600 mt-0.5' />
                      <div>
                        <h4 className='font-medium'>Phone</h4>
                        <p className='text-muted-foreground'>{contactInfo.phone}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Mail className='h-5 w-5 text-amber-600 mt-0.5' />
                      <div>
                        <h4 className='font-medium'>Email</h4>
                        <p className='text-muted-foreground'>{contactInfo.email}</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-3'>
                      <Clock className='h-5 w-5 text-amber-600 mt-0.5' />
                      <div>
                        <h4 className='font-medium'>Business Hours</h4>
                        <p className='text-muted-foreground'>{contactInfo.hours.weekdays}</p>
                        <p className='text-muted-foreground'>{contactInfo.hours.saturday}</p>
                        <p className='text-muted-foreground'>{contactInfo.hours.sunday}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-0 shadow-lg'>
                <CardHeader>
                  <CardTitle>Connect With Us</CardTitle>
                  <CardDescription>Follow us on social media for updates and tips</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='flex justify-center space-x-4'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300'
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
                        className='h-5 w-5 text-amber-600'
                      >
                        <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
                      </svg>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300'
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
                        className='h-5 w-5 text-amber-600'
                      >
                        <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
                        <path d='M16 11.37A4 4 0 1 1 12.63 8' />
                        <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
                        <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
                      </svg>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300'
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
                        className='h-5 w-5 text-amber-600'
                      >
                        <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
                        <rect width='4' height='12' x='2' y='9' />
                        <circle cx='4' cy='4' r='2' />
                      </svg>
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='rounded-full border-amber-200 hover:bg-amber-50 hover:border-amber-300'
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
                        className='h-5 w-5 text-amber-600'
                      >
                        <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
                      </svg>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <Card className='border-0 shadow-lg'>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-amber-700'>What areas do you serve?</h4>
                    <p className='text-sm text-gray-600'>
                      We serve the entire {contactInfo.address.city} metropolitan area and
                      surrounding counties.
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-amber-700'>
                      How quickly will I receive a response?
                    </h4>
                    <p className='text-sm text-gray-600'>
                      We typically respond to all inquiries within 2-3 business hours during normal
                      business hours.
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <h4 className='font-medium text-amber-700'>
                      Do you offer virtual consultations?
                    </h4>
                    <p className='text-sm text-gray-600'>
                      Yes, we offer both in-person and virtual consultations to accommodate your
                      schedule and preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
