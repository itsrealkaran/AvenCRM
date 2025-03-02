"use client"

import { useRef } from "react"
import Image from "next/image"
import type { PropertyData } from "@/types/property"
import { formatCurrency } from "@/lib/utils"
import { Download, MapPin, Bed, Bath, SquareIcon as SquareFoot } from "lucide-react"
import { Button } from "@/components/ui/button"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface PropertyBrochureProps {
  property: PropertyData
}

export default function PropertyBrochure({ property }: PropertyBrochureProps) {
  const brochureRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!brochureRef.current) return

    const canvas = await html2canvas(brochureRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: brochureRef.current.scrollWidth,
      windowHeight: brochureRef.current.scrollHeight,
    })

    const imgData = canvas.toDataURL("image/jpeg", 1.0)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
    const imgX = (pageWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`${property.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)
  }

  const handleDownloadImage = async () => {
    if (!brochureRef.current) return

    const canvas = await html2canvas(brochureRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: brochureRef.current.scrollWidth,
      windowHeight: brochureRef.current.scrollHeight,
    })

    const link = document.createElement("a")
    link.download = `${property.title.replace(/\s+/g, "-").toLowerCase()}.jpg`
    link.href = canvas.toDataURL("image/jpeg", 0.8)
    link.click()
  }

  // Create room specs from floors data
  const roomSpecs = property.floors.flatMap((floor) =>
    floor.rooms.map((room) => ({
      name: room.name || `Room (${floor.name})`,
      dimensions: `${room.width}x${room.length}`,
    })),
  )

  // Group features for better organization
  const allFeatures = [
    ...property.interiorFeatures.map((f) => ({ type: "Interior", name: f })),
    ...property.exteriorFeatures.map((f) => ({ type: "Exterior", name: f })),
    ...property.locationFeatures.map((f) => ({ type: "Location", name: f })),
    ...property.generalFeatures.map((f) => ({ type: "General", name: f })),
  ]

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 mb-4 print:hidden">
        <Button onClick={handleDownloadPDF} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button onClick={handleDownloadImage} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download JPG
        </Button>
      </div>

      {/* Letter size container (8.5" x 11") */}
      <div
        ref={brochureRef}
        className="w-full max-w-[215.9mm] bg-white shadow-lg mx-auto overflow-hidden"
        style={{
          pageBreakAfter: "always",
          printColorAdjust: "exact",
        }}
      >
        {/* Hero Section */}
        <div className="relative">
          <div className="w-full h-[120mm] relative">
            <Image
              src={property.images[0] || "/placeholder.svg?height=600&width=1200"}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
          </div>

          {/* Property Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 text-white p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                <p className="text-gray-200 text-sm">{property.address}</p>
              </div>
              <h1 className="text-4xl font-bold mb-2">{property.title}</h1>
              <div className="flex justify-between items-end">
                <div className="flex gap-4">
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-1" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-1" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center">
                    <SquareFoot className="h-5 w-5 mr-1" />
                    <span>{property.sqft} sqft</span>
                  </div>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(Number(property.price))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="col-span-1">
              {/* Gallery */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {[1, 2, 3, 4].map((_, index) => (
                  <div key={index} className="relative aspect-square w-full">
                    <Image
                      src={property.images[index + 1] || "/placeholder.svg?height=300&width=400"}
                      alt={`Property image ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                ))}
              </div>

              {/* Broker Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src="/placeholder.svg?height=200&width=200"
                      alt={property.createdBy.name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{property.createdBy.name}</h2>
                    <p className="text-gray-600 text-sm">Broker</p>
                  </div>
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="text-gray-700">416.390.2932 (cell)</p>
                  <p className="text-gray-700">1.888.382.1920 (office)</p>
                  <p className="text-gray-700">{property.createdBy.email}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-2">
              {/* Property Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-gray-800">Property Overview</h2>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>

              {/* Property Highlights */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-gray-800">Property Highlights</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-800 mb-1">Location</h3>
                    <p className="text-sm text-gray-700">
                      {property.city}, {property.country}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <h3 className="font-semibold text-green-800 mb-1">Property Type</h3>
                    <p className="text-sm text-gray-700">
                      {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <h3 className="font-semibold text-amber-800 mb-1">Year Built</h3>
                    <p className="text-sm text-gray-700">2023</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <h3 className="font-semibold text-purple-800 mb-1">Parking</h3>
                    <p className="text-sm text-gray-700">{property.parking} Spaces</p>
                  </div>
                </div>
              </div>

              {/* Room Specifications */}
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3 text-gray-800">Room Dimensions</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {roomSpecs.slice(0, 8).map((spec, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-100 py-1">
                      <span className="text-gray-700 text-sm font-medium">{spec.name || "Room"}</span>
                      <span className="text-gray-600 text-sm">{spec.dimensions}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h2 className="text-xl font-bold mb-3 text-gray-800">Features</h2>
                <div className="grid grid-cols-2 gap-x-8 mb-3 gap-y-1">
                  {allFeatures.slice(0, 10).map((feature, index) => (
                    <div key={`feature-${index}`} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      <span className="text-gray-700 text-sm">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Footer with Agency Info */}
            <div className="border-t border-gray-200 p-4 flex justify-between items-center bg-white">
              <div className="flex items-center">
                <div className="relative h-12 w-24 mr-4">
                  <Image src="/placeholder.svg?height=100&width=200" alt="Agency Logo" fill className="object-contain" />
                </div>
                <div className="text-xs text-gray-600">
                  <p className="font-medium">Prudential Real Estate</p>
                  <p>932 Broadview Avenue, {property.city}</p>
                  <p>{property.zipCode}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image src="/placeholder.svg?height=50&width=50" alt="Realtor logo" fill className="object-contain" />
                </div>
                <div className="relative h-10 w-10">
                  <Image
                    src="/placeholder.svg?height=50&width=50"
                    alt="Equal housing logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500 max-w-[200px]">
                <p>Information presented should be verified through independent inspection</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

