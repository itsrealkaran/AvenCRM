import type React from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const propertyTypes = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
]

const zoningTypes = [
  { value: "c1", label: "C1 Local Commercial" },
  { value: "c2", label: "C2 General Commercial" },
  { value: "c3", label: "C3 Highway Commercial" },
  { value: "c4", label: "C4 Shopping Centre Commercial" },
  { value: "l1", label: "L1 Light Industrial" },
  { value: "l2", label: "L2 General Industrial" },
  { value: "m1", label: "M1 Mixed Use" },
  { value: "r1", label: "R1 Residential Single" },
  { value: "r2", label: "R2 Residential Multiple Family" },
  { value: "a1", label: "A1 Agriculture" },
  { value: "a2", label: "A2 Agriculture Residential" },
  { value: "park", label: "Park and Open Space" },
  { value: "re", label: "RE Residential Estate" },
  { value: "ur", label: "UR Urban Reserve" },
  { value: "h", label: "H Historical" },
  { value: "cd", label: "CD Comprehensive Development" },
  { value: "os", label: "OS Open Space" },
  { value: "t1", label: "T1 Transit Oriented" },
  { value: "pud", label: "PUD Planned Unit Development" },
  { value: "other", label: "Other" },
]

const listingTypes = [
  { value: "for_sale", label: "For Sale" },
  { value: "for_rent", label: "For Rent" },
]

const Step1BasicInfo: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      updateFormData({ images: Array.from(e.target.files) })
    }
  }

  const removeImage = (index: number) => {
    updateFormData({
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 mb-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select
            onValueChange={(value) => updateFormData({ propertyType: value })}
            value={formData.propertyType}
            className="w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select property type" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="zoningType">Zoning Type</Label>
          <Select
            onValueChange={(value) => updateFormData({ zoningType: value })}
            value={formData.zoningType}
            className="w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select zoning type" />
            </SelectTrigger>
            <SelectContent>
              {zoningTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="listingType">Listing Type</Label>
          <Select
            onValueChange={(value) => updateFormData({ listingType: value })}
            value={formData.listingType}
            className="w-full"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select listing type" />
            </SelectTrigger>
            <SelectContent>
              {listingTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="images">Upload Images</Label>
        <Input id="images" type="file" accept="image/*" multiple onChange={handleFileChange} />
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="grid grid-cols-3 gap-4">
            {formData.images.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file) || "/placeholder.svg"}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded-md"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 bg-white rounded-full p-1"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default Step1BasicInfo

