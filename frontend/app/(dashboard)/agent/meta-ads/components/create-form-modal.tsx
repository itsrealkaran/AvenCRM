import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"

interface CreateFormModalProps {
  open: boolean
  onClose: () => void
  onCreateForm: (form: Form) => void
}

export interface FormField {
  name: string
  type: "text" | "email" | "number"
  required: boolean
}

export interface Form {
  id: string
  name: string
  status: "Active" | "Inactive"
  fields: FormField[]
  submissions: number
  createdAt: string
}

export function CreateFormModal({ open, onClose, onCreateForm }: CreateFormModalProps) {
  const [formName, setFormName] = useState("")
  const [fields, setFields] = useState<FormField[]>([
    { name: "Name", type: "text", required: true },
    { name: "Email", type: "email", required: true },
  ])
  const [newFieldName, setNewFieldName] = useState("")
  const [newFieldType, setNewFieldType] = useState<"text" | "email" | "number">("text")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const addField = () => {
    if (newFieldName.trim()) {
      setFields([...fields, { name: newFieldName, type: newFieldType, required: false }])
      setNewFieldName("")
      setNewFieldType("text")
    }
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const toggleRequired = (index: number) => {
    setFields(fields.map((field, i) => (i === index ? { ...field, required: !field.required } : field)))
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formName.trim()) newErrors.name = "Form name is required"
    if (fields.length < 2) newErrors.fields = "At least two fields are required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const newForm: Form = {
        id: Date.now().toString(),
        name: formName,
        status: "Active",
        fields,
        submissions: 0,
        createdAt: new Date().toISOString(),
      }
      onCreateForm(newForm)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="form-name">Form Name</Label>
            <Input
              id="form-name"
              placeholder="Enter form name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label>Form Fields</Label>
            <div className="border rounded-lg p-4 space-y-4">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>
                    {field.name} ({field.type})
                  </span>
                  <div className="space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleRequired(index)}>
                      {field.required ? "Required" : "Optional"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeField(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex space-x-2">
                <Input
                  placeholder="New field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                />
                <select
                  className="border rounded px-2"
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as "text" | "email" | "number")}
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="number">Number</option>
                </select>
                <Button onClick={addField}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {errors.fields && <p className="text-sm text-red-500">{errors.fields}</p>}
          </div>
          <Button className="w-full bg-[#5932EA] hover:bg-[#5932EA]/90" onClick={handleSubmit}>
            Create Form
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

