import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Form } from "./create-form-modal"

interface SelectFormModalProps {
  open: boolean
  onClose: () => void
  onSelectForm: (form: Form) => void
  forms: Form[]
}

export function SelectFormModal({ open, onClose, onSelectForm, forms }: SelectFormModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredForms = forms.filter((form) => form.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select a Form</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Search forms..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <div className="max-h-[300px] overflow-y-auto space-y-2">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                onClick={() => onSelectForm(form)}
              >
                <div>
                  <h3 className="font-medium">{form.name}</h3>
                  <p className="text-sm text-gray-500">{form.fields.length} fields</p>
                </div>
                <Button variant="outline" size="sm">
                  Select
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

