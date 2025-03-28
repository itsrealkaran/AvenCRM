'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building,
  CheckCircle,
  FileText,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface SetupFormProps {
  navigateTo: (view: string) => void;
}

export default function SetupForm({ navigateTo }: SetupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    title: '',
    location: '',
    bio: '',
    profileImage: '',

    // Location Search Settings
    locationSearchTitle: 'Find Your Dream Home',
    locationSearchDescription:
      'Search for properties in your desired location and connect with our expert agents.',
    locationSearchBackgroundImage: '',

    // Document Download Settings
    documentTitle: 'Document Resource Center',
    documentDescription:
      'Access our comprehensive collection of real estate documents, forms, and templates.',
    documentRequireForm: true,

    // Contact Form Settings
    contactFormTitle: 'Get in Touch With Our Team',
    contactFormDescription:
      'Have questions about buying or selling a property? Our team of experts is here to help you every step of the way.',
    contactFormBackgroundImage: '',

    // Stats
    dealsCount: '',
    propertyValue: '',
    yearsExperience: '',
    clientSatisfaction: '',

    // About
    approach: '',
    expertise: [
      'Luxury Residential Properties',
      'Investment Properties',
      'First-Time Home Buyers',
      'Property Valuation',
    ],
    certifications: [
      'Certified Residential Specialist (CRS)',
      "Accredited Buyer's Representative (ABR)",
      'Luxury Home Marketing Specialist',
      'Certified Negotiation Expert (CNE)',
    ],
    education: '',

    // Contact
    phone: '',
    email: '',
    officeLocation: '',
    facebook: '',
    instagram: '',
    linkedin: '',

    // Testimonials
    testimonials: [
      { text: '', client: '', location: '' },
      { text: '', client: '', location: '' },
      { text: '', client: '', location: '' },
    ],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExpertiseChange = (index: number, value: string) => {
    const newExpertise = [...formData.expertise];
    newExpertise[index] = value;
    setFormData((prev) => ({ ...prev, expertise: newExpertise }));
  };

  const handleCertificationChange = (index: number, value: string) => {
    const newCertifications = [...formData.certifications];
    newCertifications[index] = value;
    setFormData((prev) => ({ ...prev, certifications: newCertifications }));
  };

  const handleTestimonialChange = (index: number, field: string, value: string) => {
    const newTestimonials = [...formData.testimonials];
    newTestimonials[index] = { ...newTestimonials[index], [field]: value };
    setFormData((prev) => ({ ...prev, testimonials: newTestimonials }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would save this data to a database
    // For this example, we'll use localStorage to simulate data persistence
    localStorage.setItem('realtorData', JSON.stringify(formData));
    router.push('/');
  };

  return (
    <div className='container mx-auto py-10 px-4'>
      <div className='max-w-3xl mx-auto'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent'>
            Create Your Realtor Portfolio
          </h1>
          <p className='text-muted-foreground'>
            Complete the form below to set up your personalized realtor portfolio
          </p>
        </div>

        <div className='mb-8'>
          <div className='flex justify-between mb-2'>
            <span className='text-sm font-medium'>
              Step {step} of {totalSteps}
            </span>
            <span className='text-sm font-medium'>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        <form onSubmit={handleSubmit}>
          <Card className='border-none shadow-xl'>
            <CardHeader>
              <CardTitle>
                {step === 1 && (
                  <div className='flex items-center gap-2'>
                    <User className='h-5 w-5 text-primary' />
                    <span>Personal Information</span>
                  </div>
                )}
                {step === 2 && (
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='h-5 w-5 text-primary' />
                    <span>Your Achievements</span>
                  </div>
                )}
                {step === 3 && (
                  <div className='flex items-center gap-2'>
                    <Award className='h-5 w-5 text-primary' />
                    <span>About You</span>
                  </div>
                )}
                {step === 4 && (
                  <div className='flex items-center gap-2'>
                    <Phone className='h-5 w-5 text-primary' />
                    <span>Contact Information</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {/* Step 1: Personal Information */}
              {step === 1 && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Full Name</Label>
                    <Input
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleChange}
                      placeholder='e.g. Sarah Johnson'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='title'>Professional Title</Label>
                    <Input
                      id='title'
                      name='title'
                      value={formData.title}
                      onChange={handleChange}
                      placeholder='e.g. Luxury Real Estate Specialist'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      name='location'
                      value={formData.location}
                      onChange={handleChange}
                      placeholder='e.g. San Francisco Bay Area, CA'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='bio'>Short Bio</Label>
                    <Textarea
                      id='bio'
                      name='bio'
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder='e.g. Helping clients find their dream homes and maximize property investments...'
                      rows={3}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='profileImage'>Profile Image URL</Label>
                    <Input
                      id='profileImage'
                      name='profileImage'
                      value={formData.profileImage || ''}
                      onChange={handleChange}
                      placeholder='e.g. https://example.com/your-image.jpg'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Leave empty to use default image
                    </p>
                  </div>
                </>
              )}

              {/* Step 2: Stats/Achievements */}
              {step === 2 && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='dealsCount'>Deals Closed</Label>
                    <Input
                      id='dealsCount'
                      name='dealsCount'
                      value={formData.dealsCount}
                      onChange={handleChange}
                      placeholder='e.g. 350+'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='propertyValue'>Property Value Handled</Label>
                    <Input
                      id='propertyValue'
                      name='propertyValue'
                      value={formData.propertyValue}
                      onChange={handleChange}
                      placeholder='e.g. $500M+'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='yearsExperience'>Years of Experience</Label>
                    <Input
                      id='yearsExperience'
                      name='yearsExperience'
                      value={formData.yearsExperience}
                      onChange={handleChange}
                      placeholder='e.g. 15+'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='clientSatisfaction'>Client Satisfaction Rate</Label>
                    <Input
                      id='clientSatisfaction'
                      name='clientSatisfaction'
                      value={formData.clientSatisfaction}
                      onChange={handleChange}
                      placeholder='e.g. 98%'
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 3: About */}
              {step === 3 && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='approach'>Your Approach</Label>
                    <Textarea
                      id='approach'
                      name='approach'
                      value={formData.approach}
                      onChange={handleChange}
                      placeholder='Describe your approach to real estate...'
                      rows={3}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Areas of Expertise</Label>
                    <div className='grid gap-2'>
                      {formData.expertise.map((item, index) => (
                        <Input
                          key={index}
                          value={item}
                          onChange={(e) => handleExpertiseChange(index, e.target.value)}
                          placeholder={`Expertise ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label>Certifications</Label>
                    <div className='grid gap-2'>
                      {formData.certifications.map((item, index) => (
                        <Input
                          key={index}
                          value={item}
                          onChange={(e) => handleCertificationChange(index, e.target.value)}
                          placeholder={`Certification ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='education'>Education</Label>
                    <Input
                      id='education'
                      name='education'
                      value={formData.education}
                      onChange={handleChange}
                      placeholder='e.g. Bachelor of Business Administration in Real Estate, University of California, Berkeley'
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 4: Contact Information */}
              {step === 4 && (
                <>
                  <div className='space-y-2'>
                    <Label htmlFor='phone'>Phone Number</Label>
                    <Input
                      id='phone'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder='e.g. (415) 555-0123'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      value={formData.email}
                      onChange={handleChange}
                      placeholder='e.g. sarah@sarahjohnsonrealty.com'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='officeLocation'>Office Location</Label>
                    <Input
                      id='officeLocation'
                      name='officeLocation'
                      value={formData.officeLocation}
                      onChange={handleChange}
                      placeholder='e.g. 123 Market Street, San Francisco, CA 94105'
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='facebook'>Facebook URL</Label>
                    <Input
                      id='facebook'
                      name='facebook'
                      value={formData.facebook || ''}
                      onChange={handleChange}
                      placeholder='e.g. https://facebook.com/yourprofile'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='instagram'>Instagram URL</Label>
                    <Input
                      id='instagram'
                      name='instagram'
                      value={formData.instagram || ''}
                      onChange={handleChange}
                      placeholder='e.g. https://instagram.com/yourprofile'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='linkedin'>LinkedIn URL</Label>
                    <Input
                      id='linkedin'
                      name='linkedin'
                      value={formData.linkedin || ''}
                      onChange={handleChange}
                      placeholder='e.g. https://linkedin.com/in/yourprofile'
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter className='flex justify-between'>
              <Button type='button' variant='outline' onClick={prevStep} disabled={step === 1}>
                <ArrowLeft className='mr-2 h-4 w-4' /> Back
              </Button>

              {step < totalSteps ? (
                <Button type='button' onClick={nextStep}>
                  Next <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              ) : (
                <Button type='submit' className='bg-primary hover:bg-primary/90'>
                  Create Portfolio <Building className='ml-2 h-4 w-4' />
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
