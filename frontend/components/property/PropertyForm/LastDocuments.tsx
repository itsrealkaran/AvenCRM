import type React from "react"
import { usePropertyForm } from "@/contexts/PropertyFormContext"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { X, ExternalLink } from "lucide-react"

const LastDocuments: React.FC = () => {
  const { formData, updateFormData } = usePropertyForm()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      updateFormData({ documents: Array.from(e.target.files) })
    }
  }

  const removeDocument = (index: number) => {
    updateFormData({
      documents: formData.documents.filter((_, i) => i !== index),
    })
  }

  const openDocument = (file: File) => {
    const url = URL.createObjectURL(file)
    window.open(url, "_blank")
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="documents">Upload Documents</Label>
        <Input id="documents" type="file" multiple onChange={handleFileChange} />
        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
          <ul className="space-y-2">
            {formData.documents.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <span className="truncate max-w-[200px]">{file.name}</span>
                <div className="flex items-center space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => openDocument(file)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDocument(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </div>
  )
}

export default LastDocuments

