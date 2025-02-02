import type React from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const generalFeatures = [
  "First Owner",
  "Renovated",
  "Needs Redevelopment",
  "Needs Renovation",
  "To Be Renovated",
  "Unfinished",
  "Partially Furnished",
  "Unfurnished",
  "Detached House",
  "Semi-Detached House",
  "Redeveloped",
  "Shell And Core",
  "Storage Area",
  "Townhouse",
  "Semi-Finished",
  "Furnished",
  "Suitable for Commercial Use",
  "Finished",
]

const Step11GeneralFeatures: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()

  const toggleFeature = (feature: string) => {
    const updatedFeatures = formData.generalFeatures?.includes(feature)
      ? formData.generalFeatures.filter((f) => f !== feature)
      : [...(formData.generalFeatures || []), feature]
    updateFormData({ generalFeatures: updatedFeatures })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">General Features</h3>
        <p className="text-sm text-muted-foreground">Select all general features that apply to this property.</p>
      </div>
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="grid grid-cols-2 gap-4">
          {generalFeatures.map((feature) => {
            const isSelected = formData.generalFeatures?.includes(feature)
            return (
              <Button
                key={feature}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={`justify-start ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => toggleFeature(feature)}
              >
                {isSelected && <Check className="mr-2 h-4 w-4" />}
                {feature}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Step11GeneralFeatures

