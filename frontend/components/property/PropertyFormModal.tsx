import type React from 'react';
import { useEffect, useState } from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';

import LastDocuments from './PropertyForm/LastDocuments';
import Step1BasicInfo from './PropertyForm/Step1BasicInfo';
import Step2Details from './PropertyForm/Step2Details';
import Step3Location from './PropertyForm/Step3Location';
import Step4Rooms from './PropertyForm/Step4Rooms';
import Step5Utilities from './PropertyForm/Step5Utilities';
import Step6InteriorFeatures from './PropertyForm/Step6InteriorFeatures';
import Step7ExteriorFeatures from './PropertyForm/Step7ExteriorFeatures';
import Step8ExteriorType from './PropertyForm/Step8ExteriorType';
import Step9BuildingDevelopmentFeatures from './PropertyForm/Step9BuildingDevelopmentFeatures';
import Step10LocationFeatures from './PropertyForm/Step10LocationFeatures';
import Step11GeneralFeatures from './PropertyForm/Step11GeneralFeatures';
import Step12Views from './PropertyForm/Step12Views';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (property: any) => void;
  propertyToEdit?: any; // Add this prop for editing
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  propertyToEdit,
}) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formData, updateFormData } = usePropertyForm();

  // Only update form data when the modal opens with propertyToEdit
  useEffect(() => {
    if (isOpen && propertyToEdit) {
      updateFormData(propertyToEdit);
    }
  }, [isOpen]); // Only depend on isOpen, we only want to update when the modal opens

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      updateFormData({
        propertyType: '',
        zoningType: '',
        listingType: '',
        propertyName: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        parking: '',
        sqft: '',
        description: '',
        addressLine: '',
        streetName: '',
        city: '',
        zipCode: '',
        country: '',
        longitude: '',
        latitude: '',
        rooms: [],
        floors: [],
        isMetric: true,
        images: [],
        documents: [],
        utilities: [],
        interiorFeatures: [],
        exteriorFeatures: [],
        exteriorTypes: [],
        buildingDevelopmentFeatures: [],
        locationFeatures: [],
        generalFeatures: [],
        views: [],
        googleMapsLink: '',
      });
    }
  }, [isOpen]);

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 13));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Get the complete form data
      const completeFormData = {
        ...formData,
        images: formData.imageNames.map((file) => file), // Convert File objects to file names
        documents: formData.documents.map((file) => file.name), // Convert File objects to file names
      };

      // Create card-related data
      const cardData = {
        //@ts-ignore
        id: formData.id || String(Date.now()),
        title: formData.propertyName || '',
        address: `${formData.addressLine}, ${formData.city}, ${formData.zipCode}`,
        price: Number.parseFloat(formData.price) || 0,
        isVerified: false,
        image: formData.imageNames.length > 0 ? formData.imageNames[0] : undefined,
        beds: Number.parseInt(formData.bedrooms) || 0,
        baths: Number.parseInt(formData.bathrooms) || 0,
        sqft: Number.parseInt(formData.sqft) || 0,
        parking: Number.parseInt(formData.parking) || 0,
      };

      const response = await api.post(`/property`, {
        cardData,
        completeFormData,
      });

      // Call the onSubmit prop with the card data
      onSubmit(cardData);
      setStep(1);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>
            {propertyToEdit ? 'Edit' : 'Add New'} Property - Step {step} of 13
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {step === 1 && <Step1BasicInfo />}
          {step === 2 && <Step2Details />}
          {step === 3 && <Step3Location />}
          {step === 4 && <Step4Rooms />}
          {step === 5 && <Step5Utilities />}
          {step === 6 && <Step6InteriorFeatures />}
          {step === 7 && <Step7ExteriorFeatures />}
          {step === 8 && <Step8ExteriorType />}
          {step === 9 && <Step9BuildingDevelopmentFeatures />}
          {step === 10 && <Step10LocationFeatures />}
          {step === 11 && <Step11GeneralFeatures />}
          {step === 12 && <Step12Views />}
          {step === 13 && <LastDocuments />}
        </form>
        <DialogFooter>
          {step > 1 && (
            <Button type='button' variant='outline' onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {step < 13 ? (
            <Button
              type='button'
              className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type='submit'
              className='bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  {propertyToEdit ? 'Updating...' : 'Submitting...'}
                </>
              ) : propertyToEdit ? (
                'Update'
              ) : (
                'Submit'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyFormModal;
