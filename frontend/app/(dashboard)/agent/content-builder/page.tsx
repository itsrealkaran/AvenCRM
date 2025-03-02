"use client"

import { useState, useEffect } from "react"
import { getProperties, getProperty } from "@/lib/api"
import type { PropertyData } from "@/types/property"
import PropertyCard from "@/components/property-card"
import PropertyBrochure from "@/components/property-brochure"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      try {
        const data = await getProperties()
        setProperties(data.properties)

        // Select the first property by default
        if (data.properties.length > 0) {
          setSelectedProperty(data.properties[0])
        }

        setLoading(false)
      } catch (error) {
        console.error("Failed to load properties:", error)
        setLoading(false)
      }
    }

    loadProperties()
  }, [])

  const handleSelectProperty = async (id: string) => {
    setLoading(true)
    try {
      const property = await getProperty(id)
      if (property) {
        setSelectedProperty(property)
      }
    } catch (error) {
      console.error("Failed to load property:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !selectedProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="flex flex-col md:flex-row h-screen">
      {/* Left side: Scrollable property list */}
      <div className="w-full md:w-1/3 p-4 overflow-y-auto border-r">
        <div className="space-y-4">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={handleSelectProperty}
              isSelected={selectedProperty?.id === property.id}
            />
          ))}
        </div>
      </div>

      {/* Right side: Property brochure */}
      <div className="w-full md:w-2/3 p-4 overflow-y-auto">
        {selectedProperty ? (
          <div className="max-w-full overflow-x-hidden">
            <PropertyBrochure property={selectedProperty} />
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

