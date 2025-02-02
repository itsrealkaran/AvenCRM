import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import Step1BasicInfo from "./PropertyForm/Step1BasicInfo"
import Step2Details from "./PropertyForm/Step2Details"
import Step3Location from "./PropertyForm/Step3Location"
import Step4Rooms from "./PropertyForm/Step4Rooms"
import Step5Utilities from "./PropertyForm/Step5Utilities"
import Step6InteriorFeatures from "./PropertyForm/Step6InteriorFeatures"
import Step7ExteriorFeatures from "./PropertyForm/Step7ExteriorFeatures"
import Step8ExteriorType from "./PropertyForm/Step8ExteriorType"
import Step9BuildingDevelopmentFeatures from "./PropertyForm/Step9BuildingDevelopmentFeatures"
import Step10LocationFeatures from "./PropertyForm/Step10LocationFeatures"
import Step11GeneralFeatures from "./PropertyForm/Step11GeneralFeatures"
import Step12Views from "./PropertyForm/Step12Views"
import LastDocuments from "./PropertyForm/LastDocuments"

interface PropertyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (property: any) => void
  propertyToEdit?: any // Add this prop for editing
}

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({ isOpen, onClose, onSubmit, propertyToEdit }) => {
  const [step, setStep] = useState(1)
  const { formData, updateFormData } = usePropertyForm()

  useEffect(() => {
    if (propertyToEdit) {
      updateFormData(propertyToEdit)
    }
  }, [propertyToEdit, updateFormData])

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, 13))
  }

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    // Get the complete form data
    const completeFormData = {
      ...formData,
      images: formData.images.map((file) => file.name), // Convert File objects to file names
      documents: formData.documents.map((file) => file.name), // Convert File objects to file names
    }

    // Create card-related data
    const cardData = {
      id: formData.id || String(Date.now()), // Use existing id or generate a new one
      title: formData.propertyName || "",
      address: `${formData.addressLine}, ${formData.city}, ${formData.zipCode}`,
      price: Number.parseFloat(formData.price) || 0,
      isVerified: false, // Assuming new properties are not verified by default
      image: formData.images.length > 0 ? URL.createObjectURL(formData.images[0]) : undefined,
      beds: Number.parseInt(formData.bedrooms) || 0,
      baths: Number.parseInt(formData.bathrooms) || 0,
      sqft: Number.parseInt(formData.sqft) || 0,
      parking: Number.parseInt(formData.parking) || 0,
      agent: {
        name: "Jenny Wilson", // You might want to replace this with actual agent data
        image: "/placeholder.svg?height=32&width=32",
      },
    }

    // Console log both objects
    console.log("Complete Form Data:", completeFormData)
    console.log("Card Data:", cardData)

    // Call the onSubmit prop with the card data
    onSubmit(cardData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {propertyToEdit ? "Edit" : "Add New"} Property - Step {step} of 13
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && <Step1BasicInfo />}
          {step === 2 && <Step2Details />}
          {step === 3 && <Step3Location />}
          {step === 4 && <Step4Rooms />}
          {step === 5 && <Step5Utilities />}
          {step === 6 && <Step6InteriorFeatures />}
          {step === 7 && <Step7ExteriorFeatures />}
          {step === 8 && <Step8ExteriorType />}
          {step === 9 && <Step9BuildingDevelopmentFeatures />}
          {step === 10 && <Step10LocationFeatures />}
          {step === 11 && <Step11GeneralFeatures />}
          {step === 12 && <Step12Views />}
          {step === 13 && <LastDocuments />}
        </form>
        <DialogFooter>
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {step < 13 ? (
            <Button type="button" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white">
              {propertyToEdit ? "Update" : "Submit"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PropertyFormModal

