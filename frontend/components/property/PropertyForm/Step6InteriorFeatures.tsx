import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';
import { Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const interiorFeatures = [
  'Automatic Door',
  'Fire Place',
  'Home Theatre',
  "Maid's Bathroom",
  'Pool-Indoor',
  'Unfurnished',
  'Wallpaper',
  'Crown Moulding',
  'Cloakroom',
  'Ceiling Fan',
  'Chamber en Suite',
  'Floor-Parquet',
  'Kitchen Extra',
  'Paintings',
  'Ready to Rent',
  'Built in Appliances',
  'Eat-in Kitchen',
  'Floors - Hardwood',
  'Kitchen - Dinette',
  'Partially Furnished',
  'Tiled Stove',
  'Entrance Hall',
  'Gas Stove',
  'Library',
  'Playroom',
  'Toy Room',
  'Appliances Included',
  'Shower',
  'Built in Closet',
  'Upgraded Bathroom',
  'Satin Paint',
  'Built Wardrobes',
  'Central AC',
  'Security Room',
  'Laundry Room',
  'Closed Kitchen',
  'Detached Guest Quarters',
  'Dry Pantry',
  'Games Room',
  'Graphite Countertops',
  'Guest Washroom',
  'Mass Pool',
  'Marble Flooring',
  'Open Plan Kitchen',
  'Smart Home Technology',
  'Server Room',
  'Sun Room',
  'Circular',
  'Sauna',
  'Carpet',
  'Tiled Flooring',
  'Vaulted Ceiling',
];

const Step6InteriorFeatures: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm();

  const toggleFeature = (feature: string) => {
    const updatedFeatures = formData.interiorFeatures?.includes(feature)
      ? formData.interiorFeatures.filter((f) => f !== feature)
      : [...(formData.interiorFeatures || []), feature];
    updateFormData({ interiorFeatures: updatedFeatures });
  };

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-lg font-medium'>Interior Features</h3>
        <p className='text-sm text-muted-foreground'>
          Select all interior features that apply to this property.
        </p>
      </div>
      <ScrollArea className='h-[300px] w-full rounded-md border p-4'>
        <div className='grid grid-cols-2 gap-4'>
          {interiorFeatures.map((feature) => {
            const isSelected = formData.interiorFeatures?.includes(feature);
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

export default Step6InteriorFeatures;
