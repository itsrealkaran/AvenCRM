import type React from 'react';
import { usePropertyForm } from '@/contexts/PropertyFormContext';
import { ChevronDown, ChevronUp, GripVertical, Home, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const roomTypes = [
  { value: 'bedroom', label: 'Bedroom' },
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'living', label: 'Living Room' },
  { value: 'dining', label: 'Dining Room' },
  { value: 'office', label: 'Office' },
  { value: 'garage', label: 'Garage' },
  { value: 'other', label: 'Other' },
];

const Step4Rooms: React.FC = () => {
  const {
    formData,
    addFloor,
    removeFloor,
    updateFloor,
    addRoom,
    updateRoom,
    removeRoom,
    reorderFloors,
    toggleMetric,
  } = usePropertyForm();

  const convertValue = (value: string, toMetric: boolean): string => {
    if (!value) return '';
    const num = Number.parseFloat(value);
    if (isNaN(num)) return value;
    return toMetric ? (num * 0.3048).toFixed(2) : (num / 0.3048).toFixed(2);
  };

  const handleMetricToggle = () => {
    formData.floors.forEach((floor) => {
      floor.rooms.forEach((room) => {
        updateRoom(floor.id, room.id, {
          width: convertValue(room.width, !formData.isMetric),
          length: convertValue(room.length, !formData.isMetric),
        });
      });
    });
    toggleMetric();
  };

  const moveFloor = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < formData.floors.length) {
      reorderFloors(index, newIndex);
    }
  };

  const getDimensions = (width: string, length: string) => {
    if (!width || !length) return '';
    const unit = formData.isMetric ? 'm' : 'Ft';
    return `${width} ${unit} x ${length} ${unit}`;
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h3 className='text-lg font-medium'>Floors & Rooms</h3>
          <Button type='button' variant='outline' size='sm' onClick={addFloor} className='gap-2'>
            <Plus className='w-4 h-4' />
            Add Floor
          </Button>
        </div>
        <div className='flex items-center space-x-2'>
          <span className={formData.isMetric ? 'text-muted-foreground' : 'font-medium'}>
            Imperial
          </span>
          <Switch
            checked={formData.isMetric}
            onCheckedChange={handleMetricToggle}
            className='data-[state=checked]:bg-[#7C3AED] data-[state=unchecked]:bg-input'
          />
          <span className={!formData.isMetric ? 'text-muted-foreground' : 'font-medium'}>
            Metric
          </span>
        </div>
      </div>

      <ScrollArea className='h-[300px] pr-4'>
        <div className='space-y-4'>
          {formData.floors.map((floor, index) => (
            <Card key={floor.id} className='relative group'>
              <div className='absolute left-2 inset-y-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8'
                  onClick={() => moveFloor(index, 'up')}
                  disabled={index === 0}
                >
                  <ChevronUp className='w-4 h-4' />
                </Button>
                <GripVertical className='w-4 h-4 text-muted-foreground my-1' />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='h-8 w-8'
                  onClick={() => moveFloor(index, 'down')}
                  disabled={index === formData.floors.length - 1}
                >
                  <ChevronDown className='w-4 h-4' />
                </Button>
              </div>
              <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-base font-medium'>
                  <Input
                    value={floor.name}
                    onChange={(e) => updateFloor(floor.id, { name: e.target.value })}
                    className='h-8 w-[200px] font-medium'
                  />
                </CardTitle>
                <div className='flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => addRoom(floor.id)}
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Room
                  </Button>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => removeFloor(floor.id)}
                  >
                    <Trash2 className='w-4 h-4 text-red-500' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {floor.rooms.map((room) => (
                    <Card key={room.id} className='bg-muted/50'>
                      <CardContent className='p-4 space-y-4'>
                        <div className='flex items-center justify-between gap-2'>
                          <Input
                            placeholder='Room name'
                            value={room.name}
                            onChange={(e) =>
                              updateRoom(floor.id, room.id, { name: e.target.value })
                            }
                            className='h-8'
                          />
                          <Select
                            value={room.type}
                            onValueChange={(value) =>
                              updateRoom(floor.id, room.id, { type: value })
                            }
                          >
                            <SelectTrigger className='w-[140px] h-8'>
                              <SelectValue placeholder='Room type' />
                            </SelectTrigger>
                            <SelectContent>
                              {roomTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeRoom(floor.id, room.id)}
                            className='h-8 w-8'
                          >
                            <Trash2 className='w-4 h-4 text-red-500' />
                          </Button>
                        </div>
                        <div className='grid grid-cols-2 gap-2'>
                          <div className='space-y-1'>
                            <Label className='text-xs'>Width</Label>
                            <Input
                              type='number'
                              step='0.01'
                              value={room.width}
                              onChange={(e) =>
                                updateRoom(floor.id, room.id, { width: e.target.value })
                              }
                              placeholder={formData.isMetric ? 'Meters' : 'Feet'}
                              className='h-8'
                            />
                          </div>
                          <div className='space-y-1'>
                            <Label className='text-xs'>Length</Label>
                            <Input
                              type='number'
                              step='0.01'
                              value={room.length}
                              onChange={(e) =>
                                updateRoom(floor.id, room.id, { length: e.target.value })
                              }
                              placeholder={formData.isMetric ? 'Meters' : 'Feet'}
                              className='h-8'
                            />
                          </div>
                        </div>
                        {room.width && room.length && (
                          <p className='text-xs text-muted-foreground'>
                            Dimensions: {getDimensions(room.width, room.length)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {floor.rooms.length === 0 && (
                    <div className='col-span-2 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg'>
                      <Home className='w-8 h-8 text-muted-foreground mb-2' />
                      <p className='text-sm text-muted-foreground'>
                        No rooms added to this floor yet
                      </p>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => addRoom(floor.id)}
                        className='mt-2'
                      >
                        <Plus className='w-4 h-4 mr-2' />
                        Add Room
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {formData.floors.length === 0 && (
            <div className='flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg'>
              <Home className='w-12 h-12 text-muted-foreground mb-4' />
              <p className='text-sm text-muted-foreground mb-4'>
                No floors added yet. Start by adding a floor to your property.
              </p>
              <Button type='button' onClick={addFloor}>
                <Plus className='w-4 h-4 mr-2' />
                Add First Floor
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Step4Rooms;
