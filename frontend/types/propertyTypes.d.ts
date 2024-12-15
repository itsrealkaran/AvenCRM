export type PropertyData = {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  sqft: number;
  description: string;
  title: string;
  propertySummary: {
    propertyType: string;
    buildingType: string;
    squareFootage: number;
    communityName: string;
    subdivision: string;
    storeys: number;
    landSize: number;
    buildIn: string;
    annualPropretyTax: number;
    parkingType: string;
  };
  bathrooms: {
    totalBathrooms: string;
    partailBathrooms: number;
  };
  interiorFeatures: {
    appliaanceIncluded: string;
    flooring: string;
    basementType: string;
  };
  buildingFeatures: {
    features: string;
    foundationType: string;
    style: string;
    architectureStyle: string;
    constructionMaterial: string;
  };
  heatingNcooling: {
    cooling: string;
    fireplace: string;
    heatingType: string;
  };
  exteriorFeatures: {
    exteriorFinishing: string;
    roofType: string;
  };
  parking: {
    squareFootage: string;
    totalFinishedArea: number;
  };
  measurements: {
    sqft: number;
    totalfinishSqft: number;
  };
  rooms: room[];
  lotFeatures: {
    fencing: string;
    frontage: string;
    landDepth: string;
  };
  images: string[];
  agentId: string;
};

type room = {
  level: string;
  roomType: string;
  width: number;
  length: number;
  height: number;
};
