import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const buildingDevelopmentFeatures = [
  '24 Hour Security',
  'Bank-ATM Facility',
  'BBQ Facilities',
  'Beach Access',
  'Central Gas',
  'Central Heating',
  "Children's Play Area (Outdoor)",
  "Children's Swimming Pool",
  'Cigar Room',
  'Community Centre',
  'Concierge',
  'Equestrian Centre',
  'Fitness Club',
  'Golf Course',
  'Gymnasium',
  'Hotel Services',
  'Landscaped Garden',
  'Media Room',
  'Parking',
  'Pool Club',
  'Sky Lounge',
  'Landscaped Indoor Courtyards',
  'Sauna',
  'Squash Courts',
  'Tennis Court',
  'Laundry Facilities',
  'Pets Allowed',
  'Recreational Facilities',
  'Valet Parking',
  'Water Sport',
];

const Step9BuildingDevelopmentFeatures: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const toggleFeature = (feature: string) => {
    const updatedFeatures = formData.buildingDevelopmentFeatures?.includes(feature)
      ? formData.buildingDevelopmentFeatures.filter((f) => f !== feature)
      : [...(formData.buildingDevelopmentFeatures || []), feature];
    updateFormData({ buildingDevelopmentFeatures: updatedFeatures });
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium'>Building Development Features</h3>
        <p className='text-sm text-muted-foreground'>
          Select all building development features that apply to this property.
        </p>
      </div>
      <ScrollArea className='h-[300px] w-full rounded-md border p-4'>
        <div className='grid grid-cols-2 gap-4'>
          {buildingDevelopmentFeatures.map((feature) => {
            const isSelected = formData.buildingDevelopmentFeatures?.includes(feature);
            return (
              <Button
                key={feature}
                type='button'
                variant={isSelected ? 'default' : 'outline'}
                className={`justify-start ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => toggleFeature(feature)}
              >
                {isSelected && <Check className='mr-2 h-4 w-4' />}
                {feature}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Step9BuildingDevelopmentFeatures;
