import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const exteriorFeatures = [
  '2 Car Garage',
  'Veranda',
  'Restaurant Area',
  'Soundproof',
  'Jacuzzi',
  'Pets Allowed',
  'Covered Parking',
  'Double Parking',
  'Golf Simulator',
  'Balcony',
  'Multi Sports Court',
  'Roof Terrace',
  'Video Intercom',
  'On High Floor',
  'Private Swimming Pool',
  'Car Port',
  'Gated Community',
  'Basketball Court',
  'Parking',
  'Barbeque Pit',
  'Garage with Automatic Door',
  'Playground',
  'Tennis Court',
  'Built In BBQ',
  'On Mid Floor',
  'Terrace-Deck',
  'Basement Parking',
  'On Low Floor',
  'Sauna',
  'Corner Lot',
  'Irrigation System',
  'Game Room',
  'Steam Room',
  'Swimming Beach',
  'Golf Playing Area',
  'Squash Court',
];

const Step7ExteriorFeatures: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const toggleFeature = (feature: string) => {
    const updatedFeatures = formData.exteriorFeatures?.includes(feature)
      ? formData.exteriorFeatures.filter((f) => f !== feature)
      : [...(formData.exteriorFeatures || []), feature];
    updateFormData({ exteriorFeatures: updatedFeatures });
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium'>Exterior Features</h3>
        <p className='text-sm text-muted-foreground'>
          Select all exterior features that apply to this property.
        </p>
      </div>
      <ScrollArea className='h-[300px] w-full rounded-md border p-4'>
        <div className='grid grid-cols-2 gap-4'>
          {exteriorFeatures.map((feature) => {
            const isSelected = formData.exteriorFeatures?.includes(feature);
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

export default Step7ExteriorFeatures;
