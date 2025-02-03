import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const locationFeatures = [
  'Accessible by Boat',
  'City Center',
  'Near Airport',
  'Near Beach',
  'Near Church',
  'Near Highway',
  'Near Hospital',
  'Near Public Transportation',
  'Town Centre',
  'Near Metro Station',
  'Near Sports Arenas',
  'Attached',
  'Outlet Area',
  'Commerce',
  'Near Congress Centre',
  'Near Railway Station',
  'Beachfront',
  'Near Mosque',
  'Near the Creek',
  'Corner Lot',
  'Residential Area',
  'Industrial Area',
  'Vastu Compliant',
  'Downtown',
  'Near Bus Stop',
  'Near Fitness Centre',
  'Near Ocean',
  'Near Schools',
  'Near Medical Center',
  'Near Restaurants',
  'Near Amenities',
  'Business & Shopping Area',
  'Near Harbour',
  'Fronting on Lake',
  "Near Children's Park",
  'Near Golf Course',
  'Near Park',
  "Near Children's Nursery",
  'Near Shopping Mall',
  'Near Marina',
];

const Step10LocationFeatures: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const toggleFeature = (feature: string) => {
    const updatedFeatures = formData.locationFeatures?.includes(feature)
      ? formData.locationFeatures.filter((f) => f !== feature)
      : [...(formData.locationFeatures || []), feature];
    updateFormData({ locationFeatures: updatedFeatures });
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium'>Location Features</h3>
        <p className='text-sm text-muted-foreground'>
          Select all location features that apply to this property.
        </p>
      </div>
      <ScrollArea className='h-[300px] w-full rounded-md border p-4'>
        <div className='grid grid-cols-2 gap-4'>
          {locationFeatures.map((feature) => {
            const isSelected = formData.locationFeatures?.includes(feature);
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

export default Step10LocationFeatures;
