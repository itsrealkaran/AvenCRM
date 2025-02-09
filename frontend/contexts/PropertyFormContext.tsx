import type React from 'react';
import { createContext, useContext, useState, type ReactNode } from 'react';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

interface Room {
  id: string;
  name: string;
  width: string;
  length: string;
  type: string;
}

interface Floor {
  id: string;
  name: string;
  level: number;
  rooms: Room[];
}

interface PropertyFormData {
  propertyType: string;
  zoningType: string;
  listingType: string;
  propertyName: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  sqft: string;
  description: string;
  addressLine: string;
  streetName: string;
  city: string;
  zipCode: string;
  country: string;
  longitude: string;
  latitude: string;
  rooms: Room[];
  floors: Floor[];
  isMetric: boolean;
  images: File[];
  imageNames: string[];
  documents: File[];
  utilities: string[];
  interiorFeatures: string[];
  exteriorFeatures: string[];
  exteriorTypes: string[];
  buildingDevelopmentFeatures: string[];
  locationFeatures: string[];
  generalFeatures: string[];
  views: string[];
  googleMapsLink: string;
}

interface PropertyFormContextType {
  formData: PropertyFormData;
  updateFormData: (newData: Partial<PropertyFormData>) => void;
  addFloor: () => void;
  removeFloor: (floorId: string) => void;
  updateFloor: (floorId: string, data: Partial<Floor>) => void;
  addRoom: (floorId: string) => void;
  updateRoom: (floorId: string, roomId: string, data: Partial<Room>) => void;
  removeRoom: (floorId: string, roomId: string) => void;
  reorderFloors: (startIndex: number, endIndex: number) => void;
  toggleMetric: () => void;
}

const PropertyFormContext = createContext<PropertyFormContextType | undefined>(undefined);

export const usePropertyForm = () => {
  const context = useContext(PropertyFormContext);
  if (!context) {
    throw new Error('usePropertyForm must be used within a PropertyFormProvider');
  }
  return context;
};

export const PropertyFormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<PropertyFormData>({
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
    imageNames: [],
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

  const updateFormData = (newData: Partial<PropertyFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const addFloor = () => {
    const newFloor: Floor = {
      id: generateId(),
      name: `Floor ${formData.floors.length + 1}`,
      level: formData.floors.length,
      rooms: [],
    };
    setFormData((prev) => ({
      ...prev,
      floors: [...prev.floors, newFloor],
    }));
  };

  const removeFloor = (floorId: string) => {
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors.filter((floor) => floor.id !== floorId),
    }));
  };

  const updateFloor = (floorId: string, data: Partial<Floor>) => {
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors.map((floor) => (floor.id === floorId ? { ...floor, ...data } : floor)),
    }));
  };

  const addRoom = (floorId: string) => {
    const newRoom: Room = {
      id: generateId(),
      name: '',
      width: '',
      length: '',
      type: '',
    };
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors.map((floor) =>
        floor.id === floorId ? { ...floor, rooms: [...floor.rooms, newRoom] } : floor
      ),
    }));
  };

  const updateRoom = (floorId: string, roomId: string, data: Partial<Room>) => {
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.map((room) => (room.id === roomId ? { ...room, ...data } : room)),
            }
          : floor
      ),
    }));
  };

  const removeRoom = (floorId: string, roomId: string) => {
    setFormData((prev) => ({
      ...prev,
      floors: prev.floors.map((floor) =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.filter((room) => room.id !== roomId),
            }
          : floor
      ),
    }));
  };

  const reorderFloors = (startIndex: number, endIndex: number) => {
    setFormData((prev) => {
      const result = Array.from(prev.floors);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return {
        ...prev,
        floors: result.map((floor, index) => ({ ...floor, level: index })),
      };
    });
  };

  const toggleMetric = () => {
    setFormData((prev) => ({
      ...prev,
      isMetric: !prev.isMetric,
    }));
  };

  return (
    <PropertyFormContext.Provider
      value={{
        formData,
        updateFormData,
        addFloor,
        removeFloor,
        updateFloor,
        addRoom,
        updateRoom,
        removeRoom,
        reorderFloors,
        toggleMetric,
      }}
    >
      {children}
    </PropertyFormContext.Provider>
  );
};
