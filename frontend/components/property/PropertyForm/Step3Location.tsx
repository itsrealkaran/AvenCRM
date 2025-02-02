import type React from "react"
import { useEffect, useRef, useState } from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"
import Script from "next/script"

declare global {
  interface Window {
    google: any
  }
}

const Step3Location: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    updateFormData({ [name]: value })
  }

  const initMap = () => {
    if (mapRef.current && !map) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 0, lng: 0 },
        zoom: 2,
      })
      setMap(newMap)

      newMap.addListener("click", (e: google.maps.MapMouseEvent) => {
        const lat = e.latLng?.lat()
        const lng = e.latLng?.lng()
        if (lat && lng) {
          updateFormData({ latitude: lat.toString(), longitude: lng.toString() })
          updateMarker(lat, lng)
        }
      })
    }
  }

  const updateMarker = (lat: number, lng: number) => {
    if (map) {
      if (marker) {
        marker.setPosition({ lat, lng })
      } else {
        const newMarker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
        })
        setMarker(newMarker)
      }
      map.panTo({ lat, lng })
    }
  }

  const handleGeocoding = async () => {
    setIsLoading(true)
    const address = `${formData.addressLine}, ${formData.streetName}, ${formData.city}, ${formData.zipCode}, ${formData.country}`
    const geocoder = new window.google.maps.Geocoder()

    try {
      const result = await new Promise<google.maps.GeocoderResult>((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            resolve(results[0])
          } else {
            reject(new Error("Geocoding failed"))
          }
        })
      })

      const { lat, lng } = result.geometry.location
      updateFormData({
        latitude: lat().toString(),
        longitude: lng().toString(),
        googleMapsLink: `https://www.google.com/maps/search/?api=1&query=${lat()},${lng()}`,
      })
      updateMarker(lat(), lng())
    } catch (error) {
      console.error("Geocoding error:", error)
      // Handle error (e.g., show a notification to the user)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap()
    }
  }, [window.google]) // Added window.google to dependencies

  useEffect(() => {
    if (map && formData.latitude && formData.longitude) {
      const lat = Number.parseFloat(formData.latitude)
      const lng = Number.parseFloat(formData.longitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        updateMarker(lat, lng)
      }
    }
  }, [map, formData.latitude, formData.longitude])

  return (
    <div className="flex space-x-4">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places`}
        onLoad={initMap}
      />
      {/* Left Section */}
      <div className="w-1/2 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="addressLine">Address Line</Label>
          <Input
            id="addressLine"
            name="addressLine"
            value={formData.addressLine || ""}
            onChange={handleInputChange}
            placeholder="Enter address line"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="streetName">Street Name</Label>
          <Input
            id="streetName"
            name="streetName"
            value={formData.streetName || ""}
            onChange={handleInputChange}
            placeholder="Enter street name"
          />
        </div>
        <div className="flex space-x-2">
          <div className="w-2/3 space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </div>
          <div className="w-1/3 space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode || ""}
              onChange={handleInputChange}
              placeholder="Enter zip code"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={formData.country || ""}
            onChange={handleInputChange}
            placeholder="Enter country"
          />
        </div>
        <Button
          onClick={handleGeocoding}
          disabled={isLoading}
          className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        >
          {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
          Find on Map
        </Button>
      </div>

      {/* Right Section */}
      <div className="w-1/2 space-y-4">
        <div ref={mapRef} className="w-full h-[300px] rounded-md overflow-hidden" />
        <div className="flex space-x-2">
          <div className="w-1/2 space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              name="latitude"
              value={formData.latitude || ""}
              onChange={handleInputChange}
              placeholder="Latitude"
              readOnly
            />
          </div>
          <div className="w-1/2 space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              name="longitude"
              value={formData.longitude || ""}
              onChange={handleInputChange}
              placeholder="Longitude"
              readOnly
            />
          </div>
        </div>
        {formData.googleMapsLink && (
          <div className="space-y-2">
            <Label htmlFor="googleMapsLink">Google Maps Link</Label>
            <Input id="googleMapsLink" name="googleMapsLink" value={formData.googleMapsLink || ""} readOnly />
          </div>
        )}
      </div>
    </div>
  )
}

export default Step3Location

