import type React from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const utilities = [
  "High Speed Internet",
  "CATV cable",
  "Energy Backup Unit",
  "Heating-Block",
  "Gas-Natural",
  "Open fire",
  "Satellite",
  "Security Surveillance",
  "Wheelchair Accessible",
  "Heating-Liquid Gas",
  "Solar Heating",
  "Water Booster",
  "Central Air",
  "Geothermal Energy",
  "Jacuzzi",
  "Security-System",
  "Water-Autonome",
  "Electrical generator",
  "Gymnasium",
  "Lift-Elevator",
  "Security Alarm",
  "Water-tank",
]

const Step5Utilities: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()

  const toggleUtility = (utility: string) => {
    const updatedUtilities = formData.utilities?.includes(utility)
      ? formData.utilities.filter((u) => u !== utility)
      : [...(formData.utilities || []), utility]
    updateFormData({ utilities: updatedUtilities })
  }

  return (
    <div className="space-y-4">
    <div>
      <h3 className="text-lg font-medium">Utilities</h3>
      <p className="text-sm text-muted-foreground">Select all utilities that apply to this property.</p></div>
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="grid grid-cols-2 gap-4">
          {utilities.map((utility) => {
            const isSelected = formData.utilities?.includes(utility)
            return (
              <Button
                key={utility}
                type="button"
                variant={isSelected ? "default" : "outline"}
                className={`justify-start ${isSelected ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => toggleUtility(utility)}
              >
                {isSelected && <Check className="mr-2 h-4 w-4" />}
                {utility}
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

export default Step5Utilities

