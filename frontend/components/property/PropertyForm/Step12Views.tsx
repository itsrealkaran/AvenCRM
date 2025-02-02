import type React from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const views = [
  "Canal",
  "Great",
  "Beach",
  "City",
  "Desert",
  "Road View",
  "Partial Lake",
  "Stadium",
  "Ocean",
  "Community",
  "Courtyard",
  "Golf Course",
  "Marina",
  "Partial Marina",
  "Community View",
  "Sunrise",
  "Sunset",
  "Road View",
  "Partial Golf Course",
  "Race Course",
  "Park",
  "Stadium",
]

const Step12Views: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()

  const toggleView = (view: string) => {
    const updatedViews = formData.views?.includes(view)
      ? formData.views.filter((v) => v !== view)
      : [...(formData.views || []), view]
    updateFormData({ views: updatedViews })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Views</h3>
        <p className="text-sm text-muted-foreground">Select all views that apply to this property.</p>
      </div>
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="grid grid-cols-2 gap-4">
          {views.map((view) => {
            const isSelected = formData.views?.includes(view)
            return (
              <Button
                key={view}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={`justify-start ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => toggleView(view)}
              >
                {isSelected && <Check className="mr-2 h-4 w-4" />}
                {view}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Step12Views

