import type React from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const exteriorTypes = [
  "Brick",
  "Concrete",
  "Glass Siding",
  "Insulated",
  "Prefabricated",
  "Siding",
  "Drywall",
  "Flat Roof",
  "Mosaic",
  "Stone",
  "Wood",
  "Skeleton",
  "Travertine",
  "Mixed",
  "Marble",
]

const Step8ExteriorType: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()

  const toggleExteriorType = (type: string) => {
    const updatedTypes = formData.exteriorTypes?.includes(type)
      ? formData.exteriorTypes.filter((t) => t !== type)
      : [...(formData.exteriorTypes || []), type]
    updateFormData({ exteriorTypes: updatedTypes })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Exterior Type</h3>
        <p className="text-sm text-muted-foreground">Select all exterior types that apply to this property.</p>
      </div>
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="grid grid-cols-2 gap-4">
          {exteriorTypes.map((type) => {
            const isSelected = formData.exteriorTypes?.includes(type)
            return (
              <Button
                key={type}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={`justify-start ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => toggleExteriorType(type)}
              >
                {isSelected && <Check className="mr-2 h-4 w-4" />}
                {type}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Step8ExteriorType

