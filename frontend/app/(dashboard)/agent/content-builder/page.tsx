"use client"

import { useState, useEffect } from "react"
import type { PropertyData } from "@/types/property"
import PropertyCard from "@/components/property-card"
import PropertyBrochure from "@/components/property-brochure"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"

// Create a custom hook for property fetching
const useProperty = (id: string | null) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const response = await api.get(`/property/${id}`)
      return response.data
    },
    enabled: !!id, // Only fetch when id is available
  });
};

export default function Home() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const response = await api.get('/property')
      return response.data
    },
  })

  const { data: selectedProperty, isLoading: selectedPropertyLoading } = useProperty(selectedPropertyId)

  useEffect(() => {
    if (data) {
      // remove the objects with the isverified false from data.myProperty
      const myProperty = data.myProperty.filter((property: PropertyData) => property.isVerified)
      setProperties([...myProperty, ...data.allProperty])
    }
    setLoading(false)
  }, [data])

  const handleSelectProperty = (id: string) => {
    setSelectedPropertyId(id)
  }

  if (loading && !selectedProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  console.log(selectedProperty)

  return (
    <main className="flex flex-col md:flex-row h-screen">
      {/* Left side: Scrollable property list */}
      <div className="w-full md:w-1/4 p-4 overflow-y-auto border-r">
        <div className="space-y-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id} //@ts-ignore
              property={property.cardDetails}
              id={property.id}
              onClick={handleSelectProperty}
              isSelected={selectedProperty?.id === property.id}
            />
          ))}
        </div>
      </div>

      {/* Right side: Property brochure */}
      <div className="w-full md:w-3/4 p-4 overflow-y-auto">
        {selectedProperty ? (
          <div className="max-w-full overflow-x-hidden">
            <PropertyBrochure property={selectedProperty.features} createdBy={selectedProperty.createdBy} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a property to view its brochure</p>
          </div>
        )}
      </div>
    </main>
  )
}

