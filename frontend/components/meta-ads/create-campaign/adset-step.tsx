'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';

type AdsetData = {
  name: string;
  daily_budget: string;
  end_time: string;
  targetAudience: {
    geo_location: {
      countries: string[];
      cities: Array<{
        key: string;
        radius: number;
        distance_unit: string;
      }>;
    };
    min_age: number;
    max_age: number;
  };
};

interface Location {
  key: string;
  name: string;
  type: string;
  country_code?: string;
}

// Define the change handler type
type CustomChangeEvent = {
  target: {
    name: string;
    value: string | Location;
  };
};

export function AdsetStep({
  data,
  updateData,
  accessToken,
}: {
  data: AdsetData;
  updateData: (data: Partial<AdsetData>) => void;
  accessToken: string;
}) {
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [cityLocations, setCityLocations] = useState<Location[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);

  const debouncedSearch = useDebounce(countryInput, 500);
  const debouncedCitySearch = useDebounce(cityInput, 500);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | CustomChangeEvent) => {
    if (e.target) {
      updateData({ [e.target.name]: e.target.value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    updateData({ [name]: value });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData({
      targetAudience: {
        ...data.targetAudience,
        [name]: Number.parseInt(value) || 0,
      },
    });
  };

  const addCountry = (location: Location) => {
    updateData({
      targetAudience: {
        ...data.targetAudience,
        geo_location: {
          ...data.targetAudience.geo_location,
          countries: [...data.targetAudience.geo_location.countries, location.name],
        },
      },
    });
  };

  const removeCountry = (country: string) => {
    updateData({
      targetAudience: {
        ...data.targetAudience,
        geo_location: {
          ...data.targetAudience.geo_location,
          countries: data.targetAudience.geo_location.countries.filter((c) => c !== country),
        },
      },
    });
  };

  const addCity = (location: Location) => {
    const newCity = {
      key: location.key,
      radius: 50, // default radius in kilometers
      distance_unit: 'kilometer',
    };

    if (!data.targetAudience.geo_location.cities.some((city) => city.key === location.key)) {
      updateData({
        targetAudience: {
          ...data.targetAudience,
          geo_location: {
            ...data.targetAudience.geo_location,
            cities: [...data.targetAudience.geo_location.cities, newCity],
          },
        },
      });
    }
  };

  const removeCity = (cityKey: string) => {
    updateData({
      targetAudience: {
        ...data.targetAudience,
        geo_location: {
          ...data.targetAudience.geo_location,
          cities: data.targetAudience.geo_location.cities.filter((city) => city.key !== cityKey),
        },
      },
    });
  };

  useEffect(() => {
    const searchLocations = async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        setLocations([]);
        return;
      }

      setIsLoading(true);
      try {
        //@ts-ignore
        FB.api(
          `/search?q=${debouncedSearch}&type=adgeolocation&location_types=["country"]&access_token=${accessToken}`,
          'GET',
          {},
          function (response: any) {
            setLocations(response.data || []);
          }
        );
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchLocations();
  }, [debouncedSearch]);

  useEffect(() => {
    const searchCities = async () => {
      if (!debouncedCitySearch || debouncedCitySearch.length < 2) {
        setCityLocations([]);
        return;
      }

      setIsCityLoading(true);
      try {
        //@ts-ignore
        FB.api(
          `/search?q=${debouncedCitySearch}&type=adgeolocation&location_types=["city"]&access_token=${accessToken}`,
          'GET',
          {},
          function (response: any) {
            setCityLocations(response.data || []);
            console.log(response.data, 'response from cities search');
          }
        );
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setIsCityLoading(false);
      }
    };

    searchCities();
  }, [debouncedCitySearch]);

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <Label htmlFor='adsetName'>Ad Name</Label>
            <Input
              id='adsetName'
              name='name'
              value={data.name}
              onChange={handleChange}
              placeholder='Enter adset name'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='daily_budget'>Daily Budget</Label>
            <Input
              id='daily_budget'
              name='daily_budget'
              type='number'
              value={data.daily_budget}
              onChange={handleChange}
              placeholder='Enter daily budget'
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='end_time'>End Time</Label>
            <Input
              id='end_time'
              name='end_time'
              type='datetime-local'
              value={data.end_time}
              onChange={handleChange}
            />
          </div>

          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Target Audience</h3>

            <div className='space-y-2'>
              <Label htmlFor='countries'>Countries</Label>
              <div className='relative'>
                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <Input
                      id='countries'
                      value={countryInput}
                      onChange={(e) => {
                        setCountryInput(e.target.value);
                        setIsOpen(true);
                      }}
                      placeholder='Search for countries'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && locations.length > 0) {
                          e.preventDefault();
                          const firstLocation = locations[0];
                          addCountry(firstLocation);
                          setCountryInput('');
                          setIsOpen(false);
                        }
                      }}
                    />
                    {isLoading && (
                      <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                        <Loader2 className='h-4 w-4 animate-spin text-gray-500' />
                      </div>
                    )}
                  </div>
                </div>

                {isOpen && (countryInput || isLoading) && (
                  <div className='absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto'>
                    {locations.length > 0 ? (
                      <ul className='py-1'>
                        {locations.map((location) => (
                          <li
                            key={location.key}
                            className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                            onClick={() => {
                              addCountry(location);
                              setCountryInput('');
                              setIsOpen(false);
                            }}
                          >
                            <div className='font-medium'>{location.name}</div>
                            <div className='text-xs text-gray-500'>
                              {location.country_code && `${location.country_code}`}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : !isLoading && countryInput ? (
                      <div className='px-4 py-2 text-sm text-gray-500'>No countries found</div>
                    ) : null}
                  </div>
                )}

                <div className='flex flex-wrap gap-2 mt-2'>
                  {data.targetAudience.geo_location.countries.map((country, index) => (
                    <Badge key={index} variant='secondary' className='flex items-center gap-1'>
                      {country}
                      <X
                        className='h-3 w-3 cursor-pointer'
                        onClick={() => removeCountry(country)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='cities'>Cities</Label>
              <div className='relative'>
                <div className='flex gap-2'>
                  <div className='relative flex-1'>
                    <Input
                      id='cities'
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        setIsCityDropdownOpen(true);
                      }}
                      placeholder='Search for cities'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && cityLocations.length > 0) {
                          e.preventDefault();
                          const firstLocation = cityLocations[0];
                          addCity(firstLocation);
                          setCityInput('');
                          setIsCityDropdownOpen(false);
                        }
                      }}
                    />
                    {isCityLoading && (
                      <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                        <Loader2 className='h-4 w-4 animate-spin text-gray-500' />
                      </div>
                    )}
                  </div>
                </div>

                {isCityDropdownOpen && (cityInput || isCityLoading) && (
                  <div className='absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto'>
                    {cityLocations.length > 0 ? (
                      <ul className='py-1'>
                        {cityLocations.map((location) => (
                          <li
                            key={location.key}
                            className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                            onClick={() => {
                              addCity(location);
                              setCityInput('');
                              setIsCityDropdownOpen(false);
                            }}
                          >
                            <div className='font-medium'>{location.name}</div>
                            <div className='text-xs text-gray-500'>
                              {location.country_code && `${location.country_code}`}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : !isCityLoading && cityInput ? (
                      <div className='px-4 py-2 text-sm text-gray-500'>No cities found</div>
                    ) : null}
                  </div>
                )}

                <div className='flex flex-wrap gap-2 mt-2'>
                  {data.targetAudience.geo_location.cities.map((city) => (
                    <Badge key={city.key} variant='secondary' className='flex items-center gap-1'>
                      {city.key} ({city.radius}km)
                      <X className='h-3 w-3 cursor-pointer' onClick={() => removeCity(city.key)} />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='min_age'>Minimum Age</Label>
                <Input
                  id='min_age'
                  name='min_age'
                  type='number'
                  min='13'
                  max='65'
                  value={data.targetAudience.min_age}
                  onChange={handleAgeChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='max_age'>Maximum Age</Label>
                <Input
                  id='max_age'
                  name='max_age'
                  type='number'
                  min='13'
                  max='65'
                  value={data.targetAudience.max_age}
                  onChange={handleAgeChange}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Button({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline';
}) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium';
  const variantClasses =
    props.variant === 'outline'
      ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      : 'bg-primary text-primary-foreground hover:bg-primary/90';

  return (
    <button className={`${baseClasses} ${variantClasses} ${className || ''}`} {...props}>
      {children}
    </button>
  );
}
