import Image from "next/image"
import type { PropertyData } from "@/types/property"
import { useCurrency } from "@/contexts/CurrencyContext"

interface PropertyCardProps {
  property: PropertyData
  onClick: (id: string) => void
  isSelected: boolean
}

export default function PropertyCard({ property, onClick, isSelected }: PropertyCardProps) {
  const { formatPrice } = useCurrency()
  return (
    <div
      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected ? "border-primary ring-2 ring-primary" : "border-gray-200 hover:border-gray-300"
      }`}
      onClick={() => onClick(property.id)}
    >
      <div className="relative h-48 w-full">
        <Image
          src={property.image || "/placeholder.svg?height=300&width=400"}
          alt={property.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg">{property.title}</h3>
        <p className="text-gray-600 text-sm">{property.address}</p>
        <div className="mt-2">
          <p className="text-xl font-bold text-primary">{formatPrice(Number(property.price))}</p>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>{property.bedrooms} Beds</span>
          <span>{property.bathrooms} Baths</span>
          <span>{property.sqft} sqft</span>
        </div>
      </div>
    </div>
  )
}

