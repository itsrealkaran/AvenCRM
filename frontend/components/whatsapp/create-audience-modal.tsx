import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus } from "lucide-react"
import type { AudienceGroup } from "./audience-list"
import { Badge } from "@/components/ui/badge"

interface CreateAudienceModalProps {
  open: boolean
  onClose: () => void
  onCreateAudience: (audience: AudienceGroup) => void
  editingAudience?: AudienceGroup | null
}

export function CreateAudienceModal({ open, onClose, onCreateAudience, editingAudience }: CreateAudienceModalProps) {
  const [name, setName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([])
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (editingAudience) {
      setName(editingAudience.name)
      setPhoneNumbers(editingAudience.phoneNumbers)
    } else {
      setName("")
      setPhoneNumbers([])
    }
  }, [editingAudience])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!name.trim()) newErrors.name = "Audience name is required"
    if (phoneNumbers.length === 0) newErrors.phoneNumbers = "At least one phone number is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddPhoneNumber = () => {
    if (phoneNumber.trim() && !phoneNumbers.includes(phoneNumber.trim())) {
      setPhoneNumbers([...phoneNumbers, phoneNumber.trim()])
      setPhoneNumber("")
    }
  }

  const handleRemovePhoneNumber = (number: string) => {
    setPhoneNumbers(phoneNumbers.filter((n) => n !== number))
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const audienceData: AudienceGroup = {
        id: editingAudience?.id || Date.now().toString(),
        name,
        phoneNumbers,
        createdAt: editingAudience?.createdAt || new Date().toISOString(),
      }
      onCreateAudience(audienceData)
      onClose()
      setName("")
      setPhoneNumbers([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div>
          <DialogTitle className="flex items-center text-lg">
            {editingAudience ? "Edit Audience Group" : "Create Audience Group"}
          </DialogTitle>
          <DialogDescription>Create a new audience group for your WhatsApp campaigns</DialogDescription>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Audience Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter audience name"
              className="col-span-3"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Add Phone Number</Label>
            <div className="flex gap-2">
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="flex-grow"
              />
              <Button onClick={handleAddPhoneNumber} type="button" className="bg-[#5932EA] hover:bg-[#5932EA]/90">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="mb-2 block">Phone Numbers</Label>
            <ScrollArea className="h-[150px] w-full border rounded-md p-2">
              {phoneNumbers.map((number) => (
                <div key={number} className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded">
                  <Badge variant="secondary" className="font-mono">
                    {number}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleRemovePhoneNumber(number)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </ScrollArea>
            {errors.phoneNumbers && <p className="text-sm text-red-500 mt-1">{errors.phoneNumbers}</p>}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSubmit} className="bg-[#5932EA] hover:bg-[#5932EA]/90">
            {editingAudience ? "Update Audience" : "Create Audience"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

